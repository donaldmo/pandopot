const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FaqSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
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
  }
},
{ timestamps: true });

const Faquestion = mongoose.model('Faquestion', FaqSchema);
module.exports = Faquestion;