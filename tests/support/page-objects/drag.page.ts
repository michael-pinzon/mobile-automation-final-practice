import {BasePage} from './base.page.js';

class DragPage extends BasePage {
  constructor() {
    super('~Drag-drop-screen');
  }

  async assertKeyElements(): Promise<void> {
    await this.assertScreenText('Drag and Drop');
    await this.assertElementsDisplayed(['~drag-l1', '~drop-l1', '~drop-c3']);
  }
}

export default new DragPage();
