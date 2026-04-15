import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  activateVip,
  getVipDaysLeft,
  getVipStatus,
  VIP_PACKAGES,
  VipPackage,
  VipStatus,
} from '@/services/vipService';

// ─── Package Cards ───────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: 'spotlight_name' as VipPackage,
    badge: 'HOT',
    badgeColor: '#FF3B30',
    icon: 'medal',
    iconColor: '#FFD700',
    borderColor: '#FFD700',
    features: [
      'Tên hiển thị đầu danh sách',
      'Viền vàng nổi bật trên Home',
      'Hiển thị badge 🏆 trên card',
      'Ưu tiên xuất hiện trước',
    ],
  },
  {
    id: 'spotlight_profile' as VipPackage,
    badge: 'BEST VALUE',
    badgeColor: '#FF9500',
    icon: 'star-circle',
    iconColor: '#FF9500',
    borderColor: '#FF9500',
    features: [
      'Tất cả tính năng gói Nổi bật tên',
      'Profile lên đầu tab Trò chuyện',
      'Hình ảnh zoom lớn trên Home',
      'Ghim profile ở danh sách ưu tiên',
      'Thông báo khi có người mới thích',
    ],
  },
];

const PAYMENT_METHODS = [
  { id: 'vietqr', name: 'VietQR (QR Code)', icon: 'qr-code' },
  { id: 'momo', name: 'Ví MoMo', icon: 'wallet' },
  { id: 'zalo', name: 'Ví ZaloPay', icon: 'chatbubble' },
  { id: 'card', name: 'Thẻ ngân hàng', icon: 'card' },
];

// ─── Success Modal ────────────────────────────────────────────────────────────

