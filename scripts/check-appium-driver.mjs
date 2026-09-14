import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const expectedVersion = '8.7.0';
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const driverPackagePath = path.join(
  projectRoot,
  'node_modules',
  'appium-uiautomator2-driver',
  'package.json',
);

let driver;
try {
  driver = JSON.parse(readFileSync(driverPackagePath, 'utf8'));
} catch {
  throw new Error(
    `UiAutomator2 ${expectedVersion} is not installed. Run npm ci to install the locked dependencies.`,
  );
}

if (driver.version !== expectedVersion) {
  throw new Error(
    `Expected UiAutomator2 ${expectedVersion}; found ${driver.version}.`,
  );
}

console.log(`UiAutomator2 ${expectedVersion} npm dependency is installed.`);
