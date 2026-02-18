using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using System.Text.Json;

namespace ReadTheRoom.Server;

public class GameMaster
{
    private readonly ILogger<GameMaster> _logger;

    public GameMaster(ILogger<GameMaster> logger)
    {
        _logger = logger;
    }

    [Function("AnalyzeChoice")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
    {
        _logger.LogInformation("Processing a request for GameMaster Analysis.");

        // 1. Read Request Body
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

        string userChoice = "";
        string targetLang = "Korean"; // Default language

        try
        {
            // Parse JSON safely
            var data = JsonSerializer.Deserialize<JsonElement>(requestBody);

            // Get 'choice' (Required)
            if (data.TryGetProperty("choice", out JsonElement choiceElement))
            {
                userChoice = choiceElement.GetString();
            }
            else
            {
                return new BadRequestObjectResult("Missing 'choice' property in JSON body.");
            }

            // Get 'lang' (Optional - e.g., "English", "Korean")
            if (data.TryGetProperty("lang", out JsonElement langElement))
            {
                targetLang = langElement.GetString();
            }
        }
        catch (JsonException)
        {
            return new BadRequestObjectResult("Invalid JSON format.");
        }

        // 2. Setup OpenAI Client
        string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("API Key is missing in environment variables.");
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }

        ChatClient client = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);

        // 3. Construct System Prompt (Instructions)            
        // Instructs the AI to output strictly in JSON format.
        var options = new ChatCompletionOptions()
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
        };

        var messages = new List<ChatMessage>
            {
                new SystemChatMessage($@"
                    You are the Game Master of a text-based survival game called 'Read the Room'.
                    Analyze the user's choice based on social context and return the result in JSON format.
                    
                    INPUT CONTEXT:
                    - User Choice: The action the player took.
                    - Language: {targetLang} (The 'narrative' must be written in this language).

                    OUTPUT JSON FORMAT:
                    {{
                        ""narrative"": ""(A short reaction sentence describing the outcome in {targetLang})"",
                        ""hp_change"": (Integer between -20 and +20 based on the quality of the choice),
                        ""is_game_over"": (boolean, true if hp_change is below -15)
                    }}
                "),
                new UserChatMessage($"User Choice: {userChoice}")
            };

        // 4. Call OpenAI API
        try
        {
            ChatCompletion completion = await client.CompleteChatAsync(messages, options);
            return new OkObjectResult(completion.Content[0].Text);
        }
        catch (Exception ex)
        {
            _logger.LogError($"OpenAI API Error: {ex.Message}");
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }
}