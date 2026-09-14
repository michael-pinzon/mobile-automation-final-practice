import {browser, expect, $} from '@wdio/globals';
import {MOBILE_WAIT_TIMEOUT} from '../page-objects/base.page.js';

export const BOTTOM_NAVIGATION_ITEMS = [
  {key: 'home', label: 'Home', screenSelector: '~Home-screen'},
  {key: 'webview', label: 'Webview', screenSelector: 'webview'},
  {key: 'login', label: 'Login', screenSelector: '~Login-screen'},
  {key: 'forms', label: 'Forms', screenSelector: '~Forms-screen'},
  {key: 'swipe', label: 'Swipe', screenSelector: '~Swipe-screen'},
  {key: 'drag', label: 'Drag', screenSelector: '~Drag-drop-screen'},
] as const;

export type BottomNavigationKey =
  (typeof BOTTOM_NAVIGATION_ITEMS)[number]['key'];

class BottomNavigationComponent {
  private item(key: BottomNavigationKey) {
    const item = this.itemDefinition(key);
    return $(`~${item.label}`);
  }

  private itemDefinition(key: BottomNavigationKey) {
    const item = BOTTOM_NAVIGATION_ITEMS.find(candidate => candidate.key === key);
    if (!item) {
      throw new Error(`Unknown bottom navigation item: ${key}`);
    }
    return item;
  }

  private async selectionState(
    key: BottomNavigationKey,
  ): Promise<boolean | undefined> {
    const tab = this.item(key);
    for (const attribute of ['selected', 'aria-selected', 'checked']) {
      const value = await tab.getAttribute(attribute);
      if (value !== null) {
        return value === 'true' || value === '1';
      }
    }
    return undefined;
  }

  private async screenIsDisplayed(key: BottomNavigationKey): Promise<boolean> {
    const selector = this.itemDefinition(key).screenSelector;
    if (selector === 'webview') {
      return $('//android.webkit.WebView').isDisplayed();
    }
    return $(selector).isDisplayed();
  }

  async waitForReady(timeout = MOBILE_WAIT_TIMEOUT): Promise<void> {
    await this.item('home').waitForDisplayed({timeout});
  }

  async open(key: BottomNavigationKey): Promise<void> {
    await this.waitForReady();
    await this.item(key).click();
    await this.waitForActive(key);
  }

  async openHome(): Promise<void> {
    await this.open('home');
  }

  async waitForActive(
    key: BottomNavigationKey,
    timeout = MOBILE_WAIT_TIMEOUT,
  ): Promise<void> {
    const tab = this.item(key);
    await tab.waitForDisplayed({timeout});

    await browser.waitUntil(
      async () => {
        try {
          const selected = await this.selectionState(key);
          const screenDisplayed = await this.screenIsDisplayed(key);
          // React Navigation exposes the selected state on Android. The
          // screen check remains the portable fallback for driver versions
          // that do not surface accessibilityState as an attribute.
          return screenDisplayed && (selected === true || selected === undefined);
        } catch {
          return false;
        }
      },
      {
        timeout,
        timeoutMsg: `Expected bottom navigation item ${key} to be active`,
      },
    );
  }

  async assertActive(key: BottomNavigationKey): Promise<void> {
    await this.waitForActive(key);
    const selected = await this.selectionState(key);
    if (selected !== undefined) {
      expect(selected).toBe(true);
    }
    expect(await this.screenIsDisplayed(key)).toBe(true);
  }
}

export default new BottomNavigationComponent();
