import {$, $$, browser, expect} from '@wdio/globals';
import {BasePage, MOBILE_WAIT_TIMEOUT} from './base.page.js';
import {
  type GestureTarget,
  swipeWithin,
  type SwipeDirection,
} from '../helpers/gestures.js';

export const SWIPE_CARD_TITLES = [
  'FULLY OPEN SOURCE',
  'GREAT COMMUNITY',
  'JS.FOUNDATION',
  'SUPPORT VIDEOS',
  'EXTENDABLE',
  'COMPATIBLE',
] as const;

export const SWIPE_FOUND_TEXT = 'You found me!!!';

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ElementHandle = GestureTarget & {
  isDisplayed(): Promise<boolean>;
  getText(): Promise<string>;
};

const CARD_MINIMUM_VISIBLE_RATIO = 0.5;
const ACTIVE_CARD_ZONE_RATIO = 0.5;
const MAX_VERTICAL_RESET_SWIPES = 10;
const MAX_HORIZONTAL_RESET_SWIPES = SWIPE_CARD_TITLES.length;
const TRANSITION_TIMEOUT = 5_000;
const CARD_TITLE_XPATH = SWIPE_CARD_TITLES.map(
  title => `contains(@text,"${title}")`,
).join(' or ');

class SwipePage extends BasePage {
  private readonly carouselSelector =
    '//*[@resource-id="Carousel" or @content-desc="Carousel"]';
  private readonly cardSelector = '~card';
  private readonly foundMessageSelector =
    'android=new UiSelector().textContains("You found me!!!")';
  private readonly cardTitleSelector = `//*[${CARD_TITLE_XPATH}]`;

  constructor() {
    super('~Swipe-screen');
  }

  get carousel() {
    return this.carouselSelector;
  }

  private get carouselElement() {
    return $(this.carouselSelector);
  }

  private get foundMessage() {
    return $(this.foundMessageSelector);
  }

  async assertKeyElements(): Promise<void> {
    await this.assertScreenText('Swipe horizontal');
    await this.assertScreenText(
      "Or swipe vertical to find what I'm hiding.",
    );
    await this.assertScreenText('FULLY OPEN SOURCE');
    await this.assertElementsDisplayed([this.carouselSelector]);
  }

  /**
   * Brings the tab back to its initial state when another test has already
   * visited it in the same Appium session.
   */
  async prepareForScenario(): Promise<void> {
    await this.waitForDisplayed();
    await this.scrollToTop();
    await this.restoreFirstCard();
    await this.waitForOnlyCardVisible(SWIPE_CARD_TITLES[0]);
  }

  async swipeCarousel(direction: SwipeDirection = 'left'): Promise<void> {
    await swipeWithin(this.carouselElement, direction);
  }

  /**
   * Scrolls the page down through UiAutomator2's ScrollView command. This
   * targets the screen element directly so the child carousel cannot capture
   * the gesture when it overlaps the lower part of the view.
   */
  async scrollDown(): Promise<void> {
    await this.waitForDisplayed();
    await browser.execute('mobile: scrollGesture', {
      elementId: await this.screen.elementId,
      direction: 'down',
      percent: 0.75,
    });
  }

  async waitForOnlyCardVisible(
    expectedTitle: (typeof SWIPE_CARD_TITLES)[number],
    timeout = MOBILE_WAIT_TIMEOUT,
  ): Promise<void> {
    await browser.waitUntil(
      async () => {
        const carouselRect = await this.rectOf(this.carouselElement);
        const visibleCards = await this.visibleCardElements(carouselRect);
        const activeTitle = await this.activeCardTitle(
          carouselRect,
          visibleCards,
        );
        return (
          visibleCards.length === 1 &&
          activeTitle === expectedTitle
        );
      },
      {
        timeout,
        interval: 250,
        timeoutMsg: `Expected only the ${expectedTitle} Swipe card to be visible`,
      },
    );
  }

  async assertOnlyCardVisible(
    expectedTitle: (typeof SWIPE_CARD_TITLES)[number],
  ): Promise<void> {
    await this.waitForOnlyCardVisible(expectedTitle);

    const carouselRect = await this.rectOf(this.carouselElement);
    const visibleCards = await this.visibleCardElements(carouselRect);
    const activeTitle = await this.activeCardTitle(carouselRect, visibleCards);
    expect(visibleCards).toHaveLength(1);
    expect(activeTitle).toBe(expectedTitle);
  }

