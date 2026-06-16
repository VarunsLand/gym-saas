const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    business_name: z.string({ required_error: 'Business name is required' })
      .min(2, 'Business name must be at least 2 characters')
      .max(255, 'Business name cannot exceed 255 characters'),
    industry: z.string()
      .max(100, 'Industry cannot exceed 100 characters')
      .optional(),
    first_name: z.string({ required_error: 'First name is required' })
      .min(1, 'First name cannot be empty')
      .max(100, 'First name cannot exceed 100 characters'),
    last_name: z.string({ required_error: 'Last name is required' })
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name cannot exceed 100 characters'),
    email: z.string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .max(255, 'Email cannot exceed 255 characters'),
    password: z.string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters')
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty')
  })
});

module.exports = {
  signupSchema,
  loginSchema
};
