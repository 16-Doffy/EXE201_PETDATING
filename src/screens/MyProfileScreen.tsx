import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PetModel, RootStackParamList } from '@/types';
import { getPetByOwnerId } from '@/services/petService';
import { getRandomImage } from '@/constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

const MyProfileScreen = ({ navigation }: Props) => {
  const [pet, setPet] = useState<PetModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPetByOwnerId();
        setPet(result);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
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
            {loading ? (
              <View className="h-[340px] items-center justify-center">
                <ActivityIndicator size="large" color="#2C6BED" />
                <Text className="mt-3 text-slate-500">Đang tải hồ sơ thú cưng...</Text>
              </View>
            ) : pet ? (
              <>
                <Image
                  source={{ uri: pet.image || getRandomImage(pet.type || 'Dog', pet.id) }}
                  className="w-full h-[280px] rounded-2xl"
                  resizeMode="cover"
                />
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
              </>
            ) : (
              <View className="h-[340px] items-center justify-center px-6">
                <Ionicons name="paw-outline" size={52} color="#94A3B8" />
                <Text className="mt-4 text-center text-xl font-bold text-slate-800">
                  Chưa có hồ sơ thú cưng
                </Text>
                <Text className="mt-2 text-center text-slate-500 leading-6">
                  Hãy tạo hồ sơ thú cưng để bắt đầu ghép đôi và trò chuyện.
                </Text>
                <TouchableOpacity
                  className="mt-6 bg-[#2C6BED] rounded-full py-3 px-6 items-center"
                  onPress={() => navigation.navigate('CreatePetProfile')}
                >
                  <Text className="text-white font-semibold">Tạo hồ sơ ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfileScreen;
