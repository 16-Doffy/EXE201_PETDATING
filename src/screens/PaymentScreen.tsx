import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  activateVip,
  getVipStatus,
  VIP_PACKAGES,
  VipPackage,
  VipStatus,
} from '@/services/vipService';

// ─── Package Definitions ────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: 'spotlight_name' as VipPackage,
    name: 'Nổi bật tên',
    price: '29.000đ',
    badge: 'PHỔ BIẾN',
    badgeColor: '#f59e0b',
    // Gold theme
    gradientFrom: '#451a03',
    gradientTo: '#78350f',
    accentColor: '#fbbf24',
    icon: 'medal-outline',
    iconColor: '#fbbf24',
    borderColor: '#f59e0b',
    tagline: 'Nổi bật giữa đám đông',
    features: [
      { icon: 'arrow-up', text: 'Tên hiển thị đầu danh sách tìm kiếm' },
      { icon: 'star', text: 'Viền vàng sang trọng trên card Home' },
      { icon: 'ribbon', text: 'Badge 🏆 nổi bật trên hồ sơ' },
      { icon: 'flash', text: 'Ưu tiên xuất hiện trước 5 lần' },
    ],
    extra: null,
  },
  {
    id: 'spotlight_profile' as VipPackage,
    name: 'Trang Profile Nổi bật',
    price: '49.000đ',
    badge: 'BEST VALUE',
    badgeColor: '#a855f7',
    // Royal purple theme
    gradientFrom: '#2e1065',
    gradientTo: '#4c1d95',
    accentColor: '#c084fc',
    icon: 'crown',
    iconColor: '#c084fc',
    borderColor: '#a855f7',
    tagline: 'Trở thành ngôi sao của PetDating',
    features: [
      { icon: 'arrow-up', text: 'Tất cả tính năng gói Nổi bật tên' },
      { icon: 'chatbubbles', text: 'Profile lên đầu tab Trò chuyện' },
      { icon: 'image', text: 'Hình ảnh zoom lớn trên Home' },
      { icon: 'pin', text: 'Ghim profile ở danh sách ưu tiên' },
      { icon: 'notifications', text: 'Thông báo khi có người mới thích' },
    ],
    extra: { icon: 'sparkles', text: 'Hiệu ứng glow đặc biệt trên card' },
  },
];

const PAYMENT_METHODS = [
  { id: 'vietqr', name: 'VietQR (QR Code)', icon: 'qr-code', color: '#22c55e' },
  { id: 'momo', name: 'Ví MoMo', icon: 'wallet-outline', color: '#ec4899' },
  { id: 'zalo', name: 'ZaloPay', icon: 'chatbubble-outline', color: '#0068ff' },
  { id: 'card', name: 'Thẻ ngân hàng', icon: 'card-outline', color: '#f59e0b' },
];

// ─── Success Modal ────────────────────────────────────────────────────────────

const SuccessModal = ({
  visible,
  pkgName,
  pkgId,
  daysLeft,
  onClose,
}: {
  visible: boolean;
  pkgName: string;
  pkgId: string;
  daysLeft: number;
  onClose: () => void;
}) => {
  const accentColor = pkgId === 'spotlight_name' ? '#fbbf24' : '#c084fc';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <View className="w-80 rounded-3xl overflow-hidden items-center p-8">
          <LinearGradient
            colors={pkgId === 'spotlight_name' ? ['#451a03', '#78350f'] : ['#2e1065', '#4c1d95']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full rounded-3xl items-center p-8"
          >
            {/* Checkmark */}
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: accentColor + '20' }}
            >
              <Ionicons name="checkmark-circle" size={60} color={accentColor} />
            </View>

            <Text className="text-white font-bold text-2xl text-center mb-2">
              🎉 Thanh toán thành công!
            </Text>
            <Text className="text-white/70 text-sm text-center mb-1">
              Gói "{pkgName}" đã được kích hoạt
            </Text>

            {/* VIP badge */}
            <View
              className="mt-4 rounded-2xl px-6 py-3 items-center"
              style={{ backgroundColor: accentColor + '20', borderWidth: 1, borderColor: accentColor + '60' }}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="diamond-stone" size={18} color={accentColor} />
                <Text className="text-white font-bold text-sm ml-2">VIP Đang hoạt động</Text>
              </View>
              <Text className="text-white/70 text-xs mt-1">Còn {daysLeft} ngày</Text>
            </View>

            {/* Action */}
            <TouchableOpacity
              onPress={onClose}
              className="mt-6 w-full rounded-2xl py-4 items-center"
              style={{ backgroundColor: accentColor }}
            >
              <Text className="text-black font-bold text-base">Khám phá ngay</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// ─── QR Modal ───────────────────────────────────────────────────────────────

