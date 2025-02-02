const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('../models/counter');

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: false,
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
    itemNumber: {
      type: String,
      required: true
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
  shipDate: {
    type: Date,
    default: Date.now,
    required: false
  },
  signature: {
    type: String,
    required: false
  }
});

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'invoiceNumber' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      const padding = '0000';
      const year = new Date().getFullYear();
      const sequence = (padding + counter.seq).slice(-padding.length);
      this.invoiceNumber = `INV-${year}-${sequence}`;
      
      next();
    } catch (error) {
      console.error('Error in invoice pre-save middleware:', error);
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);