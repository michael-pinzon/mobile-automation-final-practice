# Mobile Automation Final Practice

This repository contains the Android automation foundation for the WebdriverIO Native Demo App exercise. The test runner uses WebdriverIO 9, Appium 3, UiAutomator2 and TypeScript.

## Prerequisites

- Node.js `24.20.0` (the version in `.nvmrc`) and npm 10 or newer.
- Java 17 or newer.
- Android SDK with `platform-tools` on `PATH` (`adb` must be available).
- An Android emulator or a physical Android device with USB debugging enabled.

Install the JavaScript dependencies with the lockfile:

```bash
npm ci
```

The UiAutomator2 driver is pinned as an npm dependency and is discovered by the local Appium binary. Verify that Appium can see it:

```bash
npm run appium:check
```

## Demo application

The download script targets the official WebdriverIO Native Demo App release `v2.2.0` and verifies its expected byte size and SHA-256 digest before making the APK available to the runner. The binary is ignored by Git.

```bash
npm run apk:download
```

Use `npm run apk:download -- --force` only when intentionally replacing an existing download. The APK is written to `apps/android/wdio-native-demo-app-2.2.0.apk`.

## Running the suite

Connect or start an Android target, ensure `adb devices` lists it, download the APK and run:

```bash
npm test
```

The default device name is `Android Emulator`. Override it when needed:

```bash
ANDROID_DEVICE_NAME="Pixel_8_API_35" npm test
```

On Windows PowerShell, use `$env:ANDROID_DEVICE_NAME = 'Pixel_8_API_35'` before running `npm test`. Set `ANDROID_UDID` to target a specific device and `ANDROID_APP_PATH` to use a different local APK.

## Checks

```bash
npm run typecheck
```

Scenario specifications belong under `tests/specs`; shared fixtures and page objects can be added under `tests/support` as the exercise progresses.