const SuccessModal = ({
  visible,
  pkgName,
  daysLeft,
  onClose,
}: {
  visible: boolean;
  pkgName: string;
  daysLeft: number;
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <View className="w-72 rounded-3xl overflow-hidden items-center p-8" style={{ backgroundColor: '#1a1a1a' }}>
        {/* Animated checkmark */}
        <View className="w-20 h-20 rounded-full items-center justify-center mb-5" style={{ backgroundColor: '#00C85320' }}>
          <Ionicons name="checkmark-circle" size={56} color="#00C853" />
        </View>

        <Text className="text-white font-bold text-xl text-center mb-1">
          🎉 Thanh toán thành công!
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-1">
          Gói "{pkgName}" đã được kích hoạt
        </Text>

        {/* VIP badge */}
        <View className="mt-4 bg-yellow-400 rounded-2xl px-6 py-3 items-center">
          <MaterialCommunityIcons name="diamond-stone" size={20} color="#7A5C00" />
          <Text className="text-yellow-900 font-bold text-sm mt-1">VIP Đang hoạt động</Text>
          <Text className="text-yellow-800 text-xs">Còn {daysLeft} ngày</Text>
        </View>

        {/* Features unlocked */}
        <View className="mt-5 w-full rounded-xl p-4" style={{ backgroundColor: '#2c2c2e' }}>
          <Text className="text-gray-400 text-xs mb-2">Bạn đã mở khóa:</Text>
          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle" size={14} color="#FFD700" />
            <Text className="text-gray-200 text-xs ml-2">Viền vàng nổi bật trên Home</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle" size={14} color="#FFD700" />
            <Text className="text-gray-200 text-xs ml-2">Hiển thị đầu danh sách</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={14} color="#FFD700" />
            <Text className="text-gray-200 text-xs ml-2">Ưu tiên trong tab Trò chuyện</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="mt-6 w-full rounded-xl py-3.5 items-center"
          style={{ backgroundColor: '#0084FF' }}
        >
          <Text className="text-white font-bold text-base">Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── QR Modal ───────────────────────────────────────────────────────────────

const QRModal = ({
  visible,
  pkgName,
  price,
  onConfirm,
  onClose,
  loading,
}: {
  visible: boolean;
  pkgName: string;
  price: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <View className="rounded-t-3xl p-6 items-center" style={{ backgroundColor: '#1a1a1a', paddingBottom: 40 }}>
        <View className="w-10 h-1 bg-gray-600 rounded-full mb-5" />
        <Text className="text-white font-bold text-xl mb-1">Quét QR để thanh toán</Text>
        <Text className="text-gray-500 text-sm mb-6 text-center">
          Mở app ngân hàng hoặc ví MoMo/ZaloPay{'\n'}để quét mã bên dưới
        </Text>

        {/* Mock QR */}
        <View className="w-56 h-56 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: 'white' }}>
          <Ionicons name="qr-code" size={120} color="#1a1a1a" />
          <Text className="text-xs text-gray-400 mt-2 text-center px-4">
            VietQR — STK: 123456789{'\n'}PetDating Service
          </Text>
        </View>

        {/* Amount */}
        <View className="rounded-xl px-6 py-3 mb-6 flex-row items-center" style={{ backgroundColor: '#2c2c2e' }}>
          <Text className="text-gray-400 text-sm">Số tiền thanh toán</Text>
          <Text className="text-white font-bold text-lg ml-4">{price}đ</Text>
        </View>

        <TouchableOpacity
          onPress={onConfirm}
          disabled={loading}
          className="w-full rounded-2xl py-4 items-center"
          style={{ backgroundColor: loading ? '#555' : '#0084FF' }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Tôi đã thanh toán xong</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} className="mt-4 py-3">
          <Text className="text-gray-500 text-sm">Huỷ thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── PaymentScreen ───────────────────────────────────────────────────────────

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedPkg, setSelectedPkg] = useState<VipPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('vietqr');
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<VipStatus | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);

  // Load current VIP status on mount
  useEffect(() => {
    const load = async () => {
      const status = await getVipStatus();
      if (status) {
        setCurrentStatus(status);
        setDaysLeft(Math.ceil((status.expiresAt - Date.now()) / 86400000));
        setSelectedPkg(status.package);
      }
    };
    load();
  }, []);

  const pkg = PACKAGES.find((p) => p.id === selectedPkg);
  const pkgInfo = pkg ? VIP_PACKAGES[pkg.id] : null;

  const handlePurchase = () => {
    if (!selectedPkg) {
      Alert.alert('Chọn gói', 'Vui lòng chọn gói dịch vụ trước.');
      return;
    }
    setShowQR(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPkg) return;
    setProcessing(true);

    // Simulate 2s payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Activate VIP
    const status = await activateVip(selectedPkg);
    const left = Math.ceil((status.expiresAt - Date.now()) / 86400000);

    setProcessing(false);
    setShowQR(false);
    setShowSuccess(true);
    setCurrentStatus(status);
    setDaysLeft(left);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-white text-xl font-bold text-center pr-8">Nâng cấp tài khoản</Text>
      </View>

      {/* VIP Active Banner */}
      {currentStatus && currentStatus.isActive && (
        <View className="mx-4 mb-4 rounded-xl p-4 flex-row items-center" style={{ backgroundColor: '#2c2c2e', borderWidth: 1, borderColor: '#FFD700' }}>
          <MaterialCommunityIcons name="diamond-stone" size={22} color="#FFD700" />
          <View className="ml-3 flex-1">
            <Text className="text-yellow-400 font-bold text-sm">VIP Đang hoạt động</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Còn {daysLeft} ngày · {VIP_PACKAGES[currentStatus.package].name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Gia hạn', 'Tính năng gia hạn sẽ sớm ra mắt!');
            }}
            className="bg-yellow-400 rounded-full px-3 py-1.5"
          >
            <Text className="text-yellow-900 font-bold text-xs">Gia hạn</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {/* Chọn gói */}
        <Text className="text-white text-base font-semibold mb-4">Chọn gói dịch vụ</Text>

        {PACKAGES.map((p) => {
          const isSelected = selectedPkg === p.id;
          const info = VIP_PACKAGES[p.id];
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedPkg(isSelected ? null : p.id)}
              className="mb-4 rounded-2xl overflow-hidden border-2"
              style={{
                borderColor: isSelected ? p.borderColor : '#2c2c2e',
                backgroundColor: '#1a1a1a',
              }}
            >
              {/* Badge */}
              <View className="absolute top-3 right-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: p.badgeColor }}>
                <Text className="text-white text-[10px] font-bold">{p.badge}</Text>
              </View>

              <View className="p-5">
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: p.iconColor + '20' }}
                  >
                    <MaterialCommunityIcons name={p.icon as any} size={28} color={p.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{info.name}</Text>
                    <View className="flex-row items-baseline mt-1">
                      <Text className="text-white font-extrabold text-2xl">{info.price}</Text>
                      <Text className="text-gray-500 text-sm ml-1">/tuần</Text>
                    </View>
                  </View>
                  {/* Radio */}
                  <View
                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                    style={{ borderColor: isSelected ? p.borderColor : '#444' }}
                  >
                    {isSelected && (
                      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: p.borderColor }} />
                    )}
                  </View>
                </View>

                {/* Features */}
                {isSelected && (
                  <View className="mt-2 pt-3 border-t border-white/10">
                    {p.features.map((f, i) => (
                      <View key={i} className="flex-row items-center mb-2">
                        <Ionicons name="checkmark-circle" size={16} color={p.iconColor} />
                        <Text className="text-gray-300 text-sm ml-2">{f}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Thanh toán */}
        <Text className="text-white text-base font-semibold mb-4 mt-2">Phương thức thanh toán</Text>
        <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
          {PAYMENT_METHODS.map((m, i) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMethod(m.id)}
              className="flex-row items-center px-5 py-4"
              style={{ borderBottomWidth: i < PAYMENT_METHODS.length - 1 ? 1 : 0, borderBottomColor: '#2c2c2e' }}
            >
              <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
                <Ionicons name={m.icon as any} size={20} color="#8e8e93" />
              </View>
              <Text className="flex-1 text-white font-medium">{m.name}</Text>
              <View
                className="w-5 h-5 rounded-full border-2 items-center justify-center"
                style={{ borderColor: selectedMethod === m.id ? '#0084FF' : '#444' }}
              >
                {selectedMethod === m.id && (
                  <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0084FF' }} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        {pkgInfo && (
          <View className="mt-4 rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2c2c2e' }}>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 text-sm">Gói dịch vụ</Text>
              <Text className="text-white font-medium">{pkgInfo.name}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-white/10">
              <Text className="text-white font-semibold text-base">Tổng cộng</Text>
              <Text className="text-white font-extrabold text-xl">{pkgInfo.price}đ</Text>
            </View>
          </View>
        )}

        {/* Button */}
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={!selectedPkg}
          className="mt-5 rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={selectedPkg ? ['#FF9500', '#FF3B30'] : ['#3a3a3a', '#2c2c2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-base">
              {selectedPkg ? 'Thanh toán ngay' : 'Chọn gói để tiếp tục'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Note */}
        <View className="mt-6 flex-row items-start">
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text className="text-gray-500 text-xs leading-4 ml-2 flex-1">
            Thanh toán được bảo mật bởi PetDating. Dịch vụ tự động gia hạn sau 7 ngày. Hủy bất cứ lúc nào.
          </Text>
        </View>
      </ScrollView>

      {/* QR Modal */}
      <QRModal
        visible={showQR}
        pkgName={pkgInfo?.name || ''}
        price={pkgInfo?.price || ''}
        onConfirm={handleConfirmPayment}
        onClose={() => setShowQR(false)}
        loading={processing}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        pkgName={pkgInfo?.name || ''}
        daysLeft={daysLeft}
        onClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
};

export default PaymentScreen;
