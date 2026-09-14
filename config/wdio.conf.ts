import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const defaultApkPath = path.join(
  projectRoot,
  'apps',
  'android',
  'wdio-native-demo-app-2.2.0.apk',
);

const configuredAppPath = process.env.ANDROID_APP_PATH;
const appPath = configuredAppPath
  ? path.resolve(projectRoot, configuredAppPath)
  : defaultApkPath;
const specsPath = path.join(projectRoot, 'tests', 'specs', '**', '*.spec.ts');
const tsConfigPath = path.join(projectRoot, 'tsconfig.json');

const androidCapability: WebdriverIO.Capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator',
  'appium:appPackage': 'com.wdiodemoapp',
  'appium:app': appPath,
  'appium:autoGrantPermissions': true,
  'appium:noReset': false,
  'appium:newCommandTimeout': 120,
  'appium:appWaitActivity': '*',
};

if (process.env.ANDROID_UDID) {
  androidCapability['appium:udid'] = process.env.ANDROID_UDID;
}

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: [specsPath],
  exclude: [],
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 2,
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: '127.0.0.1',
          port: 4723,
        },
      },
    ],
  ],
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: [androidCapability],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
  },
  tsConfigPath,
};
