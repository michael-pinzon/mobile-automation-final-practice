import path from 'node:path';

const defaultApkPath = path.resolve(
  process.cwd(),
  'apps/android/wdio-native-demo-app-2.2.0.apk',
);

const appPath = path.resolve(
  process.env.ANDROID_APP_PATH ?? defaultApkPath,
);

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
  specs: ['./tests/specs/**/*.spec.ts'],
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
  tsConfigPath: './tsconfig.json',
};
