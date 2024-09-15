import { test as base, chromium, BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend({
  context: async ({ }, use) => {
    const pathToExtension = path.join(__dirname, '../../frontend');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--headless=chrome`, // this line is a test feature for headless/could cause weird errors
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {

    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
