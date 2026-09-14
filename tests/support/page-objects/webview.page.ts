import {browser, expect, $} from '@wdio/globals';
import {BasePage, MOBILE_WAIT_TIMEOUT} from './base.page.js';

class WebviewPage extends BasePage {
  private readonly nativeWebviewSelector = '//android.webkit.WebView';

  constructor() {
    // The WebView is the complete screen and therefore has no React Native
    // accessibility id of its own.
    super('//android.webkit.WebView');
  }

  get nativeWebview() {
    return $(this.nativeWebviewSelector);
  }

  async assertKeyElements(): Promise<void> {
    await this.nativeWebview.waitForDisplayed({timeout: 45_000});

    await browser.waitUntil(
      async () => {
        const contexts = await browser.getContexts();
        return contexts.some(context =>
          typeof context === 'string'
            ? context.startsWith('WEBVIEW')
            : context.id.startsWith('WEBVIEW'),
        );
      },
      {
        timeout: 45_000,
        timeoutMsg: 'Expected the WebdriverIO WebView context to be available',
      },
    );

    try {
      await browser.switchContext({
        title: /WebdriverIO/i,
        url: /webdriver\.io/i,
      });

      await browser.waitUntil(
        async () => {
          const url = await browser.getUrl();
          const title = await browser.getTitle();
          return /webdriver\.io/i.test(url) && /WebdriverIO/i.test(title);
        },
        {
          timeout: MOBILE_WAIT_TIMEOUT,
          timeoutMsg: 'Expected the WebdriverIO website to finish loading',
        },
      );

      await expect(await browser.getTitle()).toMatch(/WebdriverIO/i);
      await expect(await $('body').getText()).toMatch(/WebdriverIO/i);
    } finally {
      await browser.switchContext('NATIVE_APP');
    }
  }
}

export default new WebviewPage();
