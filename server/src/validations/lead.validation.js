const { z } = require('zod');

// Matches the database enum 'LeadStatus'
const LeadStatusEnum = z.enum(['NEW', 'IN_PROGRESS', 'WON', 'LOST']);

const createLeadSchema = z.object({
  body: z.object({
    first_name: z.string({ required_error: 'First name is required' })
      .min(1, 'First name cannot be empty')
      .max(100, 'First name cannot exceed 100 characters'),
    last_name: z.string()
      .max(100, 'Last name cannot exceed 100 characters')
      .optional()
      .nullable(),
    phone_number: z.string({ required_error: 'Phone number is required' })
      .min(5, 'Phone number is too short')
      .max(50, 'Phone number cannot exceed 50 characters'),
    email: z.string()
      .email('Invalid email address format')
      .max(255, 'Email cannot exceed 255 characters')
      .optional()
      .nullable(),
    source_id: z.string()
      .uuid('Invalid source ID format. Must be a UUID.')
      .optional()
      .nullable(),
    service: z.string()
      .max(255, 'Service string cannot exceed 255 characters')
      .optional()
      .nullable(),
    description: z.string()
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional()
      .nullable()
  })
});

const updateLeadSchema = z.object({
  body: z.object({
    status: LeadStatusEnum
      .optional(),
    assigned_to: z.string()
      .uuid('Invalid assigned_to ID format. Must be a UUID.')
      .optional()
      .nullable(),
    first_name: z.string()
      .min(1, 'First name cannot be empty')
      .max(100, 'First name cannot exceed 100 characters')
      .optional(),
    last_name: z.string()
      .max(100, 'Last name cannot exceed 100 characters')
      .optional()
      .nullable(),
    phone_number: z.string()
      .min(5, 'Phone number is too short')
      .max(50, 'Phone number cannot exceed 50 characters')
      .optional(),
    email: z.string()
      .email('Invalid email address format')
      .max(255, 'Email cannot exceed 255 characters')
      .optional()
      .nullable(),
    service: z.string()
      .max(255, 'Service string cannot exceed 255 characters')
      .optional()
      .nullable(),
    description: z.string()
      .max(5000, 'Description cannot exceed 5000 characters')
      .optional()
      .nullable()
  }).strict() // Disallows undocumented fields in the payload
});

const importLeadsSchema = z.object({
  body: z.object({
    leads: z.array(
      z.object({
        first_name: z.string().min(1).max(100),
        last_name: z.string().max(100).optional().nullable(),
        phone_number: z.string().min(5).max(50),
        email: z.string().email().max(255).optional().nullable().or(z.literal('')),
        status: LeadStatusEnum.optional(),
        description: z.string().max(5000).optional().nullable()
      })
    ).min(1, 'At least one lead is required').max(1000, 'Cannot import more than 1000 leads at once')
  })
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  importLeadsSchema
};
