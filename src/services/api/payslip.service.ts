import axiosInstance from './axios';

export const payslipService = {
  getPayslipHistory: async (staffId: number) => {
    // Endpoint to be connected when backend API is available
    const response = await axiosInstance.post('/GetPayslipHistory', { StaffID: staffId });
    return response.data;
  },
  downloadPayslipPdf: async (payslipId: string | number) => {
    const response = await axiosInstance.post('/DownloadPayslipPdf', { PayslipID: payslipId });
    return response.data;
  },
};
