const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Rate limiting para endpoints de autenticación
 */
// En desarrollo desactivamos los rate limiters completamente para evitar 429 e IPv6 warnings
const authLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        code: 'RATE_LIMIT_AUTH'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

/**
 * Rate limiting para API general
 */
const apiLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_API'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

/**
 * Rate limiting para endpoints de creación/modificación
 */
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 creaciones por minuto
  message: {
    success: false,
    error: 'Too many creation attempts, please slow down',
    code: 'RATE_LIMIT_CREATE'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Configuración de helmet para headers de seguridad
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.xistracloud.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Disable para desarrollo
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Middleware para sanitizar inputs básico
 */
function sanitizeInput(req, res, next) {
  try {
    // Función recursiva para limpiar objetos
    function cleanObject(obj) {
      if (typeof obj !== 'object' || obj === null) {
        if (typeof obj === 'string') {
          // Remover caracteres peligrosos básicos
          return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
        }
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      }

      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        // Limpiar la clave también
        const cleanKey = key.replace(/[<>]/g, '').trim();
        cleaned[cleanKey] = cleanObject(value);
      }
      return cleaned;
    }

    // Limpiar body, query, y params
    if (req.body) {
      req.body = cleanObject(req.body);
    }
    if (req.query) {
      req.query = cleanObject(req.query);
    }
    if (req.params) {
      req.params = cleanObject(req.params);
    }

    next();
  } catch (error) {
    console.error('🧹 Input sanitization error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input format'
    });
  }
}

/**
 * Middleware para logging de seguridad
 */
function securityLogger(req, res, next) {
  const start = Date.now();
  
  // Interceptar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log de requests sospechosos
    if (res.statusCode >= 400) {
      console.warn(`🔒 Security Alert: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
      
      // Log adicional para intentos de autenticación fallidos
      if (req.path.includes('/auth/') && res.statusCode === 401) {
        console.warn(`🚨 Failed auth attempt: ${req.body?.email || 'unknown'} from ${req.ip}`);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Middleware para validar CORS de forma segura
 */
function secureCors(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002', 
    'https://xistracloud.com',
    'https://www.xistracloud.com',
    'https://app.xistracloud.com'
  ];

  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3002');
  }

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-email');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}

module.exports = {
  authLimiter,
  apiLimiter,
  createLimiter,
  helmetConfig,
  sanitizeInput,
  securityLogger,
  secureCors
};
