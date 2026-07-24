global.crypto = require('crypto'); // <--- Adds the missing Node 18 security module
require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const Inventory = require('./models/Inventory');
const MealPlan = require('./models/MealPlan');

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    // We MUST await the connection first before running any database commands!
    await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Fail faster if there is an issue
    family: 4 // Force IPv4 to bypass the Node v18 bug
    });
    console.log('✅ Connected to MongoDB successfully!');

    // 1. Clear existing data
    await Recipe.deleteMany({});
    await Inventory.deleteMany({});
    await MealPlan.deleteMany({});

    // 2. Create Dummy Recipes
    const breakfast = await Recipe.create({
      title: 'Protein Oatmeal', 
      category: 'Breakfast',
      ingredients: [
        { name: 'Oats', quantity: 50, unit: 'g' },
        { name: 'Protein Powder', quantity: 1, unit: 'scoop' },
        { name: 'Berries', quantity: 100, unit: 'g' }
      ]
    });

    const lunch = await Recipe.create({
      title: 'Grilled Chicken Salad', 
      category: 'Lunch',
      ingredients: [
        { name: 'Chicken Breast', quantity: 200, unit: 'g' },
        { name: 'Lettuce', quantity: 150, unit: 'g' },
        { name: 'Olive Oil', quantity: 1, unit: 'tbsp' }
      ]
    });

    // 3. Create a Digital Pantry
    await Inventory.create({
      userId: 'user123',
      items: [
        { name: 'Oats', quantity: 500, unit: 'g' }, 
        { name: 'Olive Oil', quantity: 10, unit: 'tbsp' } 
      ]
    });

    // 4. Create a Meal Plan
    await MealPlan.create({
      userId: 'user123',
      weekStartDate: '2026-05-04',
      meals: [
        { type: 'Breakfast', time: '8:00 AM', recipeId: breakfast._id },
        { type: 'Lunch', time: '1:30 PM', recipeId: lunch._id }
      ]
    });

    console.log('🎉 Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();