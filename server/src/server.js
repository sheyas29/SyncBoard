import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupBoardSocket } from './sockets/boardSocket.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Setup Socket.IO with production-aware CORS
const socketOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : '*';

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach io to express app so controllers can emit real-time updates
app.set('io', io);

// Initialize socket rooms and events
setupBoardSocket(io);

// Connect to Database and start listening
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 SyncBoard Server running on port ${PORT}`);
      console.log(`📚 Swagger API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`⚡ WebSocket Server active and listening`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error(`[Server] Critical Startup Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export { httpServer, io };
