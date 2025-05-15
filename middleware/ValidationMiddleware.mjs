import { ValidationError } from '../utils/error.mjs';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : 
                 source === 'query' ? req.query : 
                 source === 'params' ? req.params : 
                 req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      throw new ValidationError('Validation error', errors);
    }
    
    // Assign validated and sanitized values
    req[source] = value;
    next();
  };
};

// Middleware untuk validasi kombinasi body, query, dan params
export const validateRequest = ({ body, query, params }) => {
  return (req, res, next) => {
    try {
      if (body) {
        const { error, value } = body.validate(req.body, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });
        
        if (error) {
          const errors = error.details.map(detail => ({
            field: `body.${detail.path.join('.')}`,
            message: detail.message
          }));
          
          throw new ValidationError('Body validation error', errors);
        }
        
        req.body = value;
      }
      
      if (query) {
        const { error, value } = query.validate(req.query, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });
        
        if (error) {
          const errors = error.details.map(detail => ({
            field: `query.${detail.path.join('.')}`,
            message: detail.message
          }));
          
          throw new ValidationError('Query validation error', errors);
        }
        
        req.query = value;
      }
      
      if (params) {
        const { error, value } = params.validate(req.params, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });
        
        if (error) {
          const errors = error.details.map(detail => ({
            field: `params.${detail.path.join('.')}`,
            message: detail.message
          }));
          
          throw new ValidationError('Params validation error', errors);
        }
        
        req.params = value;
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};
