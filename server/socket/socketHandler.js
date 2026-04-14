const Message = require('../models/Message');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a project room
    socket.on('joinRoom', (projectId) => {
      socket.join(projectId);
    });

    // Send message
    socket.on('sendMessage', async ({ content, senderId, senderName, projectId }) => {
      const message = await Message.create({
        content,
        sender: senderId,
        project: projectId
      });

      io.to(projectId).emit('receiveMessage', {
        _id: message._id,
        content,
        sender: { _id: senderId, name: senderName },
        createdAt: message.createdAt
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;