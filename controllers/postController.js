const Post = require('../models/Post');
const { getDBStatus } = require('../config/db');

// In-Memory fallback store with rich initial seed posts
let mockPosts = [
  {
    _id: 'sample-1',
    title: 'Building Scalable Web Applications with Node.js & Express',
    snippet: 'Discover the core architectural patterns and best practices for developing high-performance REST APIs with Node.js and Express.',
    content: `Node.js has revolutionized modern backend web development by enabling high-throughput, non-blocking asynchronous I/O with an event-driven architecture.

### Why Choose Node.js and Express?
1. **Unified Language**: JavaScript across both client and server stacks simplifies tooling, context-switching, and code sharing.
2. **Speed & Non-Blocking I/O**: The V8 engine combined with libuv allows handling thousands of concurrent requests with low memory footprints.
3. **Rich Ecosystem**: With npm containing over 2 million packages, you have pre-tested solutions for authentication, data validation, templating, and more.

### Practical Tips
- Always modularize your codebase into Controllers, Routes, and Models.
- Use environment variables (\`.env\`) to store configuration secrets safely.
- Implement central error handling middleware in Express to intercept failures consistently.`,
    author: 'Zahid Shafiq',
    category: 'Web Development',
    tags: ['NodeJS', 'Express', 'Backend', 'API'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    readTime: 5,
    likes: 14,
    comments: [
      { _id: 'c1', author: 'Ali Khan', text: 'Excellent guide! Very easy to understand.', createdAt: new Date(Date.now() - 3600000 * 24) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48),
    updatedAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    _id: 'sample-2',
    title: 'MongoDB Mastery: Schemas, Relationships & Mongoose ODM',
    snippet: 'Master document-oriented database design with MongoDB and learn how to model flexible schemas with Mongoose.',
    content: `MongoDB stores data in flexible, JSON-like BSON documents. When coupled with Mongoose, you get the best of both worlds: dynamic documents with schema validation.

### Key MongoDB Concepts
- **Collections & Documents**: Equivalent to SQL tables and rows, but documents can have varying structures.
- **Embedded vs Referenced Documents**: Embed when data belongs strictly to a single parent document (like comments on a post). Reference with ObjectIds when collections grow independently.
- **Indexing**: Creating indexes on search fields like \`category\` and \`tags\` dramatically speeds up query performance.

### Connection Architecture
Mongoose maintains an active connection pool, automatically buffering commands until a valid connection with the database replica set or standalone node is established.`,
    author: 'Zahid Shafiq',
    category: 'Technology',
    tags: ['MongoDB', 'Mongoose', 'Database', 'NoSQL'],
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
    readTime: 4,
    likes: 22,
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 20),
    updatedAt: new Date(Date.now() - 3600000 * 20)
  },
  {
    _id: 'sample-3',
    title: 'Modern Front-End Integration: Consuming RESTful Endpoints',
    snippet: 'A step-by-step walkthrough on connecting interactive front-end visual components to a backend API using JavaScript Fetch.',
    content: `A great backend is only half of the story. Delivering a responsive, snappy user experience requires smooth asynchronous client-side communication.

### Fetch API Best Practices
- Always handle both network errors and HTTP non-200 responses.
- Display loading indicators and optimistic UI updates for instant perceived speed.
- Implement debounce on search inputs to minimize redundant server requests.

With clean CSS and glassmorphism styling, your blog platform can provide a stunning visual identity that delights readers.`,
    author: 'Adv Zahid',
    category: 'Tutorials',
    tags: ['Frontend', 'JavaScript', 'CSS', 'UI/UX'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    readTime: 3,
    likes: 31,
    comments: [
      { _id: 'c2', author: 'Hamza', text: 'Loved the frontend design tips!', createdAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 3600000 * 8),
    updatedAt: new Date(Date.now() - 3600000 * 8)
  }
];

// Helper to check if Mongoose DB is ready
const isDbReady = () => getDBStatus();

// @desc   Get all posts (with filtering and search)
// @route  GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const { search, category, tag } = req.query;

    if (isDbReady()) {
      let query = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { snippet: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (tag) {
        query.tags = tag;
      }

      const posts = await Post.find(query).sort({ createdAt: -1 });
      return res.json({
        success: true,
        source: 'MongoDB',
        count: posts.length,
        data: posts
      });
    }

    // Fallback: In-memory store
    let filtered = [...mockPosts];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(term) ||
             p.snippet.toLowerCase().includes(term) ||
             p.content.toLowerCase().includes(term)
      );
    }
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (tag) {
      filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    return res.json({
      success: true,
      source: 'In-Memory (MongoDB Ready)',
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc   Get single post
// @route  GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      return res.json({ success: true, source: 'MongoDB', data: post });
    }

    const post = mockPosts.find(p => p._id.toString() === id.toString());
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.json({ success: true, source: 'In-Memory', data: post });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc   Create new post
// @route  POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { title, snippet, content, author, category, tags, coverImage, readTime } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const postData = {
      title,
      snippet: snippet || (content.substring(0, 150) + '...'),
      content,
      author: author || 'Admin User',
      category: category || 'Technology',
      tags: parsedTags,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      readTime: Number(readTime) || Math.max(1, Math.ceil(content.split(' ').length / 180)),
      likes: 0,
      comments: []
    };

    if (isDbReady()) {
      const newPost = await Post.create(postData);
      return res.status(201).json({ success: true, source: 'MongoDB', data: newPost });
    }

    // In-memory fallback
    const newMockPost = {
      _id: 'post_' + Date.now(),
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockPosts.unshift(newMockPost);

    return res.status(201).json({ success: true, source: 'In-Memory', data: newMockPost });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// @desc   Update post
// @route  PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, snippet, content, author, category, tags, coverImage } = req.body;

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined);

    if (isDbReady()) {
      const updateData = { title, snippet, content, author, category, coverImage };
      if (parsedTags) updateData.tags = parsedTags;
      
      const updated = await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      return res.json({ success: true, source: 'MongoDB', data: updated });
    }

    const index = mockPosts.findIndex(p => p._id.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    mockPosts[index] = {
      ...mockPosts[index],
      ...(title && { title }),
      ...(snippet && { snippet }),
      ...(content && { content }),
      ...(author && { author }),
      ...(category && { category }),
      ...(coverImage && { coverImage }),
      ...(parsedTags && { tags: parsedTags }),
      updatedAt: new Date()
    };

    return res.json({ success: true, source: 'In-Memory', data: mockPosts[index] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc   Delete post
// @route  DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const deleted = await Post.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      return res.json({ success: true, message: 'Post deleted successfully from MongoDB' });
    }

    const beforeLength = mockPosts.length;
    mockPosts = mockPosts.filter(p => p._id.toString() !== id.toString());
    if (mockPosts.length === beforeLength) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc   Like post
// @route  POST /api/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const post = await Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      return res.json({ success: true, likes: post.likes });
    }

    const post = mockPosts.find(p => p._id.toString() === id.toString());
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.likes = (post.likes || 0) + 1;
    return res.json({ success: true, likes: post.likes });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc   Add comment to post
// @route  POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;

    if (!author || !text) {
      return res.status(400).json({ success: false, message: 'Author name and comment text are required' });
    }

    const newComment = {
      author,
      text,
      createdAt: new Date()
    };

    if (isDbReady()) {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      post.comments.push(newComment);
      await post.save();
      return res.status(201).json({ success: true, data: post.comments });
    }

    const post = mockPosts.find(p => p._id.toString() === id.toString());
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.comments) post.comments = [];
    newComment._id = 'c_' + Date.now();
    post.comments.push(newComment);
    return res.status(201).json({ success: true, data: post.comments });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc   Get system / db stats
// @route  GET /api/status
exports.getStatus = async (req, res) => {
  const dbConnected = isDbReady();
  let totalPosts = 0;

  try {
    if (dbConnected) {
      totalPosts = await Post.countDocuments();
    } else {
      totalPosts = mockPosts.length;
    }
  } catch (e) {
    totalPosts = mockPosts.length;
  }

  return res.json({
    status: 'online',
    server: 'Node.js + Express',
    database: dbConnected ? 'MongoDB Connected' : 'Fallback Active (MongoDB ready)',
    databaseConnected: dbConnected,
    mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogdb',
    totalPosts,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date()
  });
};
