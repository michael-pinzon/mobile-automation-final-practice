import {browser, $} from '@wdio/globals';
import {MOBILE_WAIT_TIMEOUT, BasePage} from './base.page.js';
import type {AuthCredentials} from '../helpers/signup-credentials.js';

/**
 * Shared behaviour for the Login / Sign up form.
 *
 * Both tabs use the same email and password controls. Keeping the interaction
 * here makes each scenario page responsible only for its tab-specific fields
 * and assertions.
 */
export abstract class AuthFormPage extends BasePage {
  protected readonly emailSelector = '~input-email';
  protected readonly passwordSelector = '~input-password';

  protected async fillCredentials(
    credentials: AuthCredentials,
    timeout = MOBILE_WAIT_TIMEOUT,
  ): Promise<void> {
    const email = $(this.emailSelector);
    const password = $(this.passwordSelector);

    await email.waitForDisplayed({timeout});
    await password.waitForDisplayed({timeout});
    await email.setValue(credentials.email);
    await password.setValue(credentials.password);
  }

  protected async dismissKeyboard(): Promise<void> {
    if (await browser.isKeyboardShown()) {
      // Tapping the screen mirrors the app's supported dismissal path and
      // works on Android versions where hideKeyboard is unreliable.
      await this.screen.click();
    }
  }

  protected async submit(buttonSelector: string): Promise<void> {
    const button = this.byAccessibilityId(buttonSelector);
    await button.scrollIntoView({scrollableElement: await this.screen});
    await button.click();
  }
}
