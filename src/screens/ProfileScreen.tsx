import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, PetModel, RootStackParamList } from '@/types';
import { getPetByOwnerId, createPetProfile } from '@/services/petService';
import { logout } from '@/services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImage } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ProfileScreen = ({ navigation }: Props) => {
  const [pet, setPet] = useState<PetModel | null>(null);

  useEffect(() => {
    const load = async () => {
        const result = await getPetByOwnerId();
        setPet(result);
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
        <View className="bg-white rounded-[32px] p-8 items-center shadow-lg shadow-gray-200 border border-gray-50 mb-8">
          <View className="relative">
            <View className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/10 bg-gray-50">
              <Image source={{ uri: pet?.image || getRandomImage('Dog', 'me') }} className="w-full h-full" />
            </View>
            <TouchableOpacity onPress={pickImage} className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-textMain mt-4">{pet?.name || 'Coco'}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="checkmark-circle" size={14} color="#00B4DB" />
            <Text className="text-primary text-xs font-bold ml-1">Đã xác thực</Text>
          </View>

          <View className="flex-row w-full mt-8 border-t border-gray-50 pt-6">
            <View className="flex-1 items-center border-r border-gray-50">
              <Text className="text-lg font-bold text-textMain">12</Text>
              <Text className="text-textSub text-xs">Matches</Text>
            </View>
            <View className="flex-1 items-center border-r border-gray-50">
              <Text className="text-lg font-bold text-textMain">48</Text>
              <Text className="text-textSub text-xs">Likes</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-textMain">2</Text>
              <Text className="text-textSub text-xs">Pets</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="bg-white/50 rounded-3xl p-2 mb-10">
          {menuItems.map((item: any) => (
            <TouchableOpacity
                key={item.key}
                onPress={() => item.key === 'logout' ? logout() : navigation.navigate(item.route)}
                className="flex-row items-center p-4 mb-1"
            >
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${item.danger ? 'bg-red-50' : 'bg-gray-100'}`}>
                <Ionicons name={item.icon} size={20} color={item.danger ? '#EF4444' : '#64748B'} />
              </View>
              <Text className={`flex-1 ml-4 font-bold ${item.danger ? 'text-red-500' : 'text-textMain'}`}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
