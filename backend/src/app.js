const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { checkSupabaseConnection } = require('./config/supabase');
const errorHandler = require('./middleware/errorHandler');

const problemRoutes = require('./routes/problemRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security headers (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, etc.)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS configuration - restrict to trusted origins
const allowedOrigins = [
  'https://leetcode-learn.antideploy.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean) : []),
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL.trim())) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim());
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (checks server & Supabase status)
app.get('/api/health', async (req, res) => {
  const supabaseStatus = await checkSupabaseConnection();
  
  res.status(supabaseStatus.ok ? 200 : 503).json({
    status: supabaseStatus.ok ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      supabase: supabaseStatus.ok ? 'connected' : `disconnected: ${supabaseStatus.message}`,
    },
  });
});

// API Routes
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);

// API Documentation route
app.get('/api', (req, res) => {
  res.json({
    name: 'LeetCode-Learn API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      problems: 'GET, POST, PUT, DELETE /api/problems',
      progress: 'GET, POST, DELETE /api/progress',
      users: 'GET, POST /api/users',
    },
  });
});

// Serve frontend static files if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  // 1. Static assets with hashed filenames: cache for 1 year
  app.use(
    '/assets',
    express.static(path.join(frontendDist, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  );

  // If a request for /assets/* is missing, return 404 immediately.
  // NEVER fall back to index.html for assets, which triggers browser strict MIME type errors!
  app.use('/assets', (req, res) => {
    res.status(404).type('text/plain').send('Asset not found');
  });

  // 2. Other static files (favicon, etc.) with no-cache for HTML files
  app.use(
    express.static(frontendDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );

  // 3. SPA fallback for all GET routes except /api
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
} else {
  // Fallback root route if frontend is not built
  app.get('/', (req, res) => {
    res.json({
      name: 'LeetCode-Learn API',
      version: '1.0.0',
      documentation: {
        health: 'GET /api/health',
        problems: 'GET, POST, PUT, DELETE /api/problems',
        progress: 'GET, POST, DELETE /api/progress',
        users: 'GET, POST /api/users',
      },
    });
  });
}

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
