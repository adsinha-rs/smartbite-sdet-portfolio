const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'] },
  ingredients: [{
    name: String,
    quantity: Number,
    unit: String
  }],
  nutrients: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);