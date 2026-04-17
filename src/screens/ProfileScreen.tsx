import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, PetModel, RootStackParamList } from '@/types';
import { createPetProfile, getPetByOwnerId, getSocialStats } from '@/services/petService';
import { logout } from '@/services/authService';
import { getVipDaysLeft, isVipActive } from '@/services/vipService';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImage } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';
import AppIcon from '@/components/ui/AppIcon';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ProfileMenuRoute = 'Payment' | 'MyProfile' | 'HealthInfo' | 'Settings' | 'PrivacyPolicy';

type MenuItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  route?: ProfileMenuRoute;
  premium?: boolean;
  danger?: boolean;
  description?: string;
};

const ProfileScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactActions = width < 390;
  const [pet, setPet] = useState<PetModel | null>(null);
  const [stats, setStats] = useState({ matches: 0, likes: 0, pets: 1 });
  const [vipActive, setVipActive] = useState(false);
  const [vipDaysLeft, setVipDaysLeft] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [result, socialStats, vip, days] = await Promise.all([
        getPetByOwnerId(),
        getSocialStats(),
        isVipActive(),
        getVipDaysLeft(),
      ]);
      setPet(result);
      setStats(socialStats);
      setVipActive(vip);
      setVipDaysLeft(days);
    };

    load();
  }, []);

  const savePickedImage = async (imageUri: string) => {
    if (!pet) return;

    setPet({ ...pet, image: imageUri });

    try {
      await createPetProfile({
        name: pet.name,
        age: pet.age,
        breed: pet.breed,
        gender: pet.gender,
        type: pet.type,
        location: pet.location,
        bio: pet.bio,
        image: imageUri,
        ownerContact: pet.ownerContact,
        weight: pet.weight,
        tags: pet.tags,
      });
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới!');
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu ảnh mới.');
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const imageUri = asset.base64
        ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      await savePickedImage(imageUri);
    }
  };

  const captureImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền máy ảnh', 'Vui lòng cho phép ứng dụng truy cập máy ảnh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const imageUri = asset.base64
        ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      await savePickedImage(imageUri);
    }
  };

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        key: 'upgrade',
        label: 'Nâng cấp tài khoản',
        icon: 'vip',
        route: 'Payment',
        premium: true,
        description: 'Mở thêm quyền lợi nổi bật hồ sơ',
      },
      { key: 'my-profile', label: 'Hồ sơ của tôi', icon: 'profile-card', route: 'MyProfile', description: 'Xem và chỉnh sửa thông tin của bé' },
      { key: 'health', label: 'Thông tin sức khỏe', icon: 'health', route: 'HealthInfo', description: 'Lưu cân nặng, tiêm ngừa, tình trạng' },
      { key: 'settings', label: 'Cài đặt', icon: 'settings', route: 'Settings', description: 'Tùy chỉnh trải nghiệm sử dụng app' },
      { key: 'privacy', label: 'Chính sách bảo mật', icon: 'shield', route: 'PrivacyPolicy', description: 'Xem cách ứng dụng bảo vệ dữ liệu' },
      { key: 'logout', label: 'Đăng xuất', icon: 'logout', danger: true, description: 'Thoát về màn hình đăng nhập' },
    ],
    []
  );

  const renderMenuIcon = (item: MenuItem) => {
    const bgColor = item.danger ? '#ffe7ea' : item.premium ? '#fff4cc' : '#eef2ff';
    const iconColor = item.danger ? '#ef4444' : item.premium ? '#d97706' : '#475569';

    return (
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <AppIcon name={item.icon} size={22} color={iconColor} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fff8fb]">
      <LinearGradient colors={['#fff9fc', '#fff3f7', '#ffffff']} className="absolute inset-0" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <View className="flex-row items-center justify-between pt-5 pb-4">
          <View>
            <Text className="text-[32px] font-black text-slate-900">Cá nhân</Text>
            <Text className="mt-1 text-sm font-medium text-slate-400">Quản lý hồ sơ thú cưng của bạn</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            className="w-12 h-12 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: '#f472b6',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}
          >
            <AppIcon name="settings" size={22} color="#334155" />
          </TouchableOpacity>
        </View>

        <View
          className="rounded-[32px] bg-white px-6 py-7 items-center"
          style={{
            shadowColor: '#f472b6',
            shadowOpacity: 0.1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 5,
          }}
        >
          <View className="relative">
            <View
              className="w-28 h-28 rounded-full overflow-hidden bg-rose-50"
              style={{
                borderWidth: 4,
                borderColor: vipActive ? '#facc15' : '#fbcfe8',
              }}
            >
              <Image
                source={{ uri: pet?.image || getRandomImage(pet?.type || 'Dog', pet?.id || 'me') }}
                className="w-full h-full"
              />
            </View>

            <TouchableOpacity
              onPress={pickImage}
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#ff4f96', borderWidth: 3, borderColor: '#fff' }}
            >
              <AppIcon name="camera" size={18} color="#fff" />
            </TouchableOpacity>

            {vipActive && (
              <View className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-yellow-400 items-center justify-center">
                <AppIcon name="vip" size={16} color="#7a5c00" />
              </View>
            )}
          </View>

          <View className="mt-4 flex-row items-center">
            <Text className="text-[28px] font-black text-slate-900">{pet?.name || 'Bossitive'}</Text>
            {vipActive && (
              <View className="ml-2 rounded-full bg-yellow-100 px-3 py-1 flex-row items-center">
                <AppIcon name="vip" size={13} color="#ca8a04" />
                <Text className="ml-1 text-[11px] font-bold text-yellow-700">VIP</Text>
              </View>
            )}
          </View>

          <View className="mt-2 flex-row items-center">
            {vipActive ? (
              <>
                <AppIcon name="vip" size={15} color="#eab308" />
                <Text className="ml-1 text-[12px] font-bold text-yellow-600">
                  Hạng VIP · còn {vipDaysLeft} ngày
                </Text>
              </>
            ) : (
              <>
                <AppIcon name="check" size={15} color="#06b6d4" />
                <Text className="ml-1 text-[12px] font-bold text-cyan-600">Đã xác thực</Text>
              </>
            )}
          </View>

          <View className="mt-7 flex-row w-full rounded-[24px] bg-[#fff7fb] py-5">
            {[
              { label: 'Matches', value: stats.matches },
              { label: 'Likes', value: stats.likes },
              { label: 'Pets', value: stats.pets },
            ].map((item, index) => (
              <View
                key={item.label}
                className={`flex-1 items-center ${index < 2 ? 'border-r border-rose-100' : ''}`}
              >
                <Text className="text-[24px] font-black text-slate-900">{item.value}</Text>
                <Text className="mt-1 text-[12px] font-medium text-slate-400">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Payment')}
          className="mt-6 rounded-[28px] overflow-hidden"
          style={{
            shadowColor: '#fb7185',
            shadowOpacity: 0.16,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={['#1f1300', '#2d1d08', '#453008']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-5 py-5 flex-row items-center"
          >
            <View className="w-12 h-12 rounded-2xl bg-yellow-400/20 items-center justify-center mr-4">
              <AppIcon name="vip" size={24} color="#facc15" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-[24px] font-black text-yellow-300">Nâng cấp VIP</Text>
                <View className="ml-2 rounded-full bg-red-500 px-2.5 py-1">
                  <Text className="text-[10px] font-black text-white">HOT</Text>
                </View>
              </View>
              <Text className="mt-1 text-sm font-medium text-yellow-100/80">
                Nổi bật tên và profile trên đầu danh sách
              </Text>
            </View>
            <View className="rounded-full bg-yellow-400 px-4 py-2">
              <Text className="text-sm font-black text-yellow-900">29K</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View className="mt-5 rounded-[28px] bg-white px-5 py-4">
          <View className={`${compactActions ? '' : 'flex-row items-center'}`}>
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center">
                <AppIcon name="image" size={22} color="#ff4f96" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-slate-800 font-bold text-base">Ảnh hồ sơ</Text>
                <Text className="text-slate-500 text-xs mt-1">Đổi ảnh từ thư viện hoặc chụp mới trực tiếp</Text>
              </View>
            </View>

            <View className={`${compactActions ? 'mt-4' : 'ml-4'} flex-row`}>
              <TouchableOpacity
                onPress={pickImage}
                className={`rounded-full bg-slate-100 px-4 py-2 ${compactActions ? 'flex-1 mr-2 items-center' : 'mr-2'}`}
              >
                <Text className="text-slate-700 text-xs font-bold">Thư viện</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={captureImage}
                className={`rounded-full bg-slate-900 px-4 py-2 ${compactActions ? 'flex-1 items-center' : ''}`}
              >
                <Text className="text-white text-xs font-bold">Chụp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-6 mb-10 rounded-[30px] bg-white px-3 py-3">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() =>
                item.key === 'logout' ? logout() : item.route ? navigation.navigate(item.route as never) : null
              }
              className="mb-2 flex-row items-center rounded-[24px] px-4 py-4"
              style={{
                backgroundColor: item.premium ? '#fff9df' : item.danger ? '#fff5f5' : '#ffffff',
              }}
            >
              {renderMenuIcon(item)}

              <View className="ml-4 flex-1">
                <Text
                  className={`text-[18px] font-bold ${
                    item.danger ? 'text-red-500' : item.premium ? 'text-amber-700' : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </Text>
                {item.description ? (
                  <Text className={`mt-1 text-[12px] font-medium ${item.danger ? 'text-red-300' : item.premium ? 'text-amber-600' : 'text-slate-400'}`}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              {item.premium ? (
                <View className="rounded-full bg-yellow-400 px-3 py-1">
                  <Text className="text-[10px] font-black text-yellow-900">HOT</Text>
                </View>
              ) : (
                <AppIcon
                  name={item.danger ? 'logout' : 'chevron-right'}
                  size={20}
                  color={item.danger ? '#ef4444' : '#cbd5e1'}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
