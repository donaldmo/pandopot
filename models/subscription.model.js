const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionModel = new Schema({
  item: {
    type: Object,
    required: true
  },

  credits: {
    points: {
      type: Number,
      required: true,
      default: 1
    },
    creditsType: {
      type: String,
      required: true,
      default: 'product'
    }
  },

  payment: {
    type: Object,
    required: true
  },

  usage: {
    used: { type: Boolean, default: false },
    usedDate: { type: Date },
    item: {
      itemType: {
        type: String,
        default: 'product'
      },
      name: String,
      itemId: Schema.Types.ObjectId
    }
  },

  subscriber: {
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

  expiryDate: {
    date: { type: Date, required: true },
    days: { type: Number, required: true }
  }
},
{ timestamps: true }
);
const Subscription = mongoose.model('Subscription', SubscriptionModel);
module.exports = Subscription;