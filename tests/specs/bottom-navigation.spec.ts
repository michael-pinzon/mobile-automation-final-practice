import {browser} from '@wdio/globals';
import BottomNavigation, {
  BOTTOM_NAVIGATION_ITEMS,
} from '../support/components/bottom-navigation.component.js';
import DragPage from '../support/page-objects/drag.page.js';
import FormsPage from '../support/page-objects/forms.page.js';
import HomePage from '../support/page-objects/home.page.js';
import LoginPage from '../support/page-objects/login.page.js';
import SwipePage from '../support/page-objects/swipe.page.js';
import WebviewPage from '../support/page-objects/webview.page.js';

const pages = {
  home: HomePage,
  webview: WebviewPage,
  login: LoginPage,
  forms: FormsPage,
  swipe: SwipePage,
  drag: DragPage,
} as const;

describe('Bottom navigation', () => {
  beforeEach(async () => {
    // Every case starts from a known native state and does not rely on the
    // previous case or on the order in which Mocha executes the examples.
    await browser.switchContext('NATIVE_APP');
    await BottomNavigation.waitForReady();
    await BottomNavigation.openHome();
  });

  for (const item of BOTTOM_NAVIGATION_ITEMS) {
    it(`opens the ${item.label} section and exposes its key elements`, async () => {
      await BottomNavigation.open(item.key);
      await BottomNavigation.assertActive(item.key);
      await pages[item.key].assertKeyElements();
    });
  }
});
