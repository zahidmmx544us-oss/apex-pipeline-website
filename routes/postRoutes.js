const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getStatus
} = require('../controllers/postController');

// System status & health
router.get('/status', getStatus);

// Post CRUD routes
router.route('/posts')
  .get(getPosts)
  .post(createPost);

router.route('/posts/:id')
  .get(getPostById)
  .put(updatePost)
  .delete(deletePost);

router.post('/posts/:id/like', likePost);
router.post('/posts/:id/comments', addComment);

module.exports = router;
