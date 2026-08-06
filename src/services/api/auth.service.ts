import axiosInstance from './axios';
import { APP_CONFIG } from '../../constants/config';
import { LoginRequest } from '../../types/auth';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.LOGIN, credentials);
    return response.data;
  },
};
