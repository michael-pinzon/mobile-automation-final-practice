import {browser} from '@wdio/globals';
import BottomNavigation from '../support/components/bottom-navigation.component.js';
import LoginPage from '../support/page-objects/login.page.js';
import SignupPage from '../support/page-objects/signup.page.js';
import {createSignupCredentials} from '../support/helpers/signup-credentials.js';

describe('Successful sign up', () => {
  beforeEach(async () => {
    await browser.switchContext('NATIVE_APP');
    await BottomNavigation.waitForReady();
    await BottomNavigation.openHome();
    await BottomNavigation.open('login');
    await LoginPage.openSignUp();
  });

  it('registers a new user and confirms the success alert', async () => {
    await SignupPage.register(createSignupCredentials());
    await SignupPage.assertSuccessfulRegistration();
    await SignupPage.dismissSuccessAlert();
  });
});
