const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');

router.get('/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, priority, deadline, project, assignedTo } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!project) return res.status(400).json({ message: 'Project ID is required' });
    const task = await Task.create({
      title, description, priority, deadline, project,
      assignedTo: assignedTo || null,
      createdBy: req.user.id
    });
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email');
    res.json(populated);
  } catch (err) {
    console.error('CREATE TASK ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;