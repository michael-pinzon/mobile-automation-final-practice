import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const expectedVersion = '8.7.0';
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const appiumEntryPoint = path.join(projectRoot, 'node_modules', 'appium', 'index.js');
const output = execFileSync(
  process.execPath,
  [appiumEntryPoint, 'driver', 'list', '--installed', '--json'],
  {encoding: 'utf8'},
);
const installedDrivers = JSON.parse(output);
const driver = installedDrivers.uiautomator2;

if (!driver || driver.version !== expectedVersion) {
  const actualVersion = driver?.version ?? 'not installed';
  throw new Error(
    `Expected UiAutomator2 ${expectedVersion}; found ${actualVersion}. `
      + 'Run npm run appium:install.',
  );
}

console.log(`UiAutomator2 ${expectedVersion} is installed and available to Appium.`);
