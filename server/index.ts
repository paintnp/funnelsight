// CRITICAL: Load dotenv FIRST before any imports that use process.env
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/index.js';
import spreadsheetRoutes from './routes/spreadsheets.js';
import ga4Routes from './routes/ga4.js';
import insightsRoutes from './routes/insights.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5013', 10);

// CORS Configuration - restrict in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || '*'
    : '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

console.log('🚀 Starting FunnelSight server...');
console.log(`🔐 Auth Mode: ${process.env.AUTH_MODE || 'mock'}`);
console.log(`💾 Storage Mode: ${process.env.STORAGE_MODE || 'memory'}`);

// CRITICAL: Serve static files BEFORE API routes in production
// This ensures CSS/JS assets are served with proper priority
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');

  console.log(`📁 Serving static files from: ${clientDist}`);

  // Serve static files from the built React app
  // This MUST come before API routes to ensure assets are served correctly
  app.use(express.static(clientDist, {
    // Ensure proper MIME types for assets
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
    },
    // Enable caching for assets (1 year for hashed assets, no cache for index.html)
    maxAge: '1d' // Default to 1 day caching for all static assets
  }));
}

// Health check endpoint - must be before other routes for Fly.io
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    config: {
      auth: process.env.AUTH_MODE || 'mock',
      storage: process.env.STORAGE_MODE || 'memory',
      port: PORT,
    },
  });
});

// API Routes
app.use(authRoutes);
app.use(insightsRoutes); // Register insights routes BEFORE apiRoutes to avoid /api/insights/:id conflict
app.use(apiRoutes);
app.use(spreadsheetRoutes);
app.use(ga4Routes);

// SPA fallback - MUST be absolutely last route
// Serves index.html for all non-API routes that don't match static files
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');

  app.get('*', (req, res) => {
    // Don't serve index.html for API routes (they should 404 naturally)
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware - catches any errors from routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error Handler] Request error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Promise Rejection]', reason);
  // Don't exit process, log and continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
  // For truly fatal errors, you might want to exit after logging
  // process.exit(1);
});

// Start server - listen on 0.0.0.0 for Docker/Fly.io compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check at http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
