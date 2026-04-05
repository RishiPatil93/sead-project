const express = require('express');
const router = express.Router();
const {
  createSnippet,
  getMySnippets,
  deleteSnippet,
  updateSnippet,
} = require('../controllers/snippets.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', createSnippet);
router.get('/', getMySnippets);
router.put('/:snippetId', updateSnippet);
router.delete('/:snippetId', deleteSnippet);

module.exports = router;
