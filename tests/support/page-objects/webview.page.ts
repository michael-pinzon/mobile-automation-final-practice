import {browser, expect, $} from '@wdio/globals';
import {BasePage} from './base.page.js';

class WebviewPage extends BasePage {
  private readonly nativeWebviewSelector = '//android.webkit.WebView';
  private readonly nativeWebviewPackage = 'com.wdiodemoapp';

  constructor() {
    // The WebView is the complete screen and therefore has no React Native
    // accessibility id of its own.
    super('//android.webkit.WebView');
  }

  get nativeWebview() {
    return $(this.nativeWebviewSelector);
  }

  async assertKeyElements(): Promise<void> {
    const webview = this.nativeWebview;
    await webview.waitForDisplayed({timeout: 45_000});

    await browser.waitUntil(
      async () => {
        try {
          const [className, packageName, rect] = await Promise.all([
            webview.getAttribute('className'),
            webview.getAttribute('package'),
            browser.getElementRect(await webview.elementId),
          ]);

          return (
            className === 'android.webkit.WebView' &&
            packageName === this.nativeWebviewPackage &&
            Number.isFinite(rect.x) &&
            Number.isFinite(rect.y) &&
            Number.isFinite(rect.width) &&
            Number.isFinite(rect.height) &&
            rect.width > 0 &&
            rect.height > 0
          );
        } catch {
          return false;
        }
      },
      {
        timeout: 45_000,
        timeoutMsg:
          'Expected the native WebView to expose valid class, package and bounds',
      },
    );

    await expect(webview).toBeDisplayed();
    await expect(await webview.getAttribute('className')).toBe(
      'android.webkit.WebView',
    );
    await expect(await webview.getAttribute('package')).toBe(
      this.nativeWebviewPackage,
    );

    const rect = await browser.getElementRect(await webview.elementId);
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  }
}

export default new WebviewPage();
