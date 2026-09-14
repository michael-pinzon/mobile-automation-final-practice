import {$, expect} from '@wdio/globals';
import {BasePage} from './base.page.js';

class LoginPage extends BasePage {
  private readonly emailSelector = '~input-email';
  private readonly passwordSelector = '~input-password';
  private readonly loginButtonSelector = '~button-LOGIN';
  private readonly signUpTabSelector = '~button-sign-up-container';
  private readonly signUpButtonSelector = '~button-SIGN UP';

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

  async openSignUp(): Promise<void> {
    await this.waitForDisplayed();
    await this.byAccessibilityId('button-sign-up-container').click();
    await this.byAccessibilityId('input-repeat-password').waitForDisplayed({
      timeout: 20_000,
    });
    await expect($(this.signUpButtonSelector)).toBeDisplayed();
  }
}

export default new LoginPage();
