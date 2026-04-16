import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { apiRequest } from '@/services/api';
import { getCurrentUser, logout } from '@/services/authService';

type DashboardStats = {
  totalUsers: number;
  vipUsers: number;
  freeUsers: number;
  totalRevenue: number;
  totalOrders: number;
  packageStats: { spotlight_name: number; spotlight_profile: number };
  last7Days: { date: string; label: string; revenue: number }[];
  topBuyers: { email: string; total: number }[];
  recentSignups: {
    email: string;
    joinedAt: string;
    isVip: boolean;
    vipPackage: string | null;
  }[];
};

type VipUser = {
  email: string;
  package: string;
  purchasedAt: string;
  expiresAt: string;
  daysLeft: number;
};

type AdminTransaction = {
  orderId: string;
  email: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
};

type TabKey = 'overview' | 'vip' | 'users' | 'revenue';

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const adminUser = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vipUsers, setVipUsers] = useState<VipUser[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<DashboardStats>('/admin/dashboard', { auth: true });
      setStats(data);
    } catch (err: any) {
      if (err?.message === 'Offline' || err?.response?.status === 401) {
        setError('Không có quyền truy cập Admin');
      } else {
        setError('Không thể tải dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVipUsers = useCallback(async () => {
    try {
      const data = await apiRequest<{ vipUsers: VipUser[] }>('/admin/vip-users', { auth: true });
      setVipUsers(data.vipUsers);
    } catch {}
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const data = await apiRequest<{ users: any[] }>('/admin/users?limit=50', { auth: true });
      setAllUsers(data.users);
    } catch {}
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    setTxLoading(true);
    try {
      const data = await apiRequest<{ transactions: AdminTransaction[]; total: number }>(
        `/admin/transactions?page=${page}&limit=20`,
        { auth: true }
      );
      setTransactions(page === 1 ? data.transactions : (prev) => [...prev, ...data.transactions]);
      setTxTotal(data.total);
      setTxPage(page);
    } catch {} finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    if (tab === 'vip') fetchVipUsers();
    if (tab === 'users') fetchAllUsers();
    if (tab === 'revenue') fetchTransactions(1);
  }, [fetchDashboard, tab, fetchVipUsers, fetchAllUsers, fetchTransactions]);

  const handleLogout = useCallback(() => {
    Alert.alert('Đăng xuất admin', 'Bạn muốn thoát khỏi tài khoản quản trị viên này?', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }, []);

  const StatCard = ({
    label,
    value,
    icon,
    color,
    sub,
  }: {
    label: string;
    value: string | number;
    icon: string;
    color: string;
    sub?: string;
  }) => (
    <View className="flex-1 rounded-2xl p-4 mx-1" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
        <Text className="text-gray-400 text-xs ml-2">{label}</Text>
      </View>
      <Text className="text-white font-extrabold text-2xl">{value}</Text>
      {sub && <Text className="text-gray-500 text-[11px] mt-1">{sub}</Text>}
    </View>
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (error) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg ml-2">Admin Dashboard</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="warning" size={64} color="#FF3B30" />
          <Text className="text-white font-bold text-lg mt-4 text-center">{error}</Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Chỉ tài khoản có role Admin mới có thể truy cập trang này.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.dispatch(CommonActions.goBack())}
            className="mt-6 rounded-xl px-6 py-3"
            style={{ backgroundColor: '#3d1a5c' }}
          >
            <Text className="text-white font-medium">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0d0518' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0518" />

      {/* Admin Header */}
      <View
        style={{ backgroundColor: '#1c0a3a', borderBottomWidth: 1, borderBottomColor: '#4a1a7a' }}
        className="px-4 pt-4 pb-3"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View className="items-center">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="shield-crown" size={22} color="#c084fc" />
              <Text className="text-white font-extrabold text-xl ml-2">ADMIN</Text>
            </View>
            <Text className="text-gray-400 text-xs mt-0.5">PetDating Control Center</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={fetchDashboard} className="p-2 mr-1">
              <Ionicons name="reload" size={20} color="#8b5cf6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#2d1050', borderWidth: 1, borderColor: '#4a1a7a' }}
            >
              <Ionicons name="log-out-outline" size={18} color="#fda4af" />
            </TouchableOpacity>
          </View>
        </View>

        <View
          className="flex-row items-center justify-between mt-4 rounded-2xl px-4 py-3"
          style={{ backgroundColor: '#241042', borderWidth: 1, borderColor: '#4a1a7a' }}
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: '#3b1a63' }}
            >
              <MaterialCommunityIcons name="account-cog" size={22} color="#d8b4fe" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-white font-bold text-sm">Hồ sơ quản trị</Text>
              <Text className="text-purple-200 text-xs mt-0.5" numberOfLines={1}>
                {adminUser?.email || 'admin@petdating.app'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: '#4a1a7a' }}
          >
            <Text className="text-white font-semibold text-xs">Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Admin badge strip */}
        <View className="flex-row items-center mt-3 bg-[#2d1050] rounded-full px-4 py-2 self-center">
          <View className="w-2 h-2 rounded-full bg-green-400" />
          <Text className="text-purple-200 text-xs font-semibold ml-2">Quản trị viên đang hoạt động</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 rounded-xl p-1" style={{ backgroundColor: '#1c0a3a' }}>
        {(['overview', 'vip', 'users', 'revenue'] as TabKey[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={{ backgroundColor: tab === t ? '#4a1a7a' : 'transparent' }}
          >
            <Text
              className="font-semibold text-xs"
              style={{ color: tab === t ? '#e9d5ff' : '#6b7280' }}
            >
              {t === 'overview' ? '📊 Tổng quan' : t === 'vip' ? '💎 VIP' : t === 'users' ? '👥 Người dùng' : '💰 Doanh thu'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-gray-500 mt-3 text-sm">Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {tab === 'overview' && stats && (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
              {/* Stat Row 1 */}
              <View className="flex-row mb-3">
                <StatCard
                  label="Tổng người dùng"
                  value={stats.totalUsers.toLocaleString()}
                  icon="people"
                  color="#60a5fa"
                />
                <StatCard
                  label="VIP"
                  value={stats.vipUsers}
                  icon="diamond"
                  color="#FFD700"
                  sub={`${((stats.vipUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% tổng`}
                />
              </View>

              {/* Stat Row 2 */}
              <View className="flex-row mb-3">
                <StatCard
                  label="Miễn phí"
                  value={stats.freeUsers}
                  icon="person-outline"
                  color="#8b5cf6"
                />
                <StatCard
                  label="Doanh thu thực"
                  value={formatCurrency(stats.totalRevenue)}
                  icon="cash-outline"
                  color="#4ade80"
                />
              </View>

              {/* VIP package breakdown */}
              <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                <Text className="text-purple-200 font-bold mb-4">Phân bổ gói VIP</Text>
                <View className="flex-row">
                  <View className="flex-1 items-center p-4 rounded-xl mr-2" style={{ backgroundColor: '#2d1050' }}>
                    <MaterialCommunityIcons name="medal" size={28} color="#FFD700" />
                    <Text className="text-white font-bold text-2xl mt-2">{stats.packageStats.spotlight_name}</Text>
                    <Text className="text-gray-400 text-xs mt-1">Nổi bật tên</Text>
                    <Text className="text-green-400 text-xs font-bold mt-1">29.000đ / tuần</Text>
                  </View>
                  <View className="flex-1 items-center p-4 rounded-xl ml-2" style={{ backgroundColor: '#2d1050' }}>
                    <MaterialCommunityIcons name="star-circle" size={28} color="#FF9500" />
                    <Text className="text-white font-bold text-2xl mt-2">{stats.packageStats.spotlight_profile}</Text>
                    <Text className="text-gray-400 text-xs mt-1">Profile nổi bật</Text>
                    <Text className="text-green-400 text-xs font-bold mt-1">49.000đ / tuần</Text>
                  </View>
                </View>
              </View>

              {/* Revenue summary */}
              <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                <Text className="text-purple-200 font-bold mb-3">💰 Tổng doanh thu</Text>
                <Text className="text-green-400 font-extrabold text-3xl">{formatCurrency(stats.totalRevenue)}</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  = {stats.packageStats.spotlight_name} × 29.000đ + {stats.packageStats.spotlight_profile} × 49.000đ
                </Text>
              </View>

              {/* Recent signups */}
              <View className="rounded-2xl p-5" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                <Text className="text-purple-200 font-bold mb-4">Đăng ký gần đây</Text>
                {stats.recentSignups.length === 0 ? (
                  <Text className="text-gray-500 text-sm text-center py-4">Chưa có người dùng nào</Text>
                ) : (
                  stats.recentSignups.map((u, i) => (
                    <View
                      key={i}
                      className="flex-row items-center py-3"
                      style={{ borderBottomWidth: i < stats.recentSignups.length - 1 ? 1 : 0, borderBottomColor: '#2d1050' }}
                    >
                      <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#2d1050' }}>
                        <Ionicons name="person" size={16} color="#8b5cf6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-medium" numberOfLines={1}>{u.email}</Text>
                        <Text className="text-gray-500 text-xs mt-0.5">{formatDate(u.joinedAt)}</Text>
                      </View>
                      {u.isVip ? (
                        <View className="bg-yellow-400/20 rounded-full px-3 py-1 flex-row items-center">
                          <MaterialCommunityIcons name="diamond-stone" size={12} color="#FFD700" />
                          <Text className="text-yellow-400 text-xs font-bold ml-1">VIP</Text>
                        </View>
                      ) : (
                        <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#2d1050' }}>
                          <Text className="text-gray-400 text-xs">Free</Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}

          {tab === 'vip' && (
            <FlatList
              data={vipUsers}
              keyExtractor={(item, i) => `${item.email}-${i}`}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              ListHeaderComponent={
                <View className="mt-3 mb-3 rounded-xl p-4" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                  <Text className="text-green-400 font-extrabold text-lg">{vipUsers.length} người</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">đang có gói VIP đang hoạt động</Text>
                </View>
              }
              ListEmptyComponent={
                <View className="items-center py-12">
                  <MaterialCommunityIcons name="diamond-stone" size={48} color="#333" />
                  <Text className="text-gray-500 mt-3 text-sm">Chưa có ai mua VIP</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  className="flex-row items-center py-4 rounded-xl px-4 mb-3"
                  style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#2d1050' }}>
                    <MaterialCommunityIcons name="diamond-stone" size={18} color="#FFD700" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-sm" numberOfLines={1}>{item.email}</Text>
                    <Text className="text-gray-500 text-xs mt-0.5">
                      Mua: {formatDate(item.purchasedAt)} · Hết: {formatDate(item.expiresAt)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="rounded-full px-3 py-1 mb-1" style={{ backgroundColor: '#2d1050' }}>
                      <Text className="text-yellow-400 text-xs font-bold">
                        {item.package === 'spotlight_name' ? '💛 Nổi bật tên' : '⭐ Profile nổi bật'}
                      </Text>
                    </View>
                    <Text className="text-green-400 text-xs">Còn {item.daysLeft} ngày</Text>
                  </View>
                </View>
              )}
            />
          )}

          {tab === 'users' && (
            <FlatList
              data={allUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              ListHeaderComponent={
                <View className="mt-3 mb-3 flex-row items-center justify-between rounded-xl p-4" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                  <Text className="text-purple-200 font-bold text-base">{allUsers.length} người dùng</Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                    <Text className="text-gray-400 text-xs">Đang hoạt động</Text>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <View className="items-center py-12">
                  <Ionicons name="people-outline" size={48} color="#333" />
                  <Text className="text-gray-500 mt-3 text-sm">Chưa có người dùng nào</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  className="flex-row items-center py-3 rounded-xl px-4 mb-2"
                  style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderBottomColor: '#2d1050' }}
                >
                  <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: item.role === 'admin' ? '#3d1a5c' : '#2d1050' }}>
                    <Ionicons name={item.role === 'admin' ? 'shield-checkmark' : 'person'} size={16} color={item.role === 'admin' ? '#c084fc' : '#8b5cf6'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium" numberOfLines={1}>{item.email}</Text>
                    <Text className="text-gray-500 text-xs mt-0.5">{formatDate(item.joinedAt)}</Text>
                  </View>
                  <View className="items-end">
                    {item.role === 'admin' ? (
                      <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#3d1a5c' }}>
                        <Text className="text-purple-300 text-xs font-bold">Admin</Text>
                      </View>
                    ) : item.vipActive ? (
                      <View className="bg-yellow-400/20 rounded-full px-3 py-1 flex-row items-center">
                        <MaterialCommunityIcons name="diamond-stone" size={10} color="#FFD700" />
                        <Text className="text-yellow-400 text-xs font-bold ml-1">VIP</Text>
                      </View>
                    ) : (
                      <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#1a1a1a' }}>
                        <Text className="text-gray-500 text-xs">Free</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            />
          )}

          {tab === 'revenue' && (
            <FlatList
              data={transactions}
              keyExtractor={(item, i) => `${item.orderId}-${i}`}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              onEndReached={() => {
                if (!txLoading && transactions.length < txTotal) {
                  fetchTransactions(txPage + 1);
                }
              }}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={
                <View>
                  {/* Summary stats */}
                  <View className="flex-row mt-3 mb-4">
                    <View className="flex-1 rounded-2xl p-4 mr-1.5" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                      <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: '#16a34a20' }}>
                        <Ionicons name="cash-outline" size={16} color="#4ade80" />
                      </View>
                      <Text className="text-green-400 font-extrabold text-xl">{formatCurrency(stats?.totalRevenue || 0)}</Text>
                      <Text className="text-gray-500 text-[11px] mt-1">Tổng doanh thu</Text>
                    </View>
                    <View className="flex-1 rounded-2xl p-4 ml-1.5" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                      <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: '#7c3aed20' }}>
                        <MaterialCommunityIcons name="receipt" size={16} color="#c084fc" />
                      </View>
                      <Text className="text-purple-200 font-extrabold text-xl">{stats?.totalOrders || 0}</Text>
                      <Text className="text-gray-500 text-[11px] mt-1">Đơn hàng</Text>
                    </View>
                  </View>

                  {/* Top buyers */}
                  {stats && stats.topBuyers && stats.topBuyers.length > 0 && (
                    <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                      <Text className="text-purple-200 font-bold text-sm mb-3">🏆 Top người mua nhiều nhất</Text>
                      {stats.topBuyers.map((buyer, i) => (
                        <View
                          key={buyer.email}
                          className="flex-row items-center py-2.5"
                          style={{ borderBottomWidth: i < stats.topBuyers.length - 1 ? 1 : 0, borderBottomColor: '#2d1050' }}
                        >
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: i === 0 ? '#FFD70020' : i === 1 ? '#C0C0C020' : i === 2 ? '#CD7F3220' : '#2d1050' }}
                          >
                            <Text className="text-xs font-black" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#6b7280' }}>
                              {i + 1}
                            </Text>
                          </View>
                          <Text className="text-white text-sm flex-1" numberOfLines={1}>{buyer.email}</Text>
                          <Text className="text-green-400 text-sm font-bold">{formatCurrency(buyer.total)}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 7 ngày gần đây */}
                  {stats && stats.last7Days && stats.last7Days.length > 0 && (
                    <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderColor: '#3d1a5c' }}>
                      <Text className="text-purple-200 font-bold text-sm mb-4">📅 Doanh thu 7 ngày gần đây</Text>
                      <View className="flex-row items-end justify-between h-24">
                        {stats.last7Days.map((day) => {
                          const maxRev = Math.max(...stats.last7Days.map((d) => d.revenue), 1);
                          const height = Math.max((day.revenue / maxRev) * 80, day.revenue > 0 ? 8 : 0);
                          return (
                            <View key={day.date} className="flex-1 items-center mx-1">
                              <Text className="text-gray-500 text-[10px] mb-1">
                                {new Intl.NumberFormat('vi-VN').format(day.revenue / 1000).slice(0, 4)}K
                              </Text>
                              <View
                                className="w-full rounded-t-lg"
                                style={{ height, backgroundColor: day.revenue > 0 ? '#4ade80' : '#2d1050' }}
                              />
                              <Text className="text-gray-500 text-[10px] mt-1">{day.label}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Header danh sách giao dịch */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-purple-200 font-bold text-sm">📋 Danh sách giao dịch</Text>
                    <TouchableOpacity onPress={() => fetchTransactions(1)} className="p-1">
                      <Ionicons name="reload" size={16} color="#8b5cf6" />
                    </TouchableOpacity>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <View className="items-center py-12">
                  <MaterialCommunityIcons name="file-document-outline" size={48} color="#333" />
                  <Text className="text-gray-500 mt-3 text-sm">Chưa có giao dịch nào</Text>
                </View>
              }
              ListFooterComponent={
                txLoading ? (
                  <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#8b5cf6" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View
                  className="flex-row items-center py-4 rounded-xl px-4 mb-2"
                  style={{ backgroundColor: '#1c0a2e', borderWidth: 1, borderBottomColor: '#2d1050' }}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#2d1050' }}>
                    <MaterialCommunityIcons name="diamond-stone" size={18} color="#FFD700" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium" numberOfLines={1}>{item.email}</Text>
                    <Text className="text-gray-500 text-[11px] mt-0.5">
                      {formatDate(item.createdAt)} · {item.paymentMethod?.toUpperCase()}
                    </Text>
                    <Text className="text-gray-400 text-[10px] font-mono mt-0.5">{item.orderId}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-green-400 font-bold text-sm">{formatCurrency(item.amount)}</Text>
                    <View className="rounded-full px-2 py-1 mt-1" style={{ backgroundColor: '#16a34a20' }}>
                      <Text className="text-green-400 text-[10px] font-bold">{item.packageName}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
