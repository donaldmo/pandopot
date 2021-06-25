const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organisationSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  province: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },

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
},
  {
    timestamps: true
  });

organisationSchema.index({
  name: 'text',
  description: 'text',
}, {
  weights: {
    name: 5,
    description: 1,
  },
});

const Organisation = mongoose.model('Organisation', organisationSchema);
module.exports = Organisation;
