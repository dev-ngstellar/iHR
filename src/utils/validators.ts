import { z } from 'zod';

export const loginSchema = z.object({
  User_Name: z.string().min(1, 'Employee ID is required'),
  User_Password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const applyLeaveSchema = z.object({
  LeaveTypeID: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== 0, {
    message: 'Please select a leave type',
  }),
  LeaveDate: z.string().min(1, 'Leave Date is required'),
  FromDate: z.string().min(1, 'From Date is required'),
  ToDate: z.string().min(1, 'To Date is required'),
  Reason: z.string().min(3, 'Reason must be at least 3 characters long'),
  EmergencyNo: z.string().min(5, 'Valid emergency contact number is required'),
  EmergencyAddress: z.string().min(2, 'Emergency address is required'),
});

export type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>;
