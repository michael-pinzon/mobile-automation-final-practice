import {expect} from '@wdio/globals';
import {BasePage} from './base.page.js';

class LoginPage extends BasePage {
  private readonly emailSelector = '~input-email';
  private readonly passwordSelector = '~input-password';
  private readonly loginButtonSelector = '~button-LOGIN';
  private readonly signUpTabSelector = '~button-sign-up-container';

  constructor() {
    super('~Login-screen');
  }

  async assertKeyElements(): Promise<void> {
    await this.assertScreenText('Login / Sign up Form');
    await this.assertElementsDisplayed([
      this.emailSelector,
      this.passwordSelector,
      this.loginButtonSelector,
      this.signUpTabSelector,
    ]);
    await expect(this.byAccessibilityId('input-email')).toBeEnabled();
    await expect(this.byAccessibilityId('input-password')).toBeEnabled();
    await expect(this.byAccessibilityId('button-LOGIN')).toBeEnabled();
    await this.assertElementText(this.loginButtonSelector, 'LOGIN');
  }
}

export default new LoginPage();
