import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../services/api/leave.service';
import { useAuth } from '../context/AuthContext';
import { ApplyLeavePayload } from '../types/leave';

export const useLeaveHistory = () => {
  const { user } = useAuth();
  const staffId = user?.StaffID;

  return useQuery({
    queryKey: ['leaveHistory', staffId],
    queryFn: async () => {
      if (!staffId) return [];
      const data = await leaveService.getLeaveHistory(staffId);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.Data)) return data.Data;
      if (data && Array.isArray(data.data)) return data.data;
      return data ? [data] : [];
    },
    enabled: !!staffId,
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: async () => {
      const data = await leaveService.getLeaveTypes();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.Data)) return data.Data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useApplyLeave = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const staffId = user?.StaffID || 0;

  return useMutation({
    mutationFn: async (payload: Omit<ApplyLeavePayload, 'StaffID'>) => {
      const fullPayload: ApplyLeavePayload = {
        StaffID: staffId,
        ...payload,
      };
      return await leaveService.applyLeave(fullPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveHistory', staffId] });
    },
  });
};
