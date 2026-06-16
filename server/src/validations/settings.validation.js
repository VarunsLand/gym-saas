const { z } = require('zod');

const updateTenantProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Workspace name cannot be empty')
      .max(255, 'Workspace name cannot exceed 255 characters')
      .optional(),
      
    industry: z.string()
      .max(100, 'Industry cannot exceed 100 characters')
      .optional()
      .nullable(),
      
    timezone: z.string()
      .max(50, 'Timezone identifier cannot exceed 50 characters')
      .optional()
  }).strict() // Disallows unrecognized fields from being saved to the database
});

const createLeadSourceSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Lead source name is required' })
      .min(1, 'Lead source name cannot be empty')
      .max(100, 'Lead source name cannot exceed 100 characters')
  }).strict()
});

module.exports = {
  updateTenantProfileSchema,
  createLeadSourceSchema
};
