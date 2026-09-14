import {BasePage} from './base.page.js';

class SwipePage extends BasePage {
  private readonly carouselSelector =
    '//*[@resource-id="Carousel" or @content-desc="Carousel"]';

  constructor() {
    super('~Swipe-screen');
  }

  get carousel() {
    return this.carouselSelector;
  }

  async assertKeyElements(): Promise<void> {
    await this.assertScreenText('Swipe horizontal');
    await this.assertScreenText(
      "Or swipe vertical to find what I'm hiding.",
    );
    await this.assertScreenText('FULLY OPEN SOURCE');
    await this.assertElementsDisplayed([this.carouselSelector]);
  }
}

export default new SwipePage();
