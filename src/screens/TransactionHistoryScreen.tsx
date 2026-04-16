import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { apiRequest } from '@/services/api';
import AppIcon from '@/components/ui/AppIcon';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionHistory'>;

type Transaction = {
  _id: string;
  orderId: string;
  package: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const methodLabels: Record<string, string> = {
  vietqr: 'VietQR',
  momo: 'MoMo',
  zalo: 'ZaloPay',
  card: 'Thẻ ngân hàng',
};

const TransactionHistoryScreen = ({ navigation }: Props) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{ transactions: Transaction[] }>(
        '/payment/history',
        { auth: true }
      );
      setTransactions(data.transactions || []);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#fff8fb]">
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-slate-800 pr-10">
          Lịch sử giao dịch
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff4f96" />
          <Text className="mt-3 text-sm text-slate-500">Đang tải lịch sử...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <AppIcon name="error" size={48} color="#ef4444" />
          <Text className="mt-4 text-center text-slate-700 font-medium">{error}</Text>
          <TouchableOpacity
            onPress={loadTransactions}
            className="mt-4 bg-[#ff4f96] rounded-full px-6 py-3"
          >
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : transactions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-rose-50 items-center justify-center mb-4">
            <Ionicons name="receipt-outline" size={40} color="#ff4f96" />
          </View>
          <Text className="text-xl font-bold text-slate-700 text-center">
            Chưa có giao dịch nào
          </Text>
          <Text className="mt-2 text-sm text-slate-500 text-center">
            Lịch sử nâng cấp VIP sẽ hiển thị ở đây
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {/* Summary */}
          <View className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-slate-500">Tổng đã chi</Text>
              <Text className="text-2xl font-black text-slate-900 mt-1">
                {formatMoney(totalSpent)}
              </Text>
            </View>
            <View className="bg-rose-50 rounded-xl px-4 py-2">
              <Text className="text-[13px] font-bold text-[#ff4f96]">
                {transactions.length} giao dịch
              </Text>
            </View>
          </View>

          {/* Transaction list */}
          {transactions.map((t, i) => (
            <View
              key={t._id}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: '#f472b6',
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  {/* Badge gói */}
                  <View className="bg-yellow-100 rounded-full px-3 py-1 self-start mb-2">
                    <Text className="text-[11px] font-bold text-yellow-700">
                      {t.packageName}
                    </Text>
                  </View>
                  {/* Thông tin giao dịch */}
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="calendar-outline" size={13} color="#94a3b8" />
                    <Text className="ml-1.5 text-[12px] text-slate-400">
                      {formatDate(t.createdAt)}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="wallet-outline" size={13} color="#94a3b8" />
                    <Text className="ml-1.5 text-[12px] text-slate-400">
                      {methodLabels[t.paymentMethod] || t.paymentMethod}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <AppIcon name="vip" size={13} color="#94a3b8" />
                    <Text className="ml-1.5 text-[11px] text-slate-400 font-mono">
                      {t.orderId}
                    </Text>
                  </View>
                </View>

                {/* Số tiền + trạng thái */}
                <View className="items-end">
                  <Text className="text-lg font-black text-slate-900">
                    {formatMoney(t.amount)}
                  </Text>
                  <View
                    className={`rounded-full px-2.5 py-1 mt-1 ${
                      t.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        t.status === 'completed' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {t.status === 'completed' ? '✓ Thành công' : t.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default TransactionHistoryScreen;