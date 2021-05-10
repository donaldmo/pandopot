const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MarketSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  
  description: String,
  location: String,
  logo: String,
  profileImage: String,
  phone: String,
  website: String,

  hikingData: {
    trailType: String,
    trailLevel: String,
    province: String,
    location: String,
    price_start: Number,
    price_end: Number,
    details: String
  },

  images: Array,
  featuredImage: Object,
  
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

  publish: Boolean,

  category: {
    name: {
      type: String,
      required: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ProductCategory'
    }
  }
},
{ timestamps: true });

MarketSchema.index({
  name: 'text',
  description: 'text',
}, {
  weights: {
    name: 5,
    description: 1,
  },
});

const Market = mongoose.model('Market', MarketSchema);
module.exports = Market;