import {browser} from '@wdio/globals';
import BottomNavigation from '../support/components/bottom-navigation.component.js';
import LoginPage from '../support/page-objects/login.page.js';
import SignupPage from '../support/page-objects/signup.page.js';
import {
  createSignupCredentials,
  type SignupCredentials,
} from '../support/helpers/signup-credentials.js';

describe('Successful login', () => {
  let credentials: SignupCredentials;

  beforeEach(async () => {
    credentials = createSignupCredentials();

    await browser.switchContext('NATIVE_APP');
    await BottomNavigation.waitForReady();
    await BottomNavigation.openHome();
    await BottomNavigation.open('login');

    // Create the account as part of this test's setup so the scenario is
    // independent from the sign-up spec and from execution order.
    await LoginPage.openSignUp();
    await SignupPage.register(credentials);
    await SignupPage.assertSuccessfulRegistration();
    await SignupPage.dismissSuccessAlert();
    await LoginPage.openLogin();
  });

  it('logs in with the newly created credentials and confirms the success alert', async () => {
    await LoginPage.login(credentials);
    await LoginPage.assertSuccessfulLogin();
    await LoginPage.dismissSuccessAlert();
  });
});
