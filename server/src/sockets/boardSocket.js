// Track active users per board room: { [boardId]: Set of user objects }
const activeUsersPerBoard = new Map();

export const setupBoardSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // User identifies themselves to join personal room for real-time invites/notifications
    socket.on('identify-user', ({ userId }) => {
      if (!userId) return;
      const userRoom = `user:${userId.toString()}`;
      socket.join(userRoom);
      socket.userId = userId.toString();
      console.log(`[Socket] Client ${socket.id} joined personal room: ${userRoom}`);
    });

    // User joins a specific board room
    socket.on('join-board', ({ boardId, user }) => {
      if (!boardId) return;

      const room = boardId.toString();
      socket.join(room);
      socket.boardId = room;
      socket.userData = user;

      console.log(`[Socket] ${user?.name || socket.id} joined board room: ${room}`);

      // Track active user
      if (!activeUsersPerBoard.has(room)) {
        activeUsersPerBoard.set(room, new Map());
      }
      if (user && user._id) {
        activeUsersPerBoard.get(room).set(user._id.toString(), {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        });
      }

      // Broadcast active collaborators list to this board room
      const activeList = Array.from(activeUsersPerBoard.get(room).values());
      io.to(room).emit('active-users', { boardId: room, users: activeList });
    });

    // User explicitly leaves board room
    socket.on('leave-board', ({ boardId, user }) => {
      if (!boardId) return;
      const room = boardId.toString();
      socket.leave(room);

      if (activeUsersPerBoard.has(room) && user && user._id) {
        activeUsersPerBoard.get(room).delete(user._id.toString());
        const activeList = Array.from(activeUsersPerBoard.get(room).values());
        io.to(room).emit('active-users', { boardId: room, users: activeList });
      }
      console.log(`[Socket] ${user?.name || socket.id} left board room: ${room}`);
    });

    // Live editing indicator (shows when another collaborator is editing a card)
    socket.on('card:typing', ({ boardId, cardId, userName, isTyping }) => {
      if (boardId) {
        socket.to(boardId.toString()).emit('card:typing', {
          cardId,
          userName,
          isTyping,
        });
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      const room = socket.boardId;
      const user = socket.userData;

      if (room && activeUsersPerBoard.has(room) && user && user._id) {
        activeUsersPerBoard.get(room).delete(user._id.toString());
        const activeList = Array.from(activeUsersPerBoard.get(room).values());
        io.to(room).emit('active-users', { boardId: room, users: activeList });
      }
    });
  });
};
