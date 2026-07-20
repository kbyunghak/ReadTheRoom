import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'vitest';

const PROJECT_ROOT = process.cwd();

const TARGET_DIRECTORIES = ['app', 'features', 'components', 'utils'];
const TARGET_EXTENSIONS = new Set(['.ts', '.tsx']);

const IGNORED_DIRS = new Set([
  'node_modules',
  '.expo',
  'dist',
  'build',
  'coverage',
  '.git',
]);

const MOJIBAKE_PATTERNS = [
  '쨌',
  '?곹',
  '?쒕',
  '?ㅼ',
  '?λ',
  '?대',
  '?뚮',
  '?댁',
  '?덈',
  '瑜',
  '李',
  '�',
  '????',
  '??{String',
];

const collectSourceFiles = (dir: string): string[] => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        return [];
      }

      return collectSourceFiles(fullPath);
    }

    if (!entry.isFile()) {
      return [];
    }

    if (!TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      return [];
    }

    return [fullPath];
  });
};

test('UI source files do not contain known broken Korean mojibake strings', () => {
  const files = TARGET_DIRECTORIES.flatMap((directory) =>
    collectSourceFiles(path.join(PROJECT_ROOT, directory)),
  );
  const failures: string[] = [];

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');

    MOJIBAKE_PATTERNS.forEach((pattern) => {
      if (content.includes(pattern)) {
        failures.push(
          `${path.relative(PROJECT_ROOT, filePath)} contains "${pattern}"`,
        );
      }
    });
  });

  assert.deepEqual(failures, []);
});
