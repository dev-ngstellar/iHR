import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/api/profile.service';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  const { user } = useAuth();
  const staffId = user?.StaffID;

  return useQuery({
    queryKey: ['profile', staffId],
    queryFn: async () => {
      if (!staffId) return null;
      const responseData = await profileService.getProfile(staffId);
      if (responseData && typeof responseData === 'object') {
        if (responseData.data && typeof responseData.data === 'object') {
          return responseData.data;
        }
        if (responseData.Data && typeof responseData.Data === 'object') {
          return responseData.Data;
        }
        return responseData;
      }
      return null;
    },
    enabled: !!staffId,
    staleTime: 1000 * 60 * 5,
  });
};
