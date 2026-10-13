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

// Lead capture endpoint
router.post('/leads', (req, res) => {
  const { name, email, company, targetICP, selectedOption } = req.body;
  console.log(`[New Lead Received]: ${name} (${email}) | Company: ${company} | ICP: ${targetICP} | Option: ${selectedOption}`);
  return res.status(201).json({
    success: true,
    message: 'Lead received successfully! Our data team is preparing your sample.',
    data: { name, email, company, targetICP, selectedOption, timestamp: new Date() }
  });
});

module.exports = router;
