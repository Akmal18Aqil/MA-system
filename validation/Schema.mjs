import Joi from 'joi';

// Base schemas for reuse
const nameSchema = Joi.string().min(3).max(100).required().messages({
  'string.min': 'Nama minimal 3 karakter',
  'string.max': 'Nama maksimal 100 karakter',
  'string.empty': 'Nama tidak boleh kosong',
  'any.required': 'Nama wajib diisi'
});

const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Email harus valid',
  'string.empty': 'Email tidak boleh kosong',
  'any.required': 'Email wajib diisi'
});

const passwordSchema = Joi.string().min(6).required().messages({
  'string.min': 'Password minimal 6 karakter',
  'string.empty': 'Password tidak boleh kosong',
  'any.required': 'Password wajib diisi'
});

const optionalPasswordSchema = Joi.string().min(6).allow('', null).messages({
  'string.min': 'Password minimal 6 karakter'
});

const nimSchema = Joi.string().pattern(/^\d{10}$/).required().messages({
  'string.pattern.base': 'NIM harus terdiri dari 10 digit angka',
  'string.empty': 'NIM tidak boleh kosong',
  'any.required': 'NIM wajib diisi'
});

const roleSchema = Joi.string().valid('admin', 'user', 'mahasantri').required().messages({
  'any.only': 'Role harus admin, user, atau mahasantri',
  'string.empty': 'Role tidak boleh kosong',
  'any.required': 'Role wajib diisi'
});

// Auth validation schemas
export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'string.empty': 'Password tidak boleh kosong',
    'any.required': 'Password wajib diisi'
  })
});

// User validation schemas
export const createUserSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Password dan Confirm Password tidak cocok',
    'string.empty': 'Confirm Password tidak boleh kosong',
    'any.required': 'Confirm Password wajib diisi'
  }),
  role: roleSchema,
  nim: Joi.when('role', {
    is: 'mahasantri',
    then: nimSchema,
    otherwise: Joi.string().allow(null, '')
  })
});

export const updateUserSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  password: optionalPasswordSchema,
  confPassword: Joi.when('password', {
    is: Joi.string().min(1),
    then: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Password dan Confirm Password tidak cocok',
      'any.required': 'Confirm Password wajib diisi'
    }),
    otherwise: Joi.string().allow('', null)
  }),
  role: roleSchema
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Password lama tidak boleh kosong',
    'any.required': 'Password lama wajib diisi'
  }),
  newPassword: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Konfirmasi password tidak cocok dengan password baru',
    'string.empty': 'Konfirmasi password tidak boleh kosong',
    'any.required': 'Konfirmasi password wajib diisi'
  })
});

// Mahasantri validation schema
export const createMahasantriSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  nim: nimSchema
});

// ID validation schema for route parameters
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'ID harus berupa UUID yang valid',
    'any.required': 'ID wajib diisi'
  })
});

// Pagination and filtering schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page harus berupa angka',
    'number.integer': 'Page harus berupa bilangan bulat',
    'number.min': 'Page minimal 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit harus berupa angka',
    'number.integer': 'Limit harus berupa bilangan bulat',
    'number.min': 'Limit minimal 1',
    'number.max': 'Limit maksimal 100'
  }),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'updatedAt').default('createdAt').messages({
    'any.only': 'SortBy harus salah satu dari: name, email, createdAt, updatedAt'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'SortOrder harus asc atau desc'
  })
});
