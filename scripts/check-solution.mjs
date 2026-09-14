import {execFileSync} from 'node:child_process';
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
const binaryFiles = files.filter(file => file.toLowerCase().endsWith('.apk'));

const errors = [];
if (missingFiles.length > 0) {
  errors.push(`Missing solution files: ${missingFiles.join(', ')}`);
}
if (binaryFiles.length > 0) {
  errors.push(`APK binaries are not allowed in the repository: ${binaryFiles.join(', ')}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Solution check passed: ${files.length} tracked files; required files are present and no APK binaries are tracked.`,
  );
}
