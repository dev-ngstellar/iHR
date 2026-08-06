import axiosInstance from './axios';
import { APP_CONFIG } from '../../constants/config';
import { UpdateWalletPayload, GetWalletHistoryPayload } from '../../types/subsidy';

export const subsidyService = {
  getWalletBalance: async (staffId: number) => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_WALLET_BALANCE, { StaffID: staffId });
    return response.data;
  },

  getWalletHistory: async (payload: GetWalletHistoryPayload) => {
    if (__DEV__) {
      console.log('[API REQUEST] POST /getWalletHistory', JSON.stringify(payload, null, 2));
    }
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_WALLET_HISTORY, payload);
    return response.data;
  },

  getAllWalletCategories: async () => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_ALL_WALLET_CATEGORIES, {});
    return response.data;
  },

  getWalletCategory: async (walletCategoryId: number) => {
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_WALLET_CATEGORY, { Wallet_Category_ID: walletCategoryId });
    return response.data;
  },

  getShopDetails: async (shopCode: string) => {
    if (__DEV__) {
      console.log('[API REQUEST] POST /getShopDetails', JSON.stringify({ Shop_Code: shopCode }, null, 2));
    }
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.GET_SHOP_DETAILS, { Shop_Code: shopCode });
    return response.data;
  },

  updateWallet: async (payload: UpdateWalletPayload) => {
    if (__DEV__) {
      console.log('[API REQUEST] POST /updateWallet', JSON.stringify(payload, null, 2));
    }
    const response = await axiosInstance.post(APP_CONFIG.ENDPOINTS.UPDATE_WALLET, payload);
    if (__DEV__) {
      console.log('[API RESPONSE] POST /updateWallet', JSON.stringify(response.data, null, 2));
    }
    return response.data;
  },
};
