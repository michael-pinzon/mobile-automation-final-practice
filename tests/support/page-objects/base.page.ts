import {$, browser, expect} from '@wdio/globals';

export const MOBILE_WAIT_TIMEOUT = 20_000;

/**
 * Common behaviour shared by native screen objects.
 *
 * Screen objects keep selectors and synchronisation in one place so specs can
 * describe user behaviour without depending on Appium implementation details.
 */
export abstract class BasePage {
  protected constructor(public readonly screenSelector: string) {}

  get screen() {
    return $(this.screenSelector);
  }

  protected byAccessibilityId(id: string) {
    return $(`~${id}`);
  }

  protected byText(text: string) {
    // Text nodes are more reliable than reading text from an accessible
    // ScrollView, whose own `text` attribute can be empty on Android.
    const escapedText = text.replace(/"/g, '\\"');
    return $(`android=new UiSelector().textContains("${escapedText}")`);
  }

  async waitForDisplayed(timeout = MOBILE_WAIT_TIMEOUT): Promise<void> {
    await this.screen.waitForDisplayed({timeout});
  }

  async assertScreenText(text: string): Promise<void> {
    await this.waitForDisplayed();
    const textElement = this.byText(text);

    await browser.waitUntil(
      async () => {
        try {
          return (
            (await textElement.isDisplayed()) ||
            (await this.screen.getText()).includes(text)
          );
        } catch {
          return false;
        }
      },
      {
        timeout: MOBILE_WAIT_TIMEOUT,
        timeoutMsg: `Expected ${this.screenSelector} to contain text: ${text}`,
      },
    );

    const textIsDisplayed = await textElement.isDisplayed().catch(() => false);
    if (textIsDisplayed) {
      await expect(textElement).toBeDisplayed();
      return;
    }

    expect(await this.screen.getText()).toContain(text);
  }

  protected async assertElementsDisplayed(selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      await expect($(selector)).toBeDisplayed();
    }
  }

  protected async assertElementText(
    selector: string,
    text: string,
  ): Promise<void> {
    const element = $(selector);
    await element.waitForDisplayed({timeout: MOBILE_WAIT_TIMEOUT});

    await browser.waitUntil(
      async () => {
        try {
          return (await element.getText()).includes(text);
        } catch {
          return false;
        }
      },
      {
        timeout: MOBILE_WAIT_TIMEOUT,
        timeoutMsg: `Expected ${selector} to contain text: ${text}`,
      },
    );

    expect(await element.getText()).toContain(text);
  }
}
