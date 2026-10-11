const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    snippet: {
      type: String,
      required: [true, 'Please provide a short summary/snippet'],
      maxlength: [300, 'Snippet cannot exceed 300 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content']
    },
    author: {
      type: String,
      default: 'Admin User',
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Technology',
      enum: ['Technology', 'Web Development', 'AI & Machine Learning', 'Tutorials', 'Design', 'General']
    },
    tags: {
      type: [String],
      default: []
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
    },
    readTime: {
      type: Number,
      default: 4
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);
