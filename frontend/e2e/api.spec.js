import { test, expect } from '@playwright/test';

test.describe('SmartBite Backend API Automation', () => {
  
  // Pointing directly to the Express Node.js backend port
  const baseURL = '[http://127.0.0.1:5000](http://127.0.0.1:5000)';

  test('POST /api/recipes - Should successfully create a new recipe with macros', async ({ request }) => {
    
    // 1. Define the test payload
    const newRecipe = {
      title: 'Automated API Protein Shake',
      category: 'Breakfast',
      ingredients: [
        { name: 'Whey Protein', quantity: 1, unit: 'scoop' },
        { name: 'Almond Milk', quantity: 250, unit: 'ml' }
      ],
      macros: {
        calories: 150,
        protein: 26,
        carbs: 4,
        fats: 3
      }
    };

    // 2. Execute the POST request
    const response = await request.post(`${baseURL}/api/recipes`, {
      data: newRecipe
    });

    // 3. Assert HTTP Status Code is 201 (Created)
    expect(response.status()).toBe(201);

   // 4. Parse the JSON and assert the response body structure matches the database schema
    const responseBody = await response.json();
    
    // Assert that MongoDB successfully attached a unique ID
    expect(responseBody).toHaveProperty('_id'); 
    
    // Assert that the data saved exactly as we sent it
    expect(responseBody.title).toBe('Automated API Protein Shake');
    expect(responseBody.macros.protein).toBe(26);
  });

  test('GET /api/mealplan - Should retrieve the weekly meal plan array', async ({ request }) => {
    
    // 1. Execute the GET request
    const response = await request.get(`${baseURL}/api/mealplan`);
    
    // 2. Assert HTTP Status Code is 200 (OK)
    expect(response.status()).toBe(200);

    // 3. Parse the JSON and assert data types
    const mealPlan = await response.json();
    expect(mealPlan).toHaveProperty('weekStartDate');
    expect(Array.isArray(mealPlan.meals)).toBeTruthy();
  });

});