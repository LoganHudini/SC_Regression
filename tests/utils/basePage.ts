import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  protected async waitAndClick(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click();
  }

  protected async fillField(locator: Locator, value: string, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill(value);
  }

  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent())?.trim() || '';
  }
}
