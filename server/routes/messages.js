const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const protect = require('../middleware/authMiddleware');

// Get messages for a project
router.get('/:projectId', protect, async (req, res) => {
  const messages = await Message.find({ project: req.params.projectId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;