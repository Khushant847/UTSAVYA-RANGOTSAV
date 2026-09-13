import { z } from 'zod';

export const personalDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobile: z
    .string()
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit mobile number'),
});

export const passSelectionSchema = z.object({
  passType: z.enum(['single', 'duo', 'family'], {
    required_error: 'Please select a pass type',
  }),
});

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type PassSelection = z.infer<typeof passSelectionSchema>;
