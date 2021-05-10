const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BoostingSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  price: Number,
  icon: String,
  author: {
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
    days: { type: Number, default: 30, }
  }
},
{ timestamps: true });

const Boosting = mongoose.model('Boosting', BoostingSchema);
module.exports = Boosting;