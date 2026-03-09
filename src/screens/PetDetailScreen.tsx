import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PetModel } from '@/types';
import { getPetById } from '@/services/petService';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;

const PetDetailScreen = ({ route }: Props) => {
  const [pet, setPet] = useState<PetModel | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const item = await getPetById(route.params.petId);
        setPet(item);
      } catch {
        setPet(null);
      }
    };
    load();
  }, [route.params.petId]);

  if (!pet) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading pet details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <Image source={{ uri: pet.image }} className="w-full h-96" />
      <View className="p-5">
        <Text className="text-3xl font-bold text-ink">{pet.name}</Text>
        <Text className="text-gray-500 mt-2">{pet.breed} • {pet.age} years • {pet.gender}</Text>
        <Text className="text-gray-600 mt-2">📍 {pet.location}</Text>
        <Text className="text-gray-700 mt-4">{pet.bio}</Text>
        <Text className="text-rose mt-4">Owner contact: {pet.ownerContact}</Text>
      </View>
    </ScrollView>
  );
};

export default PetDetailScreen;
