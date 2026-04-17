import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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

const PACKAGES = [
  {
    id: 'spotlight_name' as VipPackage,
    name: 'Nổi bật tên',
    price: '29.000',
    badge: 'HOT',
    badgeColor: '#FF9500',
    gradientFrom: '#451a03',
    gradientTo: '#78350f',
    accentColor: '#fbbf24',
    icon: 'medal-outline',
    features: [
      'Tên hiển thị đầu danh sách',
      'Viền vàng nổi bật trên Home',
      'Hiển thị badge trên card',
      'Ưu tiên xuất hiện trước',
    ],
  },
  {
    id: 'spotlight_profile' as VipPackage,
    name: 'Profile nổi bật',
    price: '49.000',
    badge: 'BEST VALUE',
    badgeColor: '#a855f7',
    gradientFrom: '#2e1065',
    gradientTo: '#4c1d95',
    accentColor: '#c084fc',
    icon: 'crown-outline',
    features: [
      'Tất cả tính năng gói Nổi bật tên',
      'Profile lên đầu tab Trò chuyện',
      'Ảnh lớn hơn trên Home',
      'Ghim profile ưu tiên',
      'Thông báo khi có người mới thích',
    ],
  },
];

const PAYMENT_METHODS = [
  { id: 'vietqr', name: 'VietQR (QR Code)', icon: 'qr-code-outline', color: '#22c55e' },
  { id: 'momo', name: 'Ví MoMo', icon: 'wallet-outline', color: '#ec4899' },
  { id: 'zalo', name: 'Ví ZaloPay', icon: 'chatbubble-outline', color: '#0068ff' },
  { id: 'card', name: 'Thẻ ngân hàng', icon: 'card-outline', color: '#f59e0b' },
];

