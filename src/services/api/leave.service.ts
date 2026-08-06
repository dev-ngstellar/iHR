import axiosInstance from './axios';
import { APP_CONFIG } from '../../constants/config';
import { ApplyLeavePayload } from '../../types/leave';

export const leaveService = {
  getLeaveHistory: async (staffId: number) => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.APP_GET_LEAVE_APPLICATION, { StaffID: staffId });
    return response.data;
  },

  getLeaveTypes: async () => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_LEAVE_TYPE, {});
    return response.data;
  },

  applyLeave: async (payload: ApplyLeavePayload) => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.APP_UPDATE_LEAVE_APPLICATION, payload);
    return response.data;
  },
};
