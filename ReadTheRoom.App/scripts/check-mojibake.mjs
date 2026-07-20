import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');

const ROOTS = [
  'README.md',
  'docs',
  path.join('ReadTheRoom.App', 'app'),
  path.join('ReadTheRoom.App', 'components'),
  path.join('ReadTheRoom.App', 'domain'),
  path.join('ReadTheRoom.App', 'features'),
  path.join('ReadTheRoom.App', 'locales'),
  path.join('ReadTheRoom.App', 'shared'),
  path.join('ReadTheRoom.App', 'utils'),
  path.join('ReadTheRoom.App', 'assets', 'data'),
  path.join('ReadTheRoom.App', 'tests'),
];

const EXTENSIONS = new Set([
  '.md',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.json',
  '.yml',
  '.yaml',
]);

const IGNORED_DIRS = new Set([
  '.git',
  '.expo',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'archive',
  'backup',
]);

const IGNORED_FILES = new Set([
  'docs/encoding-policy.md',
  'docs/release-checklist.md',
  'ReadTheRoom.App/tests/mojibakeGuard.test.ts',
  'ReadTheRoom.App/scripts/check-mojibake.mjs',
]);

const SUSPICIOUS_PATTERNS = [
  '\uFFFD',
  '占쏙옙',
  '占?',
  '夷?',
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
  '????',
  '??{String',
];

const toRepoPath = (absolutePath) =>
  path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/');

const shouldInspectFile = (absolutePath) => {
  const repoPath = toRepoPath(absolutePath);

  if (IGNORED_FILES.has(repoPath)) {
    return false;
  }

  if (repoPath.endsWith('.bak')) {
    return false;
  }

  if (repoPath === 'README.md') {
    return true;
  }

  return EXTENSIONS.has(path.extname(absolutePath));
};

const inspect = (absolutePath, failures) => {
  const stat = fs.statSync(absolutePath);

  if (stat.isDirectory()) {
    const dirName = path.basename(absolutePath);
    if (IGNORED_DIRS.has(dirName)) {
      return;
    }

    for (const name of fs.readdirSync(absolutePath)) {
      inspect(path.join(absolutePath, name), failures);
    }
    return;
  }

  if (!stat.isFile() || !shouldInspectFile(absolutePath)) {
    return;
  }

  const content = fs.readFileSync(absolutePath, 'utf8');
  const repoPath = toRepoPath(absolutePath);

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (content.includes(pattern)) {
      failures.push(`${repoPath} contains "${pattern}"`);
    }
  }
};

const failures = [];

for (const root of ROOTS) {
  const absolutePath = path.join(PROJECT_ROOT, root);
  if (fs.existsSync(absolutePath)) {
    inspect(absolutePath, failures);
  }
}

if (failures.length > 0) {
  console.error('Possible mojibake detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Mojibake check passed.');
