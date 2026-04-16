import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api';

const VIP_KEY = 'bossitive_vip_status';

export type VipPackage = 'spotlight_name' | 'spotlight_profile';

export type VipStatus = {
  package: VipPackage;
  purchasedAt: number;
  expiresAt: number;
  isActive: boolean;
};

export const VIP_PACKAGES: Record<VipPackage, { name: string; price: string; durationDays: number }> = {
  spotlight_name: { name: 'Nổi bật tên', price: '29.000', durationDays: 7 },
  spotlight_profile: { name: 'Trang Profile nổi bật', price: '49.000', durationDays: 7 },
};

// ─── Lấy trạng thái VIP từ BACKEND ───────────────────────────────────────

export const getVipStatus = async (): Promise<VipStatus | null> => {
  try {
    const data = await apiRequest<{
      isActive: boolean;
      package: VipPackage | null;
      purchasedAt: string | null;
      expiresAt: string | null;
      daysLeft: number;
    }>('/payment/status', { auth: true });

    if (!data.isActive) {
      // Clear stale local cache so old AsyncStorage doesn't override real server state
      await AsyncStorage.removeItem(VIP_KEY).catch(() => {});
      return null;
    }

    return {
      package: data.package as VipPackage,
      purchasedAt: data.purchasedAt ? new Date(data.purchasedAt).getTime() : Date.now(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + 7 * 86400000,
      isActive: true,
    };
  } catch {
    return null;
  }
};

export const isVipActive = async (): Promise<boolean> => {
  const status = await getVipStatus();
  return status?.isActive ?? false;
};

export const getVipDaysLeft = async (): Promise<number> => {
  const status = await getVipStatus();
  if (!status) return 0;
  const left = Math.ceil((status.expiresAt - Date.now()) / 86400000);
  return Math.max(0, left);
};

// ─── Kích hoạt VIP qua BACKEND ──────────────────────────────────────────────

export const activateVip = async (pkg: VipPackage, paymentMethod = 'vietqr'): Promise<VipStatus> => {
  const data = await apiRequest<{
    success: boolean;
    vipStatus: {
      package: string;
      purchasedAt: string;
      expiresAt: string;
      isActive: boolean;
    };
  }>('/payment/activate', {
    method: 'POST',
    auth: true,
    body: { package: pkg, paymentMethod },
  });

  const vs = data.vipStatus;
  const status: VipStatus = {
    package: vs.package as VipPackage,
    purchasedAt: new Date(vs.purchasedAt).getTime(),
    expiresAt: new Date(vs.expiresAt).getTime(),
    isActive: vs.isActive,
  };

  // Cache local để đọc nhanh khi offline
  await AsyncStorage.setItem(VIP_KEY, JSON.stringify(status));
  return status;
};

export const deactivateVip = async () => {
  await AsyncStorage.removeItem(VIP_KEY);
};
