import { AppError } from '../utils/error.mjs';

// Middleware untuk menangkap error yang tidak tertangani
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware untuk menangani error
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Jika error adalah instance dari AppError, gunakan statusCode dan pesan dari error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      msg: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Jika error adalah ValidationError dari Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      status: 'error',
      msg: 'Validation error',
      errors
    });
  }

  // Jika error adalah SyntaxError dari JSON parsing
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      msg: 'Invalid JSON'
    });
  }

  // Default error handler
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    msg: process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada server' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
