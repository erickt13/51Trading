const mongoose = require('mongoose');

// Make sure we're using mongoose.Schema, not just Schema
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Export the model
module.exports = mongoose.model('Counter', CounterSchema);