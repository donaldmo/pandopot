const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TermsSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  contents: {
    type: String,
    required: true,
    unique: true
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
{ timestamps: true });

const Terms = mongoose.model('Terms', TermsSchema);
module.exports = Terms;