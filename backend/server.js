global.crypto = require('crypto'); // Fix for Node 18
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your database models
const Recipe = require('./models/Recipe');
const Inventory = require('./models/Inventory');
const MealPlan = require('./models/MealPlan');

const app = express();

// Middleware
app.use(cors()); // Allows the React frontend to make requests here
app.use(express.json()); // Allows us to read JSON data

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ Connection error:', err));


// ==========================================
// API ROUTES
// ==========================================

// Test Route: Get the current user's meal plan
app.get('/api/mealplan', async (req, res) => {
  try {
    // Find the meal plan we seeded, and "populate" it so it pulls in the full Recipe data!
    const plan = await MealPlan.findOne({ userId: 'user123' }).populate('meals.recipeId');
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
});
// ==========================================
// GROCERY LIST GENERATOR ROUTE
// ==========================================
app.get('/api/grocerylist', async (req, res) => {
  try {
    const userId = 'user123'; // Hardcoded for our test data

    // 1. Fetch Meal Plan (with full recipe details) and the User's Inventory
    const plan = await MealPlan.findOne({ userId }).populate('meals.recipeId');
    const inventory = await Inventory.findOne({ userId });

    if (!plan) return res.status(404).json({ error: 'Meal plan not found' });

    // 2. Sum up ALL required ingredients across all meals
    const requiredIngredients = {};

    plan.meals.forEach(meal => {
      const recipe = meal.recipeId;
      recipe.ingredients.forEach(ing => {
        // Create a unique key for the dictionary (e.g., "oats-g")
        const key = `${ing.name.toLowerCase()}-${ing.unit.toLowerCase()}`;
        
        if (!requiredIngredients[key]) {
          requiredIngredients[key] = { name: ing.name, unit: ing.unit, quantity: 0 };
        }
        // Add the quantity 
        requiredIngredients[key].quantity += ing.quantity;
      });
    });

    // 3. Subtract Inventory to create the final Shopping List
    const shoppingList = [];
    const pantryItems = inventory ? inventory.items : [];

    Object.values(requiredIngredients).forEach(reqItem => {
      // Look for this ingredient in the pantry
      const pantryItem = pantryItems.find(
        item => item.name.toLowerCase() === reqItem.name.toLowerCase() && 
                item.unit.toLowerCase() === reqItem.unit.toLowerCase()
      );

      let amountNeeded = reqItem.quantity;

      if (pantryItem) {
        // Subtract what the user already has!
        amountNeeded -= pantryItem.quantity;
      }

      // If we still need some, push it to the final shopping list
      if (amountNeeded > 0) {
        shoppingList.push({
          name: reqItem.name,
          quantity: amountNeeded,
          unit: reqItem.unit
        });
      }
    });

    // Send the final calculated list to the frontend
    res.json(shoppingList);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate grocery list' });
  }
});

// ==========================================
// ADD NEW RECIPE ROUTE
// ==========================================
app.post('/api/recipes', async (req, res) => {
  try {
    const newRecipe = await Recipe.create(req.body);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to add recipe' });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SmartBite Backend running on http://localhost:${PORT}`);
});