const request = require('supertest');

// We point the test directly at your running local server
const API_URL = 'http://localhost:5000';

describe('SmartBite API Automation Suite', () => {
  
  it('Should successfully POST a new recipe to the database', async () => {
   // 1. Define the test payload
    const newRecipe = {
      title: 'Greek Yogurt Parfait',
      category: 'Breakfast', // Changed to match your database enum rules
      ingredients: [
        { name: 'Greek Yogurt', quantity: 200, unit: 'g' },
        { name: 'Honey', quantity: 1, unit: 'tbsp' }
      ]
    };

    // 2. Execute the POST request
    const response = await request(API_URL)
      .post('/api/recipes')
      .send(newRecipe)
      .set('Accept', 'application/json');

    // 3. Assertions (The SDET magic)
    expect(response.status).toBe(201); // 201 means "Created"
    expect(response.body.title).toBe('Greek Yogurt Parfait');
    expect(response.body.category).toBe('Breakfast');
    expect(response.body._id).toBeDefined(); // Verifies MongoDB generated an ID
  });

  it('Should successfully GET the grocery list', async () => {
    const response = await request(API_URL).get('/api/grocerylist');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});