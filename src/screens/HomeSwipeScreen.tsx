import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { addLocalMatch, getExplorePets, getPetByOwnerId, likePet } from '@/services/petService';
import { PetModel } from '@/types';
import SwipeDeck from '@/components/SwipeDeck';

const MOCK_MY_PET: PetModel = {
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

const MOCK_EXPLORE_PETS: PetModel[] = [
  {
    id: 'mock-pet-1',
    ownerId: 'owner-1',
    name: 'Milo',
    age: '1 tuổi',
    breed: 'Corgi',
    gender: 'Male',
    location: 'Quận 1, TP.HCM',
    bio: 'Rất mê bóng và thích chạy bộ.',
    image: 'https://images.unsplash.com/photo-1611003229186-80e40cd54966?w=900',
    ownerContact: '0909000002',
  },
  {
    id: 'mock-pet-2',
    ownerId: 'owner-2',
    name: 'Bơ',
    age: '3 tuổi',
    breed: 'Golden Retriever',
    gender: 'Female',
    location: 'Thủ Đức, TP.HCM',
    bio: 'Hiền, thích được vuốt ve.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=900',
    ownerContact: '0909000003',
  },
];

const HomeSwipeScreen = () => {
  const [pets, setPets] = useState<PetModel[]>([]);
  const [myPet, setMyPet] = useState<PetModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getPetByOwnerId();
        setMyPet(me ?? MOCK_MY_PET);

        if (me) {
          const nearby = await getExplorePets();
          setPets(nearby.length ? nearby : MOCK_EXPLORE_PETS);
        } else {
          setPets(MOCK_EXPLORE_PETS);
        }
      } catch {
        setMyPet(MOCK_MY_PET);
        setPets(MOCK_EXPLORE_PETS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onSwipeRight = async (pet: PetModel) => {
    if (!myPet) return;

    try {
      const result = await likePet(pet.id);
      await addLocalMatch(myPet.id, pet);

      if (result.matched) {
        Alert.alert("It's a match!", `${myPet.name} và ${pet.name} đã thích nhau.`);
      }
    } catch {
      await addLocalMatch(myPet.id, pet);
      Alert.alert('Đã thích', `${myPet.name} đã thích ${pet.name}. Mở tab Matches để nhắn tin.`);
    }
  };

  const onSwipeLeft = () => {};

  return (
    <View className="flex-1 bg-[#EA81AF] px-4 pt-6">
      <Text className="text-center text-[42px] font-extrabold text-[#F2F3E5] tracking-wide mb-4">BOSSITIVE</Text>

      {loading ? (
        <View className="flex-1 items-center justify-center pb-20">
          <ActivityIndicator size="large" color="#F2F3E5" />
        </View>
      ) : (
        <View className="flex-1 max-w-[420px] w-full self-center">
          <SwipeDeck pets={pets} onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />
        </View>
      )}
    </View>
  );
};

export default HomeSwipeScreen;
