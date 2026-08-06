import axiosInstance from './axios';
import { APP_CONFIG } from '../../constants/config';

export const profileService = {
  getProfile: async (staffId: number) => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_PROFILE, { StaffID: staffId });
    return response.data;
  },
};
