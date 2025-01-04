const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [{
    source: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    mpn: {
      type: String,
      required: false,
    },
    productId: {
      type: String,
      required: false,
    },
    subTotal: {
      type: Number,
      required:false
    },
    status: {
      type: Boolean,
      required:false
    },
    notes: {
      type: String,
      required:false
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  signature: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema)
