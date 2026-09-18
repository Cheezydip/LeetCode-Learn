const express = require('express');
const cors = require('cors');
const { checkSupabaseConnection } = require('./config/supabase');
const errorHandler = require('./middleware/errorHandler');

const problemRoutes = require('./routes/problemRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'LeetCode-Learn API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      problems: 'GET, POST, PUT, DELETE /api/problems',
      progress: 'GET, POST, DELETE /api/progress',
    },
  });
});

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
