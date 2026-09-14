import {browser} from '@wdio/globals';
import {MOBILE_WAIT_TIMEOUT, BasePage} from './base.page.js';
import type {SignupCredentials} from '../helpers/signup-credentials.js';
import NativeAlert from '../components/native-alert.component.js';

class SignupPage extends BasePage {
  private readonly emailSelector = 'input-email';
  private readonly passwordSelector = 'input-password';
  private readonly repeatPasswordSelector = 'input-repeat-password';
  private readonly signUpButtonSelector = 'button-SIGN UP';

  constructor() {
    super('~Login-screen');
  }

  async waitForReady(timeout = MOBILE_WAIT_TIMEOUT): Promise<void> {
    await this.waitForDisplayed(timeout);
    await this.byAccessibilityId(this.repeatPasswordSelector).waitForDisplayed({
      timeout,
    });
    await this.byAccessibilityId(this.signUpButtonSelector).waitForDisplayed({
      timeout,
    });
  }

  async register(credentials: SignupCredentials): Promise<void> {
    await this.waitForReady();

    await this.byAccessibilityId(this.emailSelector).setValue(
      credentials.email,
    );
    await this.byAccessibilityId(this.passwordSelector).setValue(
      credentials.password,
    );
    await this.byAccessibilityId(this.repeatPasswordSelector).setValue(
      credentials.password,
    );

    if (await browser.isKeyboardShown()) {
      // Tapping the screen mirrors the app's supported dismissal path and
      // works on Android versions where hideKeyboard is unreliable.
      await this.screen.click();
    }

    const signUpButton = this.byAccessibilityId(this.signUpButtonSelector);
    await signUpButton.scrollIntoView({scrollableElement: await this.screen});
    await signUpButton.click();
  }

  async assertSuccessfulRegistration(): Promise<void> {
    await NativeAlert.assertContains('Signed Up');
    await NativeAlert.assertContains('You successfully signed up!');
  }

  async dismissSuccessAlert(): Promise<void> {
    await NativeAlert.accept();
  }
}

export default new SignupPage();
