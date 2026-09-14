import {execFileSync} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const driverSpec = 'appium-uiautomator2-driver@8.7.0';
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const appiumEntryPoint = path.join(projectRoot, 'node_modules', 'appium', 'index.js');
const temporaryDirectory = await mkdtemp(
  path.join(os.tmpdir(), 'mobile-automation-appium-'),
);

try {
  // Installing from a directory without this project's package.json keeps
  // Appium's user-level extension registry separate from npm dependencies.
  execFileSync(
    process.execPath,
    [appiumEntryPoint, 'driver', 'install', '--source=npm', driverSpec],
    {
      cwd: temporaryDirectory,
      stdio: 'inherit',
    },
  );
} finally {
  await rm(temporaryDirectory, {recursive: true, force: true});
}
