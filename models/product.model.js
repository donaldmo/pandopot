const { string } = require('@hapi/joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  category: {
    name: { type: String, required: true },
    id: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: 'ProductCategory'
    }
  },

  payment: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  delivery: { type: String, required: true },
  deliveryPrice: { type: String, required: true },
  units: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },

  images: {
    type: Array,
  },
  
  featuredImage: {
    imageName: String,
    url: String
  },

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

  soldOut: {
    type: Boolean,
    default: false
  },
  
  expiryDate: {
    date: { type: Date, required: false },
    days: { type: Number, required: false },
  },

  boostInfo: {
    type: Array,
    default: []
  },

  published: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

ProductSchema.index({
  name: 'text',
  description: 'text',
}, {
  weights: {
    name: 5,
    description: 1,
  },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;

