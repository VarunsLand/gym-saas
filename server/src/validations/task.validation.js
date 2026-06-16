const { z } = require('zod');

// Matches the Prisma 'TaskStatus' enum
const TaskStatusEnum = z.enum(['PENDING', 'COMPLETED', 'CANCELLED'], {
  errorMap: () => ({ message: 'Invalid task status. Allowed values: PENDING, COMPLETED, CANCELLED.' })
});

const createTaskSchema = z.object({
  body: z.object({
    due_date: z.string({ required_error: 'Due date is required' })
      .datetime('Invalid due date format. Must be a valid ISO-8601 string (e.g. 2026-06-16T12:00:00Z)'),
    assigned_to: z.string({ required_error: 'Assigned user ID is required' })
      .uuid('Invalid assigned_to ID format. Must be a valid UUID.')
  }).strict()
});

const updateTaskSchema = z.object({
  body: z.object({
    due_date: z.string()
      .datetime('Invalid due date format. Must be a valid ISO-8601 string.')
      .optional(),
    status: TaskStatusEnum
      .optional()
  }).strict()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
