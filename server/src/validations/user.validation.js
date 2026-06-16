const { z } = require('zod');

// Rigidly matches the Prisma database 'UserRole' enum
const UserRoleEnum = z.enum(['ADMIN', 'STAFF'], {
  errorMap: () => ({ message: 'Invalid role. Allowed values: ADMIN, STAFF.' })
});

const createUserSchema = z.object({
  body: z.object({
    first_name: z.string({ required_error: 'First name is required' })
      .min(1, 'First name cannot be empty')
      .max(100, 'First name cannot exceed 100 characters'),
    
    last_name: z.string({ required_error: 'Last name is required' })
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name cannot exceed 100 characters'),
    
    email: z.string({ required_error: 'Email address is required' })
      .email('Invalid email address format')
      .max(255, 'Email cannot exceed 255 characters'),
    
    password: z.string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(255, 'Password cannot exceed 255 characters'),
    
    role: UserRoleEnum
      .optional() // Defaults to STAFF safely in the Service layer
  }).strict() // Disallows injection of undocumented fields
});

const updateUserRoleSchema = z.object({
  body: z.object({
    role: UserRoleEnum
  }).strict() // Extremely rigid, only allows updating the role string
});

module.exports = {
  createUserSchema,
  updateUserRoleSchema
};
