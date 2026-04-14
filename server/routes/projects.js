const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    console.error('GET PROJECTS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });
    const project = await Project.create({
      name, description,
      createdBy: req.user.id,
      members: [req.user.id]
    });
    const populated = await Project.findById(project._id)
      .populate('members', 'name email');
    res.json(populated);
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/add-member', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'No user found with that email' });
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: user._id } },
      { new: true }
    ).populate('members', 'name email');
    res.json(project);
  } catch (err) {
    console.error('ADD MEMBER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;