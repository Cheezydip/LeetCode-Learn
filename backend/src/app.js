const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { checkSupabaseConnection } = require('./config/supabase');
const errorHandler = require('./middleware/errorHandler');

const rateLimit = require('express-rate-limit');
const problemRoutes = require('./routes/problemRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security headers with strict Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://*.supabase.co"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - strictly allow trusted origins
const allowedOrigins = [
  'https://leetcode-learn.antideploy.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean) : []),
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL.trim())) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim());
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, same-origin)
      if (!origin) return callback(null, true);

      // Check explicit match
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, permit localhost/127.0.0.1 on any local port
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Check anchored wildcard patterns from explicit configuration (e.g., https://*.onrender.com)
      const matchesPattern = allowedOrigins.some((allowed) => {
        if (allowed.includes('*')) {
          const escaped = allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-zA-Z0-9-]+');
          const regex = new RegExp('^' + escaped + '$');
          return regex.test(origin);
        }
        return false;
      });

      if (matchesPattern) {
        return callback(null, true);
      }

      // Reject unauthorized origins
      callback(null, false);
    },
    credentials: true,
  })
);

// Global API Rate Limiter (300 requests per 15 minutes)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      status: 429,
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  },
});
app.use('/api', globalApiLimiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint (checks server & Supabase status without leaking internal diagnostics)
app.get('/api/health', async (req, res) => {
  const supabaseStatus = await checkSupabaseConnection();
  
  res.status(supabaseStatus.ok ? 200 : 503).json({
    status: supabaseStatus.ok ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      supabase: supabaseStatus.ok ? 'connected' : 'unavailable',
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
