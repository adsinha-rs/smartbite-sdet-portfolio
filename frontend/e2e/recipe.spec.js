import { test, expect } from '@playwright/test';

test.describe('SmartBite E2E UI Automation', () => {
  
  test('Should dynamically add a recipe, auto-calculate macros via API, and save', async ({ page }) => {
    
    // 🚨 ELITE SDET MOVE: NETWORK MOCKING 🚨
    // We intercept the API calls so the frontend works perfectly without a backend or database!
    
    // 1. Mock the dashboard loading data
    await page.route('**/api/mealplan', route => {
      route.fulfill({ json: { weekStartDate: '2026-05-11', meals: [] } });
    });
    
    await page.route('**/api/grocerylist', route => {
      route.fulfill({ json: [] });
    });

    // 2. Mock the save recipe button to return a fake "201 Created" success status
    await page.route('**/api/recipes', route => {
      route.fulfill({ status: 201 });
    });
    // ----------------------------------------------------

    // 1. Navigate to the dashboard
    await page.goto('http://localhost:5173/');

    // 2. Fill out the Recipe Title 
    await page.getByPlaceholder('Recipe Title (e.g., Anabolic French Toast)').fill('Ultimate Anabolic French Toast');
    
    // 3. Fill out the first ingredient (Egg)
    await page.getByPlaceholder('Name (e.g., Egg, Oats)').fill('Egg');
    await page.getByPlaceholder('Qty').fill('3');
    await page.locator('select').nth(1).selectOption('piece');

    // 4. Click the new dynamic "+ Add Row" button
    await page.getByRole('button', { name: '+ Add Row' }).click();

    // 5. Fill out the SECOND ingredient row (Oats)
    await page.getByPlaceholder('Name (e.g., Egg, Oats)').nth(1).fill('Oats');
    await page.getByPlaceholder('Qty').nth(1).fill('100');
    await page.locator('select').nth(2).selectOption('g');

    // 6. Test the live Internet API integration (We don't mock this, we test the real USDA API!)
    await page.getByRole('button', { name: '🪄 Auto-Calculate Macros' }).click();
    await expect(page.getByText('✅ Macros auto-calculated successfully!')).toBeVisible({ timeout: 10000 });

    // 7. Save the recipe (This will trigger our fake 201 success mock)
    await page.getByRole('button', { name: '💾 Save Complete Recipe' }).click();

    // 8. Verify database save success
    await expect(page.getByText('✅ Recipe Saved to Database!')).toBeVisible();
  });

});