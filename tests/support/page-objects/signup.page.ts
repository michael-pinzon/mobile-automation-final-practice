import {MOBILE_WAIT_TIMEOUT} from './base.page.js';
import type {SignupCredentials} from '../helpers/signup-credentials.js';
import NativeAlert from '../components/native-alert.component.js';
import {AuthFormPage} from './auth-form.page.js';

class SignupPage extends AuthFormPage {
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

    await this.fillCredentials(credentials);
    await this.byAccessibilityId(this.repeatPasswordSelector).setValue(
      credentials.password,
    );

    await this.dismissKeyboard();
    await this.submit(this.signUpButtonSelector);
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
