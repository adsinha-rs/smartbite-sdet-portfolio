import { test, expect } from '@playwright/test';

test.describe('SmartBite E2E UI Automation', () => {
  
  test('Should dynamically add a multi-ingredient recipe', async ({ page }) => {
    // 1. Navigate to the dashboard
    await page.goto('http://localhost:5173/');

    // 2. Fill out the Recipe Title (Notice the updated placeholder!)
    await page.getByPlaceholder('Recipe Title (e.g., Mass Gainer Shake)').fill('Ultimate Mass Gainer Shake');
    
    // 3. Fill out the first ingredient (Whey Protein)
    await page.getByPlaceholder('Name (e.g., Whey Protein)').fill('Whey Protein');
    await page.getByPlaceholder('Qty').fill('2');
    // The second dropdown on the page is the unit selector
    await page.locator('select').nth(1).selectOption('scoop');

    // 4. Click the dynamic "Add Ingredient" button
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();

    // 5. Fill out the SECOND ingredient row (Peanut Butter)
    // We use .nth(1) because it's the second element matching this placeholder (0-indexed)
    await page.getByPlaceholder('Name (e.g., Whey Protein)').nth(1).fill('Peanut Butter');
    await page.getByPlaceholder('Qty').nth(1).fill('32');
    await page.locator('select').nth(2).selectOption('g');

    // 6. Save the recipe
    await page.getByRole('button', { name: 'Save Recipe' }).click();

    // 7. Verify the success message
    const successMessage = page.getByText('✅ Recipe Added Successfully!');
    await expect(successMessage).toBeVisible();
  });

});