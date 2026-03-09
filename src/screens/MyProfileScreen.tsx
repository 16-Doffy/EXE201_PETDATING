import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PetModel, RootStackParamList } from '@/types';
import { getPetByOwnerId } from '@/services/petService';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

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

const MyProfileScreen = ({ navigation }: Props) => {
  const [pet, setPet] = useState<PetModel>(MOCK_PROFILE_PET);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPetByOwnerId();
        if (result) setPet(result);
      } catch {
        setPet(MOCK_PROFILE_PET);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="w-full max-w-[420px] self-center px-4 pt-2">
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-[24px] font-bold text-slate-900">My Profile</Text>
          </View>

          <View className="bg-white rounded-3xl p-4 border border-[#EEF2FF]">
            <Image source={{ uri: pet.image }} className="w-full h-[280px] rounded-2xl" resizeMode="cover" />
            <Text className="text-[30px] font-bold text-slate-900 mt-4">{pet.name}</Text>
            <Text className="text-slate-500 mt-1">{pet.gender} • {pet.age} • {pet.breed}</Text>
            <Text className="text-slate-500 mt-1">{pet.location}</Text>
            <Text className="text-slate-700 mt-4 leading-6">{pet.bio || 'Chưa có mô tả.'}</Text>

            <TouchableOpacity
              className="mt-5 bg-[#2C6BED] rounded-full py-3 items-center"
              onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
            >
              <Text className="text-white font-semibold">Xem hồ sơ chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfileScreen;
