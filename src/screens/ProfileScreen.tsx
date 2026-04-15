import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList, PetModel, RootStackParamList } from '@/types';
import { getPetByOwnerId, getSocialStats } from '@/services/petService';
import { logout } from '@/services/authService';
import { isVipActive, getVipDaysLeft, getVipStatus } from '@/services/vipService';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImage } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ProfileScreen = ({ navigation }: Props) => {
  const [pet, setPet] = useState<PetModel | null>(null);
  const [stats, setStats] = useState({ matches: 0, likes: 0, pets: 1 });
  const [vipActive, setVipActive] = useState(false);
  const [vipDaysLeft, setVipDaysLeft] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [result, socialStats, isVip, days] = await Promise.all([
        getPetByOwnerId(),
        getSocialStats(),
        isVipActive(),
        getVipDaysLeft(),
      ]);
      setPet(result);
      setStats(socialStats);
      setVipActive(isVip);
      setVipDaysLeft(days);
    };
    load();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && pet) {
        const newImageUri = result.assets[0].uri;

        // 1. Cập nhật giao diện ngay lập tức
        const updatedPet = { ...pet, image: newImageUri };
        setPet(updatedPet);

        // 2. Lưu vào bộ nhớ hệ thống
        try {
            await createPetProfile({
                name: pet.name,
                age: pet.age,
                breed: pet.breed,
                gender: pet.gender,
                type: pet.type,
                location: pet.location,
                bio: pet.bio,
                image: newImageUri,
                ownerContact: pet.ownerContact,
            });
            Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới!');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu ảnh mới.');
        }
    }
  };

  const menuItems = useMemo(() => [
    { key: 'upgrade', label: 'Nâng cấp tài khoản', icon: 'diamond', route: 'Payment', premium: true },
    { key: 'my-profile', label: 'Hồ sơ của tôi', icon: 'person-outline', route: 'MyProfile' },
    { key: 'health', label: 'Thông tin sức khỏe', icon: 'medkit-outline', route: 'HealthInfo' },
    { key: 'settings', label: 'Cài đặt', icon: 'settings-outline', route: 'Settings' },
    { key: 'privacy', label: 'Chính sách bảo mật', icon: 'shield-checkmark-outline', route: 'PrivacyPolicy' },
    { key: 'logout', label: 'Đăng xuất', icon: 'log-out-outline', danger: true },
  ], []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#E0EAFC', '#FFFFFF']} className="absolute inset-0" />
      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <View className="flex-row items-center justify-between py-6">
          <Text className="text-3xl font-bold text-textMain">Cá nhân</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="bg-gray-100 p-2.5 rounded-full">
            <Ionicons name="settings-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View
          className="bg-white rounded-[32px] p-8 items-center shadow-lg shadow-gray-200 mb-8"
          style={{
            borderWidth: vipActive ? 2 : 1,
            borderColor: vipActive ? '#FFD700' : '#f0f0f0',
          }}
        >
          <View className="relative">
            <View
              className="w-28 h-28 rounded-full overflow-hidden bg-gray-50"
              style={{ borderWidth: vipActive ? 3 : 4, borderColor: vipActive ? '#FFD700' : 'rgba(0,180,219,0.1)' }}
            >
              <Image source={{ uri: pet?.image || getRandomImage('Dog', 'me') }} className="w-full h-full" />
            </View>

            {/* Camera button */}
            <TouchableOpacity onPress={pickImage} className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>

            {/* VIP badge */}
            {vipActive && (
              <View className="absolute -top-2 -left-2 bg-yellow-400 w-8 h-8 rounded-full items-center justify-center shadow-md">
                <MaterialCommunityIcons name="diamond-stone" size={16} color="#7A5C00" />
              </View>
            )}
          </View>

          <View className="flex-row items-center mt-4">
            <Text className="text-2xl font-bold text-textMain">{pet?.name || 'Coco'}</Text>
            {vipActive && (
              <View className="ml-2 bg-yellow-400 rounded-full px-2 py-0.5 flex-row items-center">
                <MaterialCommunityIcons name="diamond-stone" size={12} color="#7A5C00" />
                <Text className="text-yellow-900 text-[10px] font-bold ml-1">VIP</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mt-1">
            {vipActive ? (
              <>
                <MaterialCommunityIcons name="diamond-stone" size={14} color="#FFD700" />
                <Text className="text-yellow-600 text-xs font-bold ml-1">Hạng VIP · {vipDaysLeft} ngày</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={14} color="#00B4DB" />
                <Text className="text-primary text-xs font-bold ml-1">Đã xác thực</Text>
              </>
            )}
          </View>

          <View className="flex-row w-full mt-8 border-t border-gray-50 pt-6">
            <View className="flex-1 items-center border-r border-gray-50">
              <Text className="text-lg font-bold text-textMain">{stats.matches}</Text>
              <Text className="text-textSub text-xs">Matches</Text>
            </View>
            <View className="flex-1 items-center border-r border-gray-50">
              <Text className="text-lg font-bold text-textMain">{stats.likes}</Text>
              <Text className="text-textSub text-xs">Likes</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-textMain">{stats.pets}</Text>
              <Text className="text-textSub text-xs">Pets</Text>
            </View>
          </View>
        </View>

        {/* VIP Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Payment')}
          className="mb-6 rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={['#1a1a1a', '#2a1a00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-5 py-4 flex-row items-center"
          >
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name="diamond-stone" size={18} color="#FFD700" />
                <Text className="text-yellow-400 font-bold text-sm ml-2">Nâng cấp VIP</Text>
                <View className="ml-2 bg-red-500 rounded-full px-2 py-0.5">
                  <Text className="text-white text-[10px] font-bold">HOT</Text>
                </View>
              </View>
              <Text className="text-gray-300 text-xs">Nổi bật tên & profile trên đầu danh sách</Text>
            </View>
            <View className="bg-yellow-400 rounded-full px-4 py-1.5">
              <Text className="text-yellow-900 font-bold text-xs">29K</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Menu */}
        <View className="bg-white/50 rounded-3xl p-2 mb-10">
          {menuItems.map((item: any) => (
            <TouchableOpacity
                key={item.key}
                onPress={() => item.key === 'logout' ? logout() : navigation.navigate(item.route)}
                className="flex-row items-center p-4 mb-1"
                style={item.premium ? { backgroundColor: '#FFF9E6', borderRadius: 16 } : undefined}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${item.danger ? 'bg-red-50' : item.premium ? 'bg-yellow-50' : 'bg-gray-100'}`}
              >
                <Ionicons name={item.icon} size={20} color={item.danger ? '#EF4444' : item.premium ? '#FFB800' : '#64748B'} />
              </View>
              <Text className={`flex-1 ml-4 font-bold ${item.danger ? 'text-red-500' : item.premium ? 'text-yellow-700' : 'text-textMain'}`}>{item.label}</Text>
              {item.premium ? (
                <View className="bg-yellow-400 rounded-full px-2 py-0.5">
                  <Text className="text-xs font-bold text-yellow-900">HOT</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
