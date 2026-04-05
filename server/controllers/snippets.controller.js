const Snippet = require('../models/Snippet.model');

const createSnippet = async (req, res, next) => {
  try {
    const { title, language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: 'Language and code are required',
      });
    }

    const snippet = await Snippet.create({
      userId: req.user._id,
      title: title || 'Untitled Snippet',
      language,
      code,
    });

    res.status(201).json({
      success: true,
      message: 'Snippet saved to library',
      snippet,
    });
  } catch (error) {
    next(error);
  }
};

const getMySnippets = async (req, res, next) => {
  try {
    const snippets = await Snippet.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      snippets,
      count: snippets.length,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSnippet = async (req, res, next) => {
  try {
    const { snippetId } = req.params;

    const snippet = await Snippet.findOneAndDelete({
      _id: snippetId,
      userId: req.user._id,
    });

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found',
      });
    }

    res.json({
      success: true,
      message: 'Snippet deleted',
    });
  } catch (error) {
    next(error);
  }
};

const updateSnippet = async (req, res, next) => {
  try {
    const { snippetId } = req.params;
    const { title, code } = req.body;

    const snippet = await Snippet.findOneAndUpdate(
      { _id: snippetId, userId: req.user._id },
      { title, code },
      { new: true, runValidators: true }
    );

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found',
      });
    }

    res.json({
      success: true,
      message: 'Snippet updated',
      snippet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSnippet,
  getMySnippets,
  deleteSnippet,
  updateSnippet,
};
