const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Secret para JWT - en producción debe estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un hash seguro de la contraseña
 */
async function hashPassword(password) {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

/**
 * Verifica una contraseña contra su hash
 */
async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error verifying password');
  }
}

/**
 * Genera un token JWT seguro
 */
function generateToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'xistracloud',
      audience: 'xistracloud-users'
    });
  } catch (error) {
    throw new Error('Error generating token');
  }
}

/**
 * Verifica y decodifica un token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'xistracloud',
      audience: 'xistracloud-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Middleware de autenticación seguro
 */
function authenticateToken(req, res, next) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // Verificar token
    const decoded = verifyToken(token);
    
    // Añadir información del usuario al request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    console.error('🔒 Authentication error:', error.message);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  }
}

/**
 * Middleware para verificar que el usuario existe en la base de datos
 */
function loadUserData(users, userData) {
  return (req, res, next) => {
    try {
      const user = users.get(req.user.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar que el ID del token coincida con el ID del usuario
      if (user.id !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Token user mismatch',
          code: 'USER_MISMATCH'
        });
      }

      // Cargar datos del usuario
      req.userData = userData.get(user.id);
      req.userProfile = user;

      next();
    } catch (error) {
      console.error('🔒 User data loading error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to load user data'
      });
    }
  };
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
function optionalAuth(users, userData) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No hay token, continuar sin autenticación
      req.user = null;
      req.userData = null;
      req.userProfile = null;
      return next();
    }

    try {
      // Hay token, intentar verificar
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        iat: decoded.iat,
        exp: decoded.exp
      };

      // Cargar datos del usuario si existe
      const user = users.get(req.user.email);
      if (user && user.id === req.user.id) {
        req.userData = userData.get(user.id);
        req.userProfile = user;
      } else {
        req.userData = null;
        req.userProfile = null;
      }

      next();
    } catch (error) {
      // Token inválido, continuar sin autenticación
      req.user = null;
      req.userData = null;
      req.userProfile = null;
      next();
    }
  };
}

// Añadir al final del archivo, antes del module.exports
function flexibleDevAuth(users, userData) {
  return (req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userEmail = req.headers['x-user-email'] || 'yagomateos@hotmail.com';
    
    if (isDevelopment) {
      try {
        const user = users.get(userEmail); // Map.get() method
        if (user) {
          req.user = user;
          req.userData = userData.get(user.id) || { 
            profile: { 
              email: userEmail,
              fullName: 'Yago Mateos',
              plan_type: 'free'
            },
            projects: [],
            backups: [],
            environmentVariables: [],
            teamMembers: [],
            teamInvitations: [],
            logs: []
          };
          return next();
        }
      } catch (error) {
        console.warn('Flexible auth error:', error);
      }
    }
    
    // Si no es desarrollo, usa autenticación normal
    return authenticateToken(req, res, next);
  };
}

// Actualizar module.exports
module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateToken,
  loadUserData,
  optionalAuth,
  flexibleDevAuth
};