const SuccessModal = ({
  visible,
  pkgName,
  pkgId,
  daysLeft,
  onClose,
  modalWidth,
}: {
  visible: boolean;
  pkgName: string;
  pkgId: VipPackage;
  daysLeft: number;
  onClose: () => void;
  modalWidth: number;
}) => {
  const activePackage = PACKAGES.find((item) => item.id === pkgId) ?? PACKAGES[0];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <View className="overflow-hidden rounded-3xl" style={{ width: modalWidth }}>
          <LinearGradient
            colors={[activePackage.gradientFrom, activePackage.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center px-7 py-8"
          >
            <View
              className="mb-5 h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: `${activePackage.accentColor}20` }}
            >
              <Ionicons name="checkmark-circle" size={60} color={activePackage.accentColor} />
            </View>

            <Text className="text-center text-2xl font-bold text-white">Thanh toán thành công!</Text>
            <Text className="mt-2 text-center text-sm text-white/75">Gói "{pkgName}" đã được kích hoạt</Text>

            <View
              className="mt-5 w-full rounded-2xl px-5 py-4"
              style={{ backgroundColor: `${activePackage.accentColor}20`, borderWidth: 1, borderColor: `${activePackage.accentColor}50` }}
            >
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="diamond-stone" size={18} color={activePackage.accentColor} />
                <Text className="ml-2 text-sm font-bold text-white">VIP đang hoạt động</Text>
              </View>
              <Text className="mt-1 text-center text-xs text-white/75">Còn {daysLeft} ngày</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="mt-6 w-full items-center rounded-2xl py-4"
              style={{ backgroundColor: activePackage.accentColor }}
            >
              <Text className="text-base font-bold text-black">Khám phá ngay</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const QRModal = ({
  visible,
  pkgName,
  price,
  accentColor,
  onConfirm,
  onClose,
  loading,
  modalWidth,
  qrSize,
  safeBottom,
}: {
  visible: boolean;
  pkgName: string;
  price: string;
  accentColor: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  modalWidth: number;
  qrSize: number;
  safeBottom: number;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}>
      <View className="rounded-t-[40px]" style={{ backgroundColor: '#0f0f0f', maxHeight: '92%' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: safeBottom + 20 }}
        >
          <View className="mb-5 h-1 w-10 rounded-full bg-gray-600" />

          <View className="mb-1 flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Ionicons name="qr-code-outline" size={22} color={accentColor} />
            </View>
            <Text className="text-xl font-bold text-white">Quét QR thanh toán</Text>
          </View>

          <Text className="mb-6 text-center text-sm text-gray-500">
            Mở app ngân hàng hoặc ví MoMo/ZaloPay{'\n'}để quét mã cho gói {pkgName}
          </Text>

          <View
            className="mb-5 items-center justify-center rounded-3xl bg-white"
            style={{ width: qrSize, height: qrSize }}
          >
            <Ionicons name="qr-code" size={Math.floor(qrSize * 0.58)} color="#111827" />
            <Text className="mt-3 px-4 text-center text-xs text-gray-400">
              VietQR{'\n'}STK: 1903 0000 000 123{'\n'}PetDating Service
            </Text>
          </View>

          <View
            className="mb-5 flex-row items-center justify-between rounded-2xl p-4"
            style={{ backgroundColor: '#1a1a1a', width: modalWidth }}
          >
            <View className="flex-1 flex-row items-center pr-4">
              <View
                className="mr-2 h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Ionicons name="wallet-outline" size={16} color={accentColor} />
              </View>
              <Text className="text-sm text-gray-400">Số tiền thanh toán</Text>
            </View>
            <Text className="text-lg font-extrabold" style={{ color: accentColor }}>
              {price}đ
            </Text>
          </View>

          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading}
            className="items-center rounded-2xl py-4"
            style={{ backgroundColor: loading ? '#333333' : accentColor, width: modalWidth }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-black">Tôi đã thanh toán xong</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-4 py-3">
            <Text className="text-sm text-gray-500">Huỷ thanh toán</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const modalWidth = Math.min(width - 32, 360);
  const qrSize = Math.max(210, Math.min(width - 88, height < 760 ? 220 : 260));
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
          setDaysLeft(Math.max(0, Math.ceil((status.expiresAt - Date.now()) / 86400000)));
          setSelectedPkg(status.package);
        }
      } catch {
        setCurrentStatus(null);
      }
    };

    load();
  }, []);

  const selectedPkgData = PACKAGES.find((item) => item.id === selectedPkg) ?? null;

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
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const status = await activateVip(selectedPkg);
      const left = Math.max(0, Math.ceil((status.expiresAt - Date.now()) / 86400000));

      setCurrentStatus(status);
      setDaysLeft(left);
      setShowQR(false);
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Thanh toán chưa hoàn tất', error?.message || 'Không thể kích hoạt gói VIP lúc này.');
    } finally {
      setProcessing(false);
    }
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#09090b' }}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text className="flex-1 pr-8 text-center text-xl font-bold text-white">Nâng cấp tài khoản</Text>
      </View>

      {currentStatus?.isActive && (
        <View
          className="mx-4 mb-4 overflow-hidden rounded-2xl"
          style={{ borderWidth: 1, borderColor: selectedPkgData?.accentColor || '#fbbf24' }}
        >
          <LinearGradient
            colors={[selectedPkgData?.gradientFrom || '#451a03', selectedPkgData?.gradientTo || '#78350f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center px-5 py-4"
          >
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${selectedPkgData?.accentColor || '#fbbf24'}20` }}
            >
              <MaterialCommunityIcons
                name="diamond-stone"
                size={24}
                color={selectedPkgData?.accentColor || '#fbbf24'}
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-white">VIP đang hoạt động</Text>
              <Text className="mt-0.5 text-sm text-white/65">
                Còn {daysLeft} ngày · {VIP_PACKAGES[currentStatus.package].name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert('Gia hạn', 'Tính năng gia hạn sẽ sớm ra mắt!')}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: `${selectedPkgData?.accentColor || '#fbbf24'}30`,
                borderWidth: 1,
                borderColor: `${selectedPkgData?.accentColor || '#fbbf24'}50`,
              }}
            >
              <Text className="text-sm font-bold text-white">Gia hạn</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28 }}
      >
        <View className="mb-4">
          <Text className="text-xl font-bold text-white">Chọn gói dịch vụ</Text>
          <Text className="mt-1 text-sm text-gray-500">Chạm để chọn gói phù hợp với bạn</Text>
        </View>

        {PACKAGES.map((item) => {
          const isSelected = selectedPkg === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => setSelectedPkg(isSelected ? null : item.id)}
              className="mb-4 overflow-hidden rounded-3xl"
              style={{
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? item.badgeColor : '#27272a',
              }}
            >
              <LinearGradient
                colors={[item.gradientFrom, item.gradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-5 pb-4 pt-5"
              >
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="mr-4 flex-1 flex-row items-center">
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${item.accentColor}30` }}
                    >
                      <MaterialCommunityIcons name={item.icon as any} size={22} color={item.accentColor} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white">{item.name}</Text>
                      <Text className="mt-0.5 text-xs text-white/60">Gói VIP cho hồ sơ thú cưng</Text>
                    </View>
                  </View>

                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${item.badgeColor}30`, borderWidth: 1, borderColor: `${item.badgeColor}55` }}
                  >
                    <Text className="text-[10px] font-black" style={{ color: item.accentColor }}>
                      {item.badge}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-baseline">
                  <Text className="text-3xl font-black text-white">{item.price}</Text>
                  <Text className="ml-1 text-sm text-white/45">đ / tuần</Text>
                </View>
              </LinearGradient>

              <View className="bg-[#18181b] px-5 py-4">
                {item.features.map((feature) => (
                  <View key={feature} className="mb-3 flex-row items-center">
                    <View
                      className="mr-3 h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${item.accentColor}20` }}
                    >
                      <Ionicons name="checkmark" size={13} color={item.accentColor} />
                    </View>
                    <Text className="flex-1 text-sm text-gray-300">{feature}</Text>
                  </View>
                ))}

                <View className="mt-1 flex-row items-center justify-end">
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full border-2"
                    style={{ borderColor: isSelected ? item.accentColor : '#52525b' }}
                  >
                    {isSelected ? (
                      <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.accentColor }} />
                    ) : null}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="mt-2 mb-4">
          <Text className="mb-3 text-xl font-bold text-white">Phương thức thanh toán</Text>
          <View className="overflow-hidden rounded-2xl" style={{ backgroundColor: '#18181b' }}>
            {PAYMENT_METHODS.map((item, index) => {
              const isSelected = selectedMethod === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.75}
                  onPress={() => setSelectedMethod(item.id)}
                  className="flex-row items-center px-5 py-4"
                  style={{
                    borderBottomWidth: index < PAYMENT_METHODS.length - 1 ? 1 : 0,
                    borderBottomColor: '#27272a',
                    backgroundColor: isSelected ? `${item.color}10` : 'transparent',
                  }}
                >
                  <View
                    className="mr-4 h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text className="flex-1 text-base font-medium text-white">{item.name}</Text>
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full border-2"
                    style={{ borderColor: isSelected ? item.color : '#52525b', backgroundColor: isSelected ? item.color : 'transparent' }}
                  >
                    {isSelected ? <Ionicons name="checkmark" size={13} color="#ffffff" /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedPkgData ? (
          <View className="mb-4 rounded-2xl p-4" style={{ backgroundColor: '#18181b' }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-400">Gói đã chọn</Text>
                <Text className="mt-0.5 text-base font-bold text-white">{selectedPkgData.name}</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-gray-400">Tổng thanh toán</Text>
                <Text className="mt-0.5 text-2xl font-black" style={{ color: selectedPkgData.accentColor }}>
                  {selectedPkgData.price}đ
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handlePurchase}
          disabled={!selectedPkg}
          activeOpacity={0.85}
          className="mb-4 overflow-hidden rounded-2xl"
          style={{ opacity: selectedPkg ? 1 : 0.45 }}
        >
          <LinearGradient
            colors={
              selectedPkgData
                ? [selectedPkgData.gradientFrom, selectedPkgData.gradientTo]
                : ['#27272a', '#18181b']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center rounded-2xl py-4"
          >
            <Text className="text-lg font-extrabold text-white">
              {selectedPkg ? 'Thanh toán ngay' : 'Chọn gói để tiếp tục'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View className="mt-1 flex-row flex-wrap justify-center">
          {[
            { icon: 'shield-checkmark', text: 'Thanh toán bảo mật' },
            { icon: 'time-outline', text: 'Kích hoạt nhanh' },
            { icon: 'refresh', text: 'Không tự gia hạn' },
            { icon: 'close-circle-outline', text: 'Huỷ bất cứ lúc nào' },
          ].map((item) => (
            <View
              key={item.text}
              className="mb-2 mr-2 flex-row items-center rounded-full px-3 py-2"
              style={{ backgroundColor: '#18181b' }}
            >
              <Ionicons name={item.icon as any} size={14} color="#4ade80" />
              <Text className="ml-1.5 text-xs text-gray-400">{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <QRModal
        visible={showQR}
        pkgName={selectedPkgData?.name || ''}
        price={selectedPkgData?.price || ''}
        accentColor={selectedPkgData?.accentColor || '#fbbf24'}
        onConfirm={handleConfirmPayment}
        onClose={() => setShowQR(false)}
        loading={processing}
        modalWidth={modalWidth}
        qrSize={qrSize}
        safeBottom={insets.bottom}
      />

      <SuccessModal
        visible={showSuccess}
        pkgName={selectedPkgData?.name || ''}
        pkgId={selectedPkg || 'spotlight_name'}
        daysLeft={daysLeft}
        onClose={handleSuccessClose}
        modalWidth={modalWidth}
      />
    </SafeAreaView>
  );
};

export default PaymentScreen;
