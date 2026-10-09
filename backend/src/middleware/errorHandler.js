/**
 * Helper to strip sensitive keys from objects before logging
 */
function sanitizeSensitiveData(val) {
  if (!val || typeof val !== 'object') return val;
  const sensitivePatterns = /cookie|session|token|auth|secret|password|key/i;

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeSensitiveData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(val)) {
    if (sensitivePatterns.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Centralized Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const safeMessage = (err.message || '').replace(/(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g, '[REDACTED_JWT]');
  console.error('[API Error]:', {
    method: req.method,
    path: req.originalUrl,
    message: safeMessage,
    body: sanitizeSensitiveData(req.body),
  });

  const statusCode = err.status || err.statusCode || 500;
  // Generic message for unexpected 500 errors in production to avoid leaking internal system details
  const userMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : safeMessage || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      status: statusCode,
      message: userMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
