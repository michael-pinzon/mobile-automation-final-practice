import {expect} from '@wdio/globals';
import {BasePage} from './base.page.js';

class FormsPage extends BasePage {
  private readonly inputSelector = '~text-input';
  private readonly switchSelector = '~switch';
  private readonly dropdownSelector = '~Dropdown';
  private readonly activeButtonSelector = '~button-Active';
  private readonly inactiveButtonSelector = '~button-Inactive';

  constructor() {
    super('~Forms-screen');
  }

  async assertKeyElements(): Promise<void> {
    await this.assertScreenText('Form components');
    await this.assertScreenText('Input field:');
    await this.assertScreenText('Switch:');
    await this.assertScreenText('Dropdown:');
    await this.assertScreenText('Buttons');

    await this.assertElementsDisplayed([
      this.inputSelector,
      this.switchSelector,
      this.dropdownSelector,
      this.activeButtonSelector,
      this.inactiveButtonSelector,
    ]);

    await expect(this.byAccessibilityId('text-input')).toBeEnabled();
    await expect(this.byAccessibilityId('switch')).toBeEnabled();
    await expect(this.byAccessibilityId('button-Active')).toBeEnabled();

    const switchState = await this.byAccessibilityId('switch').getAttribute(
      'checked',
    );
    expect(['true', 'false']).toContain(switchState);
  }
}

export default new FormsPage();
