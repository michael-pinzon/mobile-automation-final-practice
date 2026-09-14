import {BasePage} from './base.page.js';

class HomePage extends BasePage {
  constructor() {
    super('~Home-screen');
  }

  async assertKeyElements(): Promise<void> {
    await this.assertScreenText('WEBDRIVER');
    await this.assertScreenText('Demo app for the appium-boilerplate');
    await this.assertScreenText('Support');
  }
}

export default new HomePage();
