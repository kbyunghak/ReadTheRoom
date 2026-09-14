# Scenario chunks (Phase 1)

Production Ken/Amy/Sora currently retain legacy data. No content or save IDs
have been migrated. Empty arrays in `utils/scenarioChunkSources.ts` select
legacy; registered chunks select the new loader. Invalid chunks throw rather
than silently switching a saved game back to legacy data.

## Registering content

Create `ken/ken_1_10.json`, `ken/ken_11_20.json`, etc. Use
`<character>_<startEpisode>_<endEpisode>.json`, with ten episodes per group.
Import the JSON literally in `utils/scenarioChunkSources.ts` and add the import
to the character's array. Metro does not discover folders at runtime.
Import order does not matter. Register all referenced destinations together.
An empty directory does not activate the loader.

NORMAL top-level keys are canonical positive integer episode IDs, starting at 1.
Do not store id/episode/day/week/mainEpisode/stage in nodes. Stage is calculated
from the numeric episode ID, never from the filename. Each registered stage
must contain its ten episodes and one SUMMARY. The registry can support stages
beyond the original five-week map, including episodes 101-110.

Both node types require type, bilingual title/description, backgroundKey and
choices. NORMAL requires at least one choice with bilingual text/feedback,
nextScenarioId and optional partial statChanges. Choice type, if supplied, is
GROWTH, STABLE or REALIST. Optional bilingual tip is retained on each node.
Missing stat changes become zero only in memory. Allowed keys are funds, mental,
english, insight, stamina and relation, with finite numeric values.

## SUMMARY namespace

New SUMMARY IDs use 1,000,000 + stage number: Stage 1 uses 1000001,
Stage 2 uses 1000002. NORMAL IDs must be below 1,000,000. Legacy IDs such as
1001 are unchanged in the legacy loader; do not reinterpret legacy saves as
this new namespace without an explicit migration review.

Every choice in EP10 must point to 1000001; this summary has choices: [] and
nextScenarioId: 11 when stage 2 is registered. The final summary omits
nextScenarioId to finish. Each SUMMARY can have partial statChanges and tip.
SUMMARY is placed after the stage's episodes and is not counted as an episode.

## Runtime and compatibility

Both paths return ScenarioBundle through getScenarioBundle(characterId).
All chunks are merged before navigation validation; gameplay does not load
individual files. Computed stageNumber/episodeNumber metadata is in memory only.
Roadmap grouping uses numeric metadata; getStageLabel controls the label.
No save keys, checkpoint IDs, choice results or persistence schema change.

Before activating a character, audit ALL saved currentScenarioId, checkpoint
IDs and historical choice destinations for equivalent content. A partial new
registry does not merge legacy nodes. Phase 2 needs an explicit content and
save compatibility decision; Phase 1 tests the new path with synthetic content.

Run npm test (includes chunk validation and dual registry cases),
npm run typecheck, npm run lint, npm run validate:ken-scenario and npm run test:ken.

After all characters are migrated and saves are addressed, a separate cleanup
can remove their legacy imports/files and the fallback branch. Do not delete
createScenarioBundle or other normalizers while default/Jina/Yoon still use them.
