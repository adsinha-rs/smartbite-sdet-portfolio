const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
  
  // Macro Tracking 
  macros: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true }, 
    carbs: { type: Number, required: true },   
    fats: { type: Number, required: true }     
  },
  
  ingredients: [{
    name: String,
    quantity: Number,
    unit: String
  }]
});

// THIS IS THE MISSING LINE! It registers the schema so other files can find it.
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;