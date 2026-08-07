import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subsidyService } from '../services/api/subsidy.service';
import { useAuth } from '../context/AuthContext';
import { UpdateWalletPayload } from '../types/subsidy';

export const useWalletBalance = () => {
  const { user } = useAuth();
  const staffId = user?.StaffID;

  return useQuery({
    queryKey: ['walletBalance', staffId],
    queryFn: async () => {
      if (!staffId) return null;
      const resp = await subsidyService.getWalletBalance(staffId);
      const dataObj = resp?.data || resp?.Data || resp;
      return {
        balance: dataObj?.Balance_Amount ?? dataObj?.Balance ?? dataObj?.balance ?? 0,
        lastUpdatedDate: dataObj?.Updated_On ?? dataObj?.UpdatedDate ?? dataObj?.updatedOn ?? 'N/A',
        raw: resp,
      };
    },
    enabled: !!staffId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useWalletHistory = (historyDate: string) => {
  const { user } = useAuth();
  const staffId = user?.StaffID;

  return useQuery({
    queryKey: ['walletHistory', staffId, historyDate],
    queryFn: async () => {
      if (!staffId || !historyDate) return [];
      const payload = {
        StaffID: staffId,
        HistoryDate: historyDate,
      };
      const data = await subsidyService.getWalletHistory(payload);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.Data)) return data.Data;
      if (data && Array.isArray(data.data)) return data.data;
      return data ? [data] : [];
    },
    enabled: !!staffId && !!historyDate,
    staleTime: 1000 * 60 * 5,
  });
};

export const useWalletCategories = () => {
  return useQuery({
    queryKey: ['walletCategories'],
    queryFn: async () => {
      const data = await subsidyService.getAllWalletCategories();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.Data)) return data.Data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useWalletCategory = (categoryId?: number) => {
  return useQuery({
    queryKey: ['walletCategory', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      return await subsidyService.getWalletCategory(categoryId);
    },
    enabled: !!categoryId,
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const staffId = user?.StaffID || 0;
  const userId = user?.User_ID || staffId;

  return useMutation({
    mutationFn: async (payload: Partial<UpdateWalletPayload> & { Shop_Code: string; Amount: number }) => {
      const fullPayload: UpdateWalletPayload = {
        Wallet_Transaction_ID: payload.Wallet_Transaction_ID ?? 0,
        StaffID: payload.StaffID || staffId,
        Transaction_Date: payload.Transaction_Date || new Date().toISOString().split('T')[0],
        Shop_Code: payload.Shop_Code,
        Amount: payload.Amount,
        Remarks: payload.Remarks ?? '',
        User_ID: payload.User_ID || userId,
        Wallet_Category_ID: payload.Wallet_Category_ID ?? 1,
        Subsidy_Type_ID: payload.Subsidy_Type_ID ?? 1,
      };
      return await subsidyService.updateWallet(fullPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
    },
  });
};