const QRModal = ({
  visible,
  pkgName,
  price,
  accentColor,
  onConfirm,
  onClose,
  loading,
}: {
  visible: boolean;
  pkgName: string;
  price: string;
  accentColor: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <View className="rounded-t-[40px] p-6 items-center" style={{ backgroundColor: '#0f0f0f', paddingBottom: 40 }}>
        <View className="w-10 h-1 bg-gray-600 rounded-full mb-5" />

        {/* Header */}
        <View className="flex-row items-center mb-1">
          <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: accentColor + '20' }}>
            <Ionicons name="qr-code" size={22} color={accentColor} />
          </View>
          <Text className="text-white font-bold text-xl">Quét QR thanh toán</Text>
        </View>
        <Text className="text-gray-500 text-sm mb-6 text-center">
          Mở app ngân hàng hoặc ví MoMo/ZaloPay{'\n'}để quét mã bên dưới
        </Text>

        {/* QR */}
        <View className="w-60 h-60 rounded-3xl items-center justify-center mb-5" style={{ backgroundColor: 'white' }}>
          <Ionicons name="qr-code" size={140} color="#1a1a1a" />
          <Text className="text-xs text-gray-400 mt-3 text-center px-4">
            VietQR{'\n'}STK: 1903 0000 000 123{'\n'}PetDating Service
          </Text>
        </View>

        {/* Amount */}
        <View className="w-full rounded-2xl p-4 mb-5 flex-row items-center justify-between" style={{ backgroundColor: '#1a1a1a' }}>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: accentColor + '20' }}>
              <Ionicons name="wallet-outline" size={16} color={accentColor} />
            </View>
            <Text className="text-gray-400 text-sm">Số tiền thanh toán</Text>
          </View>
          <Text className="text-white font-extrabold text-lg" style={{ color: accentColor }}>{price}</Text>
        </View>

        {/* Confirm */}
        <TouchableOpacity
          onPress={onConfirm}
          disabled={loading}
          className="w-full rounded-2xl py-4 items-center"
          style={{ backgroundColor: loading ? '#333' : accentColor }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-black font-bold text-base">Tôi đã thanh toán xong</Text>
          )}
        </TouchableOpacity>

        {/* Cancel */}
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

  useEffect(() => {
    const load = async () => {
      try {
        const status = await getVipStatus();
        if (status) {
          setCurrentStatus(status);
          setDaysLeft(Math.ceil((status.expiresAt - Date.now()) / 86400000));
          setSelectedPkg(status.package);
        }
      } catch {
        setCurrentStatus(null);
      }
    };
    load();
  }, []);

  const selectedPkgData = PACKAGES.find((p) => p.id === selectedPkg);

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

    try {
      // Simulate processing time
      await new Promise((r) => setTimeout(r, 1500));

      // Call backend to activate VIP
      await activateVip(selectedPkg, selectedMethod);

      const status = await getVipStatus();
      const left = status ? Math.ceil((status.expiresAt - Date.now()) / 86400000) : 7;

      setShowQR(false);
      setShowSuccess(true);
      setCurrentStatus(status);
      setDaysLeft(left);
    } catch (error: any) {
      Alert.alert('Thanh toán chưa hoàn tất', error?.message || 'Không thể kích hoạt VIP lúc này.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    );
  };

  const handleRenew = () => {
    Alert.alert('Gia hạn', 'Tính năng gia hạn tự động sẽ sớm ra mắt!');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#09090b' }}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-white text-xl font-bold text-center pr-8">Nâng cấp tài khoản</Text>
      </View>

      {/* VIP Active Banner */}
      {currentStatus && currentStatus.isActive && (
        <View
          className="mx-4 mb-5 rounded-2xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: selectedPkgData?.accentColor || '#f59e0b' }}
        >
          <LinearGradient
            colors={[selectedPkgData?.gradientFrom || '#451a03', selectedPkgData?.gradientTo || '#78350f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-5 py-4 flex-row items-center"
          >
            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: (selectedPkgData?.accentColor || '#fbbf24') + '20' }}>
              <MaterialCommunityIcons name="diamond-stone" size={24} color={selectedPkgData?.accentColor || '#fbbf24'} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">VIP Đang hoạt động</Text>
              <Text className="text-white/60 text-sm mt-0.5">
                Còn {daysLeft} ngày · {VIP_PACKAGES[currentStatus.package].name}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRenew} className="rounded-full px-4 py-2" style={{ backgroundColor: (selectedPkgData?.accentColor || '#fbbf24') + '30', borderWidth: 1, borderColor: (selectedPkgData?.accentColor || '#fbbf24') + '60' }}>
              <Text className="text-white font-bold text-sm">Gia hạn</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Section title */}
        <View className="mb-4">
          <Text className="text-white text-xl font-bold">Chọn gói dịch vụ</Text>
          <Text className="text-gray-500 text-sm mt-1">Chạm để chọn gói phù hợp với bạn</Text>
        </View>

        {/* Package Cards */}
        {PACKAGES.map((pkg) => {
          const isSelected = selectedPkg === pkg.id;
          const info = VIP_PACKAGES[pkg.id];

          return (
            <TouchableOpacity
              key={pkg.id}
              activeOpacity={0.8}
              onPress={() => setSelectedPkg(isSelected ? null : pkg.id)}
              className="mb-4 rounded-3xl overflow-hidden"
              style={{
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? pkg.borderColor : '#27272a',
                shadowColor: isSelected ? pkg.accentColor : 'transparent',
                shadowOpacity: isSelected ? 0.4 : 0,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: isSelected ? 8 : 0,
              }}
            >
              {/* Card Header with gradient */}
              <LinearGradient
                colors={[pkg.gradientFrom, pkg.gradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-5 pt-5 pb-4"
              >
                {/* Badge */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: pkg.accentColor + '30' }}
                    >
                      <MaterialCommunityIcons name={pkg.icon as any} size={20} color={pkg.accentColor} />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-lg leading-tight">{pkg.name}</Text>
                      <Text className="text-white/50 text-xs mt-0.5">{pkg.tagline}</Text>
                    </View>
                  </View>
                  <View className="rounded-full px-3 py-1" style={{ backgroundColor: pkg.badgeColor + '30', borderWidth: 1, borderColor: pkg.badgeColor + '50' }}>
                    <Text className="text-white text-[10px] font-black" style={{ color: pkg.accentColor }}>{pkg.badge}</Text>
                  </View>
                </View>

                {/* Price */}
                <View className="flex-row items-baseline">
                  <Text className="text-white font-black text-3xl">{pkg.price}</Text>
                  <Text className="text-white/40 text-sm ml-1">/tuần</Text>
                </View>
              </LinearGradient>

              {/* Features (expand when selected) */}
              <View className="px-5 py-4" style={{ backgroundColor: '#18181b' }}>
                {isSelected ? (
                  <>
                    {pkg.features.map((f, i) => (
                      <View key={i} className="flex-row items-center mb-3">
                        <View
                          className="w-6 h-6 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: pkg.accentColor + '20' }}
                        >
                          <Ionicons name={f.icon as any} size={13} color={pkg.accentColor} />
                        </View>
                        <Text className="text-gray-300 text-sm flex-1">{f.text}</Text>
                        <Ionicons name="checkmark-circle" size={16} color={pkg.accentColor} />
                      </View>
                    ))}
                    {pkg.extra && (
                      <View className="flex-row items-center mb-3">
                        <View
                          className="w-6 h-6 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: pkg.accentColor + '20' }}
                        >
                          <Ionicons name={pkg.extra.icon as any} size={13} color={pkg.accentColor} />
                        </View>
                        <Text className="text-gray-300 text-sm flex-1">{pkg.extra.text}</Text>
                        <Ionicons name="checkmark-circle" size={16} color={pkg.accentColor} />
                      </View>
                    )}
                    {/* Comparison hint */}
                    {pkg.id === 'spotlight_name' && (
                      <View className="mt-2 rounded-xl px-3 py-2 flex-row items-center" style={{ backgroundColor: '#27272a' }}>
                        <Ionicons name="information-circle-outline" size={14} color="#fbbf24" />
                        <Text className="text-gray-500 text-xs ml-2 flex-1">
                          Muốn nhiều hơn?{' '}
                          <Text
                            className="font-bold underline"
                            style={{ color: '#a855f7' }}
                            onPress={() => setSelectedPkg('spotlight_profile')}
                          >
                            Nâng cấp lên Profile
                          </Text>
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color={pkg.accentColor} />
                    <Text className="text-gray-500 text-xs ml-2">
                      {pkg.features.length} tính năng được bao gồm
                    </Text>
                    <View className="flex-1" />
                    <Text className="text-gray-500 text-xs">Chạm để xem chi tiết</Text>
                    <Ionicons name="chevron-forward" size={14} color="#52525b" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Payment Methods */}
        <View className="mt-2 mb-4">
          <Text className="text-white text-xl font-bold mb-3">Phương thức thanh toán</Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#18181b' }}>
            {PAYMENT_METHODS.map((m, i) => {
              const isSelected = selectedMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedMethod(m.id)}
                  className="flex-row items-center px-5 py-4"
                  style={{
                    borderBottomWidth: i < PAYMENT_METHODS.length - 1 ? 1 : 0,
                    borderBottomColor: '#27272a',
                    backgroundColor: isSelected ? m.color + '10' : 'transparent',
                  }}
                >
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: m.color + '20' }}
                  >
                    <Ionicons name={m.icon as any} size={22} color={m.color} />
                  </View>
                  <Text className="flex-1 text-white font-medium text-base">{m.name}</Text>
                  <View
                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                    style={{ borderColor: isSelected ? m.color : '#52525b', backgroundColor: isSelected ? m.color : 'transparent' }}
                  >
                    {isSelected && <Ionicons name="checkmark" size={13} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary + CTA */}
        {selectedPkgData && (
          <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#18181b' }}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-400 text-sm">Gói đã chọn</Text>
                <Text className="text-white font-bold text-base mt-0.5">{selectedPkgData.name}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-400 text-sm">Tổng thanh toán</Text>
                <Text className="font-black text-2xl mt-0.5" style={{ color: selectedPkgData.accentColor }}>
                  {selectedPkgData.price}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={!selectedPkg}
          activeOpacity={0.8}
          className="rounded-2xl overflow-hidden mb-4"
          style={{ opacity: selectedPkg ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={selectedPkg ? [selectedPkgData!.gradientFrom, selectedPkgData!.gradientTo] : ['#27272a', '#18181b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-extrabold text-lg">
              {selectedPkg ? 'Thanh toán ngay' : 'Chọn gói để tiếp tục'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Trust badges */}
        <View className="flex-row items-center justify-center mb-2">
          <Ionicons name="shield-checkmark" size={14} color="#4ade80" />
          <Text className="text-gray-500 text-xs ml-1.5">Thanh toán bảo mật qua VietQR</Text>
          <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
          <Ionicons name="time-outline" size={14} color="#4ade80" />
          <Text className="text-gray-500 text-xs ml-1.5">Dịch vụ tự động kích hoạt</Text>
        </View>
        <View className="flex-row items-center justify-center">
          <Ionicons name="refresh" size={14} color="#4ade80" />
          <Text className="text-gray-500 text-xs ml-1.5">Không tự động gia hạn</Text>
          <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
          <Ionicons name="close-circle-outline" size={14} color="#4ade80" />
          <Text className="text-gray-500 text-xs ml-1.5">Huỷ bất cứ lúc nào</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <QRModal
        visible={showQR}
        pkgName={selectedPkgData?.name || ''}
        price={selectedPkgData?.price || ''}
        accentColor={selectedPkgData?.accentColor || '#fbbf24'}
        onConfirm={handleConfirmPayment}
        onClose={() => setShowQR(false)}
        loading={processing}
      />

      <SuccessModal
        visible={showSuccess}
        pkgName={selectedPkgData?.name || ''}
        pkgId={selectedPkg || 'spotlight_name'}
        daysLeft={daysLeft}
        onClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
};

export default PaymentScreen;
