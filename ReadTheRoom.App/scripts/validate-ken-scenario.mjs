import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'assets', 'data', 'ken', 'ken_1_10.json');
const SUMMARY_ID_BASE = 1000;
const FINAL_CLEAR_SCENARIO_ID = 9999;
const REQUIRED_STATS = ['funds', 'mental', 'english', 'insight', 'stamina', 'relation'];

const fail = (message) => {
  throw new Error(message);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const localized = (value, pathName) => {
  assert(isRecord(value), `${pathName} must be an object`);
  assert(typeof value.ko === 'string' && value.ko.trim(), `${pathName}.ko is required`);
  assert(typeof value.en === 'string' && value.en.trim(), `${pathName}.en is required`);
};
const statChanges = (value, pathName) => {
  assert(isRecord(value), `${pathName} must be an object`);
  for (const key of Object.keys(value)) {
    assert(REQUIRED_STATS.includes(key), `${pathName}.${key} is not supported`);
    assert(typeof value[key] === 'number' && Number.isFinite(value[key]), `${pathName}.${key} must be numeric`);
  }
};

const validate = () => {
  const nodes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert(isRecord(nodes), 'Ken chunk root must be an object');
  const ids = new Set(Object.keys(nodes).map(Number));
  const referencedByChoices = [];

  for (const [key, node] of Object.entries(nodes)) {
    assert(isRecord(node), `${key} must be an object`);
    assert(String(Number(key)) === key, `${key} must be a canonical numeric ID`);
    assert(!Object.hasOwn(node, 'id'), `${key}.id must not be duplicated inside a chunk node`);
    assert(node.type === 'NORMAL' || node.type === 'SUMMARY', `${key}.type is invalid`);
    localized(node.title, `${key}.title`);
    localized(node.description, `${key}.description`);
    if (node.tip !== undefined) localized(node.tip, `${key}.tip`);
    assert(typeof node.backgroundKey === 'string' && node.backgroundKey, `${key}.backgroundKey is required`);

    if (node.type === 'SUMMARY') {
      assert(Number(key) > SUMMARY_ID_BASE, `${key} is outside the SUMMARY namespace`);
      assert(Array.isArray(node.choices) && node.choices.length === 0, `${key}.choices must be empty`);
      statChanges(node.statChanges ?? {}, `${key}.statChanges`);
      continue;
    }

    assert(Number(key) < SUMMARY_ID_BASE, `${key} is outside the episode namespace`);
    assert(Array.isArray(node.choices) && node.choices.length > 0, `${key}.choices must not be empty`);
    node.choices.forEach((choice, index) => {
      const choicePath = `${key}.choices[${index}]`;
      assert(isRecord(choice), `${choicePath} must be an object`);
      localized(choice.text, `${choicePath}.text`);
      localized(choice.feedback, `${choicePath}.feedback`);
      statChanges(choice.statChanges, `${choicePath}.statChanges`);
      assert(Number.isSafeInteger(choice.nextScenarioId) && choice.nextScenarioId > 0, `${choicePath}.nextScenarioId is invalid`);
      referencedByChoices.push({ from: Number(key), target: choice.nextScenarioId });
    });
  }

  for (let episode = 1; episode <= 10; episode += 1) {
    assert(nodes[String(episode)]?.type === 'NORMAL', `EP${String(episode).padStart(2, '0')} is missing`);
  }

  const summaryId = SUMMARY_ID_BASE + 1;
  const summary = nodes[String(summaryId)];
  assert(summary?.type === 'SUMMARY', `Stage 1 Summary ${summaryId} is missing`);
  assert(nodes['10'].choices.every((choice) => choice.nextScenarioId === summaryId), 'EP10 must lead to Summary 1001');

  for (const { from, target } of referencedByChoices) {
    assert(ids.has(target), `NORMAL ${from} references missing scenario ${target}`);
  }

  const expectedNextChunkStart = 11;
  if (summary.nextScenarioId !== undefined) {
    assert(
      summary.nextScenarioId === expectedNextChunkStart || summary.nextScenarioId === FINAL_CLEAR_SCENARIO_ID,
      `Summary 1001 must lead to ${expectedNextChunkStart}, ${FINAL_CLEAR_SCENARIO_ID}, or omit nextScenarioId`,
    );
  }

  const reachable = new Set();
  const queue = [1];
  while (queue.length) {
    const id = queue.shift();
    if (reachable.has(id) || !ids.has(id)) continue;
    reachable.add(id);
    const node = nodes[String(id)];
    node.choices.forEach((choice) => queue.push(choice.nextScenarioId));
    if (node.type === 'SUMMARY' && ids.has(node.nextScenarioId)) queue.push(node.nextScenarioId);
  }
  const unreachable = [...ids].filter((id) => !reachable.has(id));
  assert(unreachable.length === 0, `Unreachable scenarios: ${unreachable.join(', ')}`);

  return {
    nodes: ids.size,
    summaryId,
    futureTarget: ids.has(summary.nextScenarioId) ? null : summary.nextScenarioId,
  };
};

try {
  const result = validate();
  console.log(`[Pass] ken_1_10.json validation completed. Nodes: ${result.nodes}, Summary: ${result.summaryId}`);
  if (result.futureTarget) {
    console.warn(`[Info] Summary future target ${result.futureTarget} is not registered yet; runtime will show IN_PROGRESS.`);
  }
} catch (error) {
  console.error('[Fail] ken_1_10.json validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
