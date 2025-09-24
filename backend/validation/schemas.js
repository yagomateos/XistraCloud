const Joi = require('joi');

/**
 * Esquemas de validación para diferentes endpoints
 */

// Validación para autenticación
const authLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .max(255)
    .messages({
      'string.email': 'Email must be valid',
      'any.required': 'Email is required',
      'string.max': 'Email too long'
    }),
  password: Joi.string()
    .min(6)
    .max(255)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password too long',
      'any.required': 'Password is required'
    })
});

const authRegisterSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .max(255),
  password: Joi.string()
    .min(8)
    .max(255)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one lowercase, one uppercase and one number'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name too long',
      'string.pattern.base': 'Name contains invalid characters'
    })
});

// Validación para proyectos
const projectCreateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Project name contains invalid characters'
    }),
  description: Joi.string()
    .max(500)
    .allow(''),
  type: Joi.string()
    .valid('wordpress', 'n8n', 'minecraft', 'custom')
    .required(),
  template: Joi.string()
    .max(100)
    .allow(''),
  gitUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Git URL must be valid'
    })
});

// Validación para backups
const backupCreateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required(),
  type: Joi.string()
    .valid('full', 'database', 'files')
    .default('full'),
  projectId: Joi.string()
    .min(5)
    .max(100)
    .required(),
  schedule: Joi.string()
    .valid('manual', 'daily', 'weekly')
    .default('manual'),
  retentionDays: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .default(30)
});

// Validación para dominios
const domainCreateSchema = Joi.object({
  domain: Joi.string()
    .pattern(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/)
    .max(253)
    .required()
    .messages({
      'string.pattern.base': 'Invalid domain format'
    }),
  projectId: Joi.string()
    .min(5)
    .max(100)
    .required()
});

// Validación para invitaciones de equipo
const teamInviteSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .max(255),
  role: Joi.string()
    .valid('admin', 'developer', 'viewer')
    .default('developer'),
  message: Joi.string()
    .max(500)
    .allow('')
});

// Validación para perfil de usuario
const profileUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .allow(''),
  bio: Joi.string()
    .max(500)
    .allow(''),
  location: Joi.string()
    .max(100)
    .allow(''),
  company: Joi.string()
    .max(100)
    .allow(''),
  website: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Website must be a valid URL'
    })
});

// Validación para variables de entorno
const envVarSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[A-Z][A-Z0-9_]*$/)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Environment variable key must be uppercase letters, numbers, and underscores only'
    }),
  value: Joi.string()
    .max(1000)
    .required(),
  projectId: Joi.string()
    .min(5)
    .max(100)
    .required()
});

/**
 * Middleware para validar schemas
 */
function validateSchema(schema) {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Mostrar todos los errores
        stripUnknown: true // Remover campos no definidos
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors
        });
      }

      // Reemplazar req.body con los valores validados y sanitizados
      req.body = value;
      next();
    } catch (err) {
      console.error('🔍 Validation error:', err);
      res.status(500).json({
        success: false,
        error: 'Validation processing failed'
      });
    }
  };
}

/**
 * Validador de parámetros de URL
 */
function validateParams(schema) {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          code: 'PARAM_VALIDATION_ERROR',
          details: errors
        });
      }

      req.params = value;
      next();
    } catch (err) {
      console.error('🔍 Parameter validation error:', err);
      res.status(500).json({
        success: false,
        error: 'Parameter validation failed'
      });
    }
  };
}

// Esquemas para parámetros comunes
const idParamSchema = Joi.object({
  id: Joi.string()
    .min(5)
    .max(100)
    .required()
});

module.exports = {
  // Schemas
  authLoginSchema,
  authRegisterSchema,
  projectCreateSchema,
  backupCreateSchema,
  domainCreateSchema,
  teamInviteSchema,
  profileUpdateSchema,
  envVarSchema,
  idParamSchema,
  
  // Middleware functions
  validateSchema,
  validateParams
};
