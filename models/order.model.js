const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  order: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, default: 1 },
      createdAt: {
        type: Date,
        default: Date.now()
      },
      payment: {
        type: Object,
        require: true
      },
      status: {
        type: String,
        default: 'pending'
      }
    }
  ],

  user: {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },

  productOwner: {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },

  orderType: { type: String, default: 'product' }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
