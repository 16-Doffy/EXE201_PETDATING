import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MainTabParamList, PetModel, RootStackParamList } from '@/types';
import { getPetByOwnerId } from '@/services/petService';
import { logout } from '@/services/authService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MOCK_PROFILE_PET: PetModel = {
  id: 'mock-my-pet',
  ownerId: 'mock-owner',
  name: 'Coco',
  age: '2 tuổi',
  breed: 'Pug',
  gender: 'Female',
  location: 'Quận 7, TP.HCM',
  bio: 'Mình thân thiện, thích đi dạo buổi tối.',
  image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900',
  ownerContact: '0909000001',
};

type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: keyof RootStackParamList;
  danger?: boolean;
};

const ProfileScreen = ({ navigation }: Props) => {
  const [pet, setPet] = useState<PetModel | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPetByOwnerId();
        setPet(result ?? MOCK_PROFILE_PET);
      } catch {
        setPet(MOCK_PROFILE_PET);
      }
    };

    load();
  }, []);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { key: 'my-profile', label: 'My profile', icon: 'person-outline', route: 'MyProfile' },
      { key: 'health', label: 'Health Information', icon: 'medkit-outline', route: 'HealthInfo' },
      { key: 'settings', label: 'Settings', icon: 'settings-outline', route: 'Settings' },
      { key: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark-outline', route: 'PrivacyPolicy' },
      { key: 'legal', label: 'Legal Term', icon: 'document-text-outline', route: 'LegalTerm' },
      { key: 'about', label: 'About App', icon: 'information-circle-outline', route: 'AboutApp' },
      { key: 'faq', label: 'FAQ', icon: 'help-circle-outline', route: 'FAQ' },
      { key: 'logout', label: 'Log Out', icon: 'log-out-outline', danger: true },
    ],
    []
  );

  const onMenuPress = (item: MenuItem) => {
    if (item.key === 'logout') {
      Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
      ]);
      return;
    }

    if (item.route) navigation.navigate(item.route as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="w-full max-w-[420px] self-center px-4 pt-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[28px] font-bold text-figmaTextBlue">Profile</Text>
            <TouchableOpacity activeOpacity={0.85}>
              <MaterialIcons name="more-vert" size={22} color="#2C4CDE" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-5">
            <View className="w-24 h-24 rounded-full overflow-hidden bg-white border border-blue-100">
              {pet?.image ? <Image source={{ uri: pet.image }} className="w-full h-full" /> : null}
            </View>
            <Text className="text-[30px] font-bold text-slate-900 mt-3">{pet?.name ?? 'COCO'}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="checkmark-circle" size={16} color="#3478F6" />
              <Text className="text-[#3478F6] ml-1">Verified</Text>
            </View>
          </View>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => onMenuPress(item)}
              className="bg-white rounded-2xl px-4 py-4 mb-3 border border-[#EEF2FF] flex-row items-center"
              activeOpacity={0.85}
            >
              <View className="w-8 items-start">
                <Ionicons name={item.icon} size={20} color={item.danger ? '#EF4444' : '#3B82F6'} />
              </View>
              <Text className={`flex-1 text-[16px] ${item.danger ? 'text-red-500' : 'text-slate-800'}`}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
