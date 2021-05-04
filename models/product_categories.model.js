const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategoriesSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  categoryType: {
    type: String,
    default: 'product'
  },
  description: String,
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
  }
},
{ timestamps: true });

module.exports = mongoose.model('ProductCategory', ProductCategoriesSchema);