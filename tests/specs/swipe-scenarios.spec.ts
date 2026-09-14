import {browser} from '@wdio/globals';
import BottomNavigation from '../support/components/bottom-navigation.component.js';
import SwipePage, {
  SWIPE_CARD_TITLES,
} from '../support/page-objects/swipe.page.js';

describe('Swipe section', () => {
  beforeEach(async () => {
    await browser.switchContext('NATIVE_APP');
    await BottomNavigation.waitForReady();
    await BottomNavigation.openHome();
    await BottomNavigation.open('swipe');
    await SwipePage.prepareForScenario();
  });

  it('advances through every card and reveals the hidden message', async () => {
    for (let index = 1; index < SWIPE_CARD_TITLES.length; index += 1) {
      const previousTitle = SWIPE_CARD_TITLES[index - 1];
      const currentTitle = SWIPE_CARD_TITLES[index];

      await SwipePage.assertOnlyCardVisible(previousTitle);
      await SwipePage.swipeCarousel('left');
      await SwipePage.waitForOnlyCardVisible(currentTitle);
      await SwipePage.waitForCardToDisappear(previousTitle);
    }

    await SwipePage.assertOnlyCardVisible(
      SWIPE_CARD_TITLES[SWIPE_CARD_TITLES.length - 1],
    );
    await SwipePage.revealFoundMessage();
    await SwipePage.assertFoundMessage();
  });
});
