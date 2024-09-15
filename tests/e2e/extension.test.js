import { test, expect } from './test-setup';

test('Testing Basic UI (Selecting School/Autocomplete)', async ({ context, extensionId }) => {
  const page = await context.newPage();

  await page.goto('chrome-extension://' + extensionId + '/popup.html');

  await page.click("a#school-link")

  await page.fill('input#school-input', 'Stony Brook University');

  await page.waitForSelector("div#school-input-autocomplete-list");

  const suggestions = await page.locator('div#school-input-autocomplete-list > div');

  // Click the first suggestion
  await suggestions.first().click();

  await page.click('button#back-button');
});


test('Testing API call + display of data', async ({ context, extensionId }) => {
    const page = await context.newPage();
  
    await page.goto('chrome-extension://' + extensionId + '/popup.html');
  
    await page.click("a#school-link")
  
    await page.fill('input#school-input', 'Stony Brook University');
  
    await page.waitForSelector("div#school-input-autocomplete-list");
  
    const suggestions = await page.locator('div#school-input-autocomplete-list > div');
  
    // Click the first suggestion
    await suggestions.first().click();
  
    await page.click('button#back-button');

    await page.fill('input#first-name', 'Praveen');

    await page.fill('input#last-name', 'Tripathi');

    await page.click('button#submit-button');

    await page.waitForSelector("h4#professor-stats");   //wait for API call to load

    expect(await page.locator('h4#professor-stats').innerText()).toContain('Praveen Tripathi');
    
    expect(await page.locator('h5#professor-stats-dep').innerText()).toContain('Department of Computer Science');

    const text = await page.locator('h6#professor-stats-num').innerText();

    // Convert the text to an integer
    const number = parseInt(text, 10);
    
    // Assert that the number is greater than 0
    expect(number).toBeGreaterThan(0);
    
    const commentSection = page.locator('.comments-section');
    
    const commentElements = commentSection.locator('.comments');

    const numberOfComments = commentElements.count();

    expect(numberOfComments <= 6);


    // const tagsSection = page.locator('.tags-section');
    
    // const tagElements = tagsSection.locator('.tags');

    // const numberOfTags = tagElements.count();

    // expect(tagElements >= 1 );

  });
  
  test('Testing Error Handling/User Misinputs', async ({ context, extensionId }) => {
    const page = await context.newPage();
  
    await page.goto('chrome-extension://' + extensionId + '/popup.html');

    await page.fill('input#first-name', 'Paul');

    await page.fill('input#last-name', 'Fodor');
  
    await page.click('button#submit-button');

    await expect(page.locator('#error-text')).toBeVisible();

    await page.fill('input#first-name', '');

    await page.fill('input#last-name', '');

    await page.click("a#school-link")
  
    await page.fill('input#school-input', 'Stony Brook University');
  
    await page.waitForSelector("div#school-input-autocomplete-list");
  
    const suggestions1 = await page.locator('div#school-input-autocomplete-list > div');
  
    await suggestions1.first().click();
  
    await page.click('button#back-button');

    await page.click('button#submit-button');

    await expect(page.locator('#error-text')).toBeVisible();

  });