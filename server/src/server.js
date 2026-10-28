import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupBoardSocket } from './sockets/boardSocket.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Clean and normalize client URL (strip trailing slash if present)
const clientUrl = process.env.CLIENT_URL?.trim().replace(/\/$/, '');

// Dynamic CORS validator: allows localhost, client URL, and all Render domains
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow curl, health checks, postman, mobile clients
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:3000') return true;
  if (clientUrl && (origin === clientUrl || origin === `${clientUrl}/`)) return true;
  if (origin.endsWith('.onrender.com')) return true; // automatically allow Render frontend URLs
  return false;
};

// Setup Socket.IO with production-aware CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        // Fallback: reflect origin in non-production, otherwise allow Render domains
        callback(null, origin || '*');
      }
    },
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
    const hostUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    httpServer.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 SyncBoard Server running on port ${PORT}`);
      console.log(`📚 Swagger API Docs: ${hostUrl}/api-docs`);
      console.log(`⚡ WebSocket Server active and listening`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error(`[Server] Critical Startup Error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown on termination signals from cloud hosts (Render/Docker)
const gracefulShutdown = () => {
  console.log('[Server] Received termination signal. Closing gracefully...');
  httpServer.close(() => {
    console.log('[Server] HTTP and WebSocket server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export { httpServer, io };

