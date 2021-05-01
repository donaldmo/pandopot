const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackageSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  features: {
    type: Array,
    required: true
  },
  description: String,
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
    days: { type: Number, required: true }
  }
}, { timestamps: true });

const Package = mongoose.model('package', PackageSchema);
module.exports = Package;