const { test, expect } = require('@playwright/test');

async function waitForMochaAndAssertResult(page) {
  await page.waitForFunction(() => window.mochaResults); // eslint-disable-line no-undef
  const mochaResults = await page.evaluate('window.mochaResults');

  expect(mochaResults.failures).toBe(0);
}

test('Spec handlebars.js', async ({ page }) => {
  await page.goto(`/spec/?headless=true`);
  await waitForMochaAndAssertResult(page);
});

test('Spec handlebars.amd.js (AMD)', async ({ page }) => {
  await page.goto(`/spec/amd.html?headless=true`);
  await waitForMochaAndAssertResult(page);
});

test('Spec handlebars.runtime.amd.js (AMD)', async ({ page }) => {
  await page.goto(`/spec/amd-runtime.html?headless=true`);
  await waitForMochaAndAssertResult(page);
});

test('Spec handlebars.js (UMD)', async ({ page }) => {
  await page.goto(`/spec/umd.html?headless=true`);
  await waitForMochaAndAssertResult(page);
});

test('Spec handlebars.runtime.js (UMD)', async ({ page }) => {
  await page.goto(`/spec/umd-runtime.html?headless=true`);
  await waitForMochaAndAssertResult(page);
});
