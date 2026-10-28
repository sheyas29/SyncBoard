import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Clean and normalize client URL (strip trailing slash if present)
const clientUrl = process.env.CLIENT_URL?.trim().replace(/\/$/, '');

// Dynamic CORS validator: allows localhost, client URL, and all Render frontend domains
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow curl, health checks, postman
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:3000') return true;
  if (clientUrl && (origin === clientUrl || origin === `${clientUrl}/`)) return true;
  if (origin.endsWith('.onrender.com')) return true; // automatically allow Render frontend URLs
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, origin || '*');
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SyncBoard API Server',
  });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SyncBoard API Server',
  });
});

// Swagger UI API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