  async waitForCardToDisappear(
    title: (typeof SWIPE_CARD_TITLES)[number],
    timeout = MOBILE_WAIT_TIMEOUT,
  ): Promise<void> {
    await browser.waitUntil(
      async () => !(await this.cardIsVisible(title)),
      {
        timeout,
        interval: 250,
        timeoutMsg: `Expected the previous Swipe card to be hidden: ${title}`,
      },
    );
  }

  async revealFoundMessage(maxSwipes = MAX_VERTICAL_RESET_SWIPES): Promise<void> {
    await this.waitForDisplayed();

    for (let swipeNumber = 0; swipeNumber < maxSwipes; swipeNumber += 1) {
      if (await this.foundMessageIsVisible()) {
        return;
      }

      await this.scrollDown();
      const revealed = await this.waitForFoundMessage(TRANSITION_TIMEOUT);
      if (revealed) {
        return;
      }
    }

    await browser.waitUntil(() => this.foundMessageIsVisible(), {
      timeout: MOBILE_WAIT_TIMEOUT,
      interval: 250,
      timeoutMsg: `Expected the Swipe screen to reveal ${SWIPE_FOUND_TEXT}`,
    });
  }

  async assertFoundMessage(): Promise<void> {
    await browser.waitUntil(() => this.foundMessageIsVisible(), {
      timeout: MOBILE_WAIT_TIMEOUT,
      interval: 250,
      timeoutMsg: `Expected ${SWIPE_FOUND_TEXT} to be visible`,
    });

    await expect(this.foundMessage).toBeDisplayed();
    expect(await this.foundMessage.getText()).toContain(SWIPE_FOUND_TEXT);
  }

  private async scrollToTop(): Promise<void> {
    for (let swipeNumber = 0; swipeNumber < MAX_VERTICAL_RESET_SWIPES; swipeNumber += 1) {
      if (await this.carouselIsVisibleInScreen() && !(await this.foundMessageIsVisible())) {
        return;
      }

      await swipeWithin(this.screen, 'down', {distanceRatio: 0.65});
      await this.waitForCarouselInScreen(TRANSITION_TIMEOUT);
    }

    await browser.waitUntil(
      async () =>
        (await this.carouselIsVisibleInScreen()) &&
        !(await this.foundMessageIsVisible()),
      {
        timeout: MOBILE_WAIT_TIMEOUT,
        interval: 250,
        timeoutMsg: 'Expected the Swipe screen to be scrolled to the top',
      },
    );
  }

  private async restoreFirstCard(): Promise<void> {
    const firstTitle = SWIPE_CARD_TITLES[0];
    if (await this.cardIsVisible(firstTitle)) {
      return;
    }

    for (
      let swipeNumber = 0;
      swipeNumber < MAX_HORIZONTAL_RESET_SWIPES;
      swipeNumber += 1
    ) {
      await this.swipeCarousel('right');
      await this.waitForAnyCardVisible(TRANSITION_TIMEOUT);
      if (await this.cardIsVisible(firstTitle)) {
        return;
      }
    }

    throw new Error('Unable to restore the Swipe carousel to its first card');
  }

