import { spawnSync } from 'node:child_process';

const testFiles = [
  'tests/gamePersistence.test.ts',
  'tests/scenarioV2.test.ts',
  'tests/kenScenario.test.ts',
  'tests/mojibakeGuard.test.ts',
];

for (const testFile of testFiles) {
  console.log(`\nRunning ${testFile}`);

  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', testFile],
    {
      stdio: 'inherit',
      shell: false,
    },
  );

  if (result.error) {
    console.error(`Failed to start ${testFile}:`, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Test failed: ${testFile}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nAll tests passed.');
