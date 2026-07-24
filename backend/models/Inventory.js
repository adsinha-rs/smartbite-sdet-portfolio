const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Later this will link to a real User ID
  items: [{
    name: String,
    quantity: Number,
    unit: String
  }],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);