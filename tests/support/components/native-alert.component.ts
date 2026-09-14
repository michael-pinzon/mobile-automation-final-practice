import {browser, expect, $} from '@wdio/globals';
import {MOBILE_WAIT_TIMEOUT} from '../page-objects/base.page.js';

const ALERT_TITLE_SELECTOR =
  '//*[@resource-id="android:id/alertTitle" or @resource-id="com.wdiodemoapp:id/alert_title" or (@class="android.widget.TextView" and contains(@text,"Signed Up"))]';
const ALERT_MESSAGE_SELECTOR = '//*[@resource-id="android:id/message"]';
const ALERT_OK_BUTTON_SELECTOR =
  '//*[@resource-id="android:id/button1" or (@class="android.widget.Button" and @text="OK")]';

class NativeAlertComponent {
  private get title() {
    return $(ALERT_TITLE_SELECTOR);
  }

  private get message() {
    return $(ALERT_MESSAGE_SELECTOR);
  }

  private button(text: string) {
    const escapedText = text.replace(/"/g, '\\"').toUpperCase();
    if (escapedText === 'OK') {
      return $(ALERT_OK_BUTTON_SELECTOR);
    }

    return $(`//android.widget.Button[@text="${escapedText}"]`);
  }

  async waitForShown(
    isShown = true,
    timeout = MOBILE_WAIT_TIMEOUT,
  ): Promise<void> {
    await this.title.waitForExist({timeout, reverse: !isShown});
  }

  async text(): Promise<string> {
    await this.waitForShown();
    return `${await this.title.getText()}\n${await this.message.getText()}`;
  }

  async assertContains(expectedText: string): Promise<void> {
    await this.waitForShown();

    await browser.waitUntil(
      async () => {
        try {
          return (await this.text()).includes(expectedText);
        } catch {
          return false;
        }
      },
      {
        timeout: MOBILE_WAIT_TIMEOUT,
        timeoutMsg: `Expected the native alert to contain: ${expectedText}`,
      },
    );

    expect(await this.text()).toContain(expectedText);
  }

  async accept(buttonText = 'OK'): Promise<void> {
    await this.button(buttonText).click();
    await this.waitForShown(false);
  }
}

export default new NativeAlertComponent();
