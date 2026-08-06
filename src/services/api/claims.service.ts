import axiosInstance from './axios';

export const claimsService = {
  getClaimsHistory: async (staffId: number) => {
    // Endpoint to be connected when backend API is available
    const response = await axiosInstance.post('/GetClaimsHistory', { StaffID: staffId });
    return response.data;
  },
  submitClaim: async (payload: any) => {
    const response = await axiosInstance.post('/SubmitClaim', payload);
    return response.data;
  },
};
