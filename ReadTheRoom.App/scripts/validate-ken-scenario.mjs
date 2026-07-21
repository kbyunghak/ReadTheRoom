import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const KEN_SCENARIO_PATH = path.join(
  PROJECT_ROOT,
  'assets',
  'data',
  'scenarios_ken.json',
);

const REQUIRED_STATS = [
  'funds',
  'mental',
  'english',
  'insight',
  'stamina',
  'relation',
];

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const validateLocalizedText = ({ nodeId, fieldName, value }) => {
  assert(
    isRecord(value),
    `[i18n] Node ${nodeId} is missing localized field "${fieldName}".`,
  );
  assert(
    typeof value.ko === 'string' && value.ko.trim().length > 0,
    `[i18n] Node ${nodeId}.${fieldName}.ko must be a non-empty string.`,
  );
  assert(
    typeof value.en === 'string' && value.en.trim().length > 0,
    `[i18n] Node ${nodeId}.${fieldName}.en must be a non-empty string.`,
  );
};

const validateChoice = ({ nodeId, choice, index, referencedIds }) => {
  validateLocalizedText({
    nodeId,
    fieldName: `choices[${index}].text`,
    value: choice.text,
  });
  validateLocalizedText({
    nodeId,
    fieldName: `choices[${index}].feedback`,
    value: choice.feedback,
  });

  assert(
    isRecord(choice.statChanges),
    `[stat] Node ${nodeId} choice[${index}] is missing statChanges.`,
  );

  REQUIRED_STATS.forEach((statKey) => {
    assert(
      typeof choice.statChanges[statKey] === 'number',
      `[stat] Node ${nodeId} choice[${index}] missing numeric stat "${statKey}".`,
    );
  });

  assert(
    choice.nextScenarioId !== null,
    `[graph] Node ${nodeId} choice[${index}] uses null nextScenarioId. Omit the field for terminal nodes.`,
  );

  if (choice.nextScenarioId !== undefined) {
    assert(
      typeof choice.nextScenarioId === 'number',
      `[graph] Node ${nodeId} choice[${index}] nextScenarioId must be a number when present.`,
    );
    referencedIds.push({
      fromId: nodeId,
      targetId: choice.nextScenarioId,
      field: `choices[${index}].nextScenarioId`,
    });
  }
};

const validateKenScenario = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const allIds = new Set();
  const referencedIds = [];

  assert(
    isRecord(data),
    '[schema] Ken scenario root must be an object with Day{N} keys.',
  );

  Object.entries(data).forEach(([dayKey, dayNodes]) => {
    assert(
      /^Day\d+$/.test(dayKey),
      `[schema] Invalid root key "${dayKey}". Expected Day{N}.`,
    );
    assert(
      isRecord(dayNodes),
      `[schema] ${dayKey} must contain a node object keyed by scenario id.`,
    );

    Object.entries(dayNodes).forEach(([nodeKey, node]) => {
      assert(isRecord(node), `[schema] ${dayKey}.${nodeKey} must be an object.`);
      assert(
        typeof node.id === 'number',
        `[schema] ${dayKey}.${nodeKey} must include numeric id.`,
      );
      assert(
        String(node.id) === nodeKey,
        `[schema] Object key "${nodeKey}" does not match node.id ${node.id}.`,
      );
      assert(
        !allIds.has(node.id),
        `[schema] Duplicate global scenario id: ${node.id}.`,
      );
      allIds.add(node.id);

      ['title', 'description', 'tip'].forEach((fieldName) => {
        validateLocalizedText({ nodeId: node.id, fieldName, value: node[fieldName] });
      });

      if (node.type === 'SUMMARY') {
        assert(
          node.choices === undefined ||
            (Array.isArray(node.choices) && node.choices.length === 0),
          `[schema] SUMMARY node ${node.id} must omit choices or use an empty choices array.`,
        );

        assert(
          node.nextScenarioId !== null,
          `[graph] SUMMARY node ${node.id} uses null nextScenarioId. Omit the field for terminal summaries.`,
        );

        if (node.nextScenarioId !== undefined) {
          assert(
            typeof node.nextScenarioId === 'number',
            `[graph] SUMMARY node ${node.id} nextScenarioId must be a number when present.`,
          );
          referencedIds.push({
            fromId: node.id,
            targetId: node.nextScenarioId,
            field: 'nextScenarioId',
          });
        }

        return;
      }

      assert(
        node.type === 'NORMAL',
        `[schema] Node ${node.id} has unsupported type "${node.type}".`,
      );
      assert(
        Array.isArray(node.choices) && node.choices.length === 3,
        `[schema] NORMAL node ${node.id} must contain exactly 3 choices.`,
      );

      node.choices.forEach((choice, index) => {
        validateChoice({
          nodeId: node.id,
          choice,
          index,
          referencedIds,
        });
      });
    });
  });

  referencedIds.forEach(({ fromId, targetId, field }) => {
    assert(
      allIds.has(targetId),
      `[graph] Node ${fromId} ${field} references missing scenario id ${targetId}.`,
    );
  });

  return allIds.size;
};

try {
  const totalNodes = validateKenScenario(KEN_SCENARIO_PATH);
  console.log(
    `[Pass] scenarios_ken.json strict validation completed. Total nodes: ${totalNodes}`,
  );
} catch (error) {
  console.error('[Fail] scenarios_ken.json strict validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