  private async waitForFoundMessage(timeout: number): Promise<boolean> {
    try {
      await browser.waitUntil(() => this.foundMessageIsVisible(), {
        timeout,
        interval: 200,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async waitForCarouselInScreen(timeout: number): Promise<void> {
    try {
      await browser.waitUntil(() => this.carouselIsVisibleInScreen(), {
        timeout,
        interval: 200,
      });
    } catch {
      // The next reset gesture recalculates the current rectangles and can
      // continue even when the previous animation did not settle in time.
    }
  }

  private async waitForAnyCardVisible(timeout: number): Promise<void> {
    await browser.waitUntil(
      async () => (await this.visibleCardElements()).length > 0,
      {
        timeout,
        interval: 200,
        timeoutMsg: 'Expected a Swipe carousel card to become visible',
      },
    );
  }

  private async carouselIsVisibleInScreen(): Promise<boolean> {
    try {
      return this.isElementVisibleWithin(
        this.carouselElement,
        await this.rectOf(this.screen),
        CARD_MINIMUM_VISIBLE_RATIO,
      );
    } catch {
      return false;
    }
  }

  private async foundMessageIsVisible(): Promise<boolean> {
    try {
      const screenRect = await this.rectOf(this.screen);
      const messages = await $$(
        this.foundMessageSelector,
      );

      for (const message of messages) {
        if (await this.isElementVisibleWithin(message, screenRect, 0.1)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  private async cardIsVisible(
    title: (typeof SWIPE_CARD_TITLES)[number],
  ): Promise<boolean> {
    const carouselRect = await this.rectOf(this.carouselElement);
    const visibleCards = await this.visibleCardElements(carouselRect);
    return (await this.activeCardTitle(carouselRect, visibleCards)) === title;
  }

  private async visibleCardElements(
    carouselRect?: Rectangle,
  ): Promise<ElementHandle[]> {
    const currentCarouselRect =
      carouselRect ?? (await this.rectOf(this.carouselElement));
    const cards = await $$(this.cardSelector);
    const visibleCards: ElementHandle[] = [];

    for (const card of cards) {
      // UiAutomator2 can return bounds already clipped to the viewport, which
      // makes an area-overlap ratio report a partial card as fully visible.
      // The card centered in the carousel is the active one.
      if (await this.isElementCenterWithin(card, currentCarouselRect)) {
        visibleCards.push(card);
      }
    }

    // Some Android accessibility configurations omit a non-accessible View
    // carrying the `card` content description. In that case, use only the
    // active title as a conservative fallback; partial title text must not
    // inflate the visible-card count.
    if (visibleCards.length === 0) {
      const titleElements = await this.cardTitleElements();
      for (const titleElement of titleElements) {
        if (
          await this.isElementCenterWithin(titleElement, currentCarouselRect)
        ) {
          visibleCards.push(titleElement);
        }
      }
    }

    return visibleCards;
  }

  private async cardTitleElements(): Promise<ElementHandle[]> {
    return (await $$(this.cardTitleSelector)) as unknown as ElementHandle[];
  }

  private async activeCardTitle(
    carouselRect: Rectangle,
    visibleCards: ElementHandle[],
  ): Promise<(typeof SWIPE_CARD_TITLES)[number] | undefined> {
    for (const card of visibleCards) {
      if (!(await this.isElementCenterWithin(card, carouselRect))) {
        continue;
      }

      const title = this.titleFromText(await card.getText().catch(() => ''));
      if (title) {
        return title;
      }
    }

    // Card wrappers on the demo app can have an empty text attribute. Locate
    // the title once and select the one whose rectangle is in the carousel's
    // central zone, excluding the partially exposed neighbour.
    const titleElements = await this.cardTitleElements();
    for (const titleElement of titleElements) {
      if (!(await this.isElementCenterWithin(titleElement, carouselRect))) {
        continue;
      }

      const title = this.titleFromText(
        await titleElement.getText().catch(() => ''),
      );
      if (title) {
        return title;
      }
    }

    return undefined;
  }

  private titleFromText(
    text: string,
  ): (typeof SWIPE_CARD_TITLES)[number] | undefined {
    const normalizedText = text.toUpperCase();
    return SWIPE_CARD_TITLES.find(title => normalizedText.includes(title));
  }

  private async isElementCenterWithin(
    element: ElementHandle,
    viewport: Rectangle,
  ): Promise<boolean> {
    if (!(await element.isDisplayed().catch(() => false))) {
      return false;
    }

    const elementRect = await this.rectOf(element);
    if (elementRect.width <= 0 || elementRect.height <= 0) {
      return false;
    }

    const centerX = elementRect.x + elementRect.width / 2;
    const centerY = elementRect.y + elementRect.height / 2;
    const zoneWidth = viewport.width * ACTIVE_CARD_ZONE_RATIO;
    const zoneX = viewport.x + (viewport.width - zoneWidth) / 2;

    return (
      centerX >= zoneX &&
      centerX <= zoneX + zoneWidth &&
      centerY >= viewport.y &&
      centerY <= viewport.y + viewport.height
    );
  }

  private async isElementVisibleWithin(
    element: ElementHandle,
    viewport: Rectangle,
    minimumVisibleRatio: number,
  ): Promise<boolean> {
    if (!(await element.isDisplayed().catch(() => false))) {
      return false;
    }

    const elementRect = await this.rectOf(element);
    const elementArea = elementRect.width * elementRect.height;
    if (elementArea <= 0) {
      return false;
    }

    const visibleWidth = Math.max(
      0,
      Math.min(elementRect.x + elementRect.width, viewport.x + viewport.width) -
        Math.max(elementRect.x, viewport.x),
    );
    const visibleHeight = Math.max(
      0,
      Math.min(elementRect.y + elementRect.height, viewport.y + viewport.height) -
        Math.max(elementRect.y, viewport.y),
    );

    return (visibleWidth * visibleHeight) / elementArea >= minimumVisibleRatio;
  }

  private async rectOf(element: ElementHandle): Promise<Rectangle> {
    return browser.getElementRect(await element.elementId);
  }
}

export default new SwipePage();
