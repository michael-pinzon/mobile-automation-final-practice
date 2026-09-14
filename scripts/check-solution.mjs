import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  return output
    .split('\0')
    .filter(Boolean)
    .map(file => file.replaceAll('\\', '/'));
}

const files = trackedFiles();
const requiredFiles = [
  'README.md',
  'package.json',
  'package-lock.json',
  'config/wdio.conf.ts',
  'tests/specs/bottom-navigation.spec.ts',
  'tests/specs/successful-signup.spec.ts',
  'tests/specs/successful-login.spec.ts',
  'tests/specs/swipe-scenarios.spec.ts',
];
const missingFiles = requiredFiles.filter(file => !files.includes(file));
const forbiddenFiles = files.filter(file => {
  const lowerCaseFile = file.toLowerCase();
  return (
    lowerCaseFile.endsWith('.apk') ||
    lowerCaseFile === 'mobile_automation_final_practice.md' ||
    lowerCaseFile.endsWith('/mobile_automation_final_practice.md') ||
    /(?:^|\/)(?:todo|todos|internal-plan|plan-interno)\.md$/.test(
      lowerCaseFile,
    )
  );
});
const textExtensions = new Set(['.md', '.mjs', '.ts', '.json', '.yml', '.yaml']);
const todoMarkers = [];

for (const file of files) {
  // This checker necessarily names the markers it detects; do not inspect its
  // own source when looking for those markers in the solution.
  if (file === 'scripts/check-solution.mjs') {
    continue;
  }

  if (!textExtensions.has(path.posix.extname(file).toLowerCase())) {
    continue;
  }

  const content = readFileSync(path.join(projectRoot, file), 'utf8');
  if (/\b(?:TODO|FIXME)\b/i.test(content)) {
    todoMarkers.push(file);
  }
}

const errors = [];
if (missingFiles.length > 0) {
  errors.push(`Missing solution files: ${missingFiles.join(', ')}`);
}
if (forbiddenFiles.length > 0) {
  errors.push(`Forbidden delivery files are tracked: ${forbiddenFiles.join(', ')}`);
}
if (todoMarkers.length > 0) {
  errors.push(`TODO/FIXME markers are not allowed in: ${todoMarkers.join(', ')}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Solution check passed: ${files.length} tracked files, no APK, exercise statement, or TODO markers.`,
  );
}
