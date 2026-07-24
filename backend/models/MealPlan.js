const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  weekStartDate: { type: String, required: true }, // e.g., "2026-07-27"
  meals: [{
    type: { type: String }, // 'Breakfast', 'Lunch', etc.
    time: { type: String }, // '8:00 AM'
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' } // Links directly to the Recipe collection
  }]
}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);