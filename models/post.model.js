const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  postType: {
    type: String,
    default: 'default'
  },

  description: {
    type: String,
    required: true,
  },

  contents: {
    type: String,
    required: true,
  },

  youtubeEmbed: {
    type: String,
    required: false,
  },

  featuredImage: Object,

  gallery: {
    type: Array,
    required: true
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

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;