import {$, expect} from '@wdio/globals';
import {MOBILE_WAIT_TIMEOUT} from './base.page.js';
import type {AuthCredentials} from '../helpers/signup-credentials.js';
import NativeAlert from '../components/native-alert.component.js';
import {AuthFormPage} from './auth-form.page.js';

class LoginPage extends AuthFormPage {
  private readonly loginButtonId = 'button-LOGIN';
  private readonly loginButtonSelector = `~${this.loginButtonId}`;
  private readonly signUpTabSelector = '~button-sign-up-container';
  private readonly loginTabSelector = '~button-login-container';
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

  async openLogin(): Promise<void> {
    await this.waitForDisplayed();
    await $(this.loginTabSelector).click();
    await $(this.loginButtonSelector).waitForDisplayed({
      timeout: MOBILE_WAIT_TIMEOUT,
    });
  }

  async login(credentials: AuthCredentials): Promise<void> {
    await this.waitForDisplayed();
    await this.fillCredentials(credentials);
    await this.dismissKeyboard();
    await this.submit(this.loginButtonId);
  }

  async assertSuccessfulLogin(): Promise<void> {
    await NativeAlert.assertContains('Success');
    await NativeAlert.assertContains('You are logged in!');
  }

  async dismissSuccessAlert(): Promise<void> {
    await NativeAlert.accept();
  }
}

export default new LoginPage();
