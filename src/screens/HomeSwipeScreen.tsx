import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addLocalMatch, getExplorePets, getPetByOwnerId, likePet } from '@/services/petService';
import { PetModel, RootStackParamList } from '@/types';
import SwipeDeck from '@/components/SwipeDeck';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getRandomImage } from '@/constants/images';

const MOCK_MY_PET: PetModel = {
  id: 'mock-my-pet',
  ownerId: 'mock-owner',
  name: 'Coco',
  age: '2 tuổi',
  breed: 'Pug',
  gender: 'Female',
  location: 'Quận 7, TP.HCM',
  bio: 'Mình thân thiện, thích đi dạo buổi tối.',
  image: getRandomImage('Dog', 'my-pet-coco'),
  ownerContact: '0909000001',
  weight: '5kg',
  tags: ['Friendly', 'Vaccinated'],
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
    image: '',
    ownerContact: '0909000002',
    weight: '10kg',
    tags: ['Active', 'Quiet Neighborhood', 'Vaccinated'],
    type: 'Dog',
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
    image: '',
    ownerContact: '0909000003',
    weight: '25kg',
    tags: ['Good with Kids', 'Friendly', 'Vaccinated'],
    type: 'Dog',
  },
  {
    id: 'mock-pet-3',
    ownerId: 'owner-3',
    name: 'Luna',
    age: '2 tuổi',
    breed: 'Mèo Mướp',
    gender: 'Female',
    location: 'Bình Thạnh, TP.HCM',
    bio: 'Thích ngủ và ăn pate.',
    image: '',
    ownerContact: '0909000004',
    weight: '4kg',
    tags: ['Quiet', 'Indoor'],
    type: 'Cat',
  },
  {
    id: 'mock-pet-4',
    ownerId: 'owner-4',
    name: 'Max',
    age: '2 tuổi',
    breed: 'Husky',
    gender: 'Male',
    location: 'Quận 2, TP.HCM',
    bio: 'Ham chơi và thích nói chuyện.',
    image: '',
    ownerContact: '0909000005',
    type: 'Dog',
  },
  {
    id: 'mock-pet-5',
    ownerId: 'owner-5',
    name: 'Simba',
    age: '1 tuổi',
    breed: 'Mèo Ba Tư',
    gender: 'Male',
    location: 'Quận 7, TP.HCM',
    bio: 'Rất chảnh nhưng đáng yêu.',
    image: '',
    ownerContact: '0909000006',
    type: 'Cat',
  }
];

const HomeSwipeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pets, setPets] = useState<PetModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Tất cả');

  useEffect(() => {
    const load = async () => {
      try {
        const nearby = await getExplorePets();
        let exploreList = nearby.length ? nearby : MOCK_EXPLORE_PETS;

        // Use consistent but diverse images
        exploreList = exploreList.map((p) => ({
            ...p,
            image: getRandomImage(p.type, p.id)
        }));

        setPets(exploreList);
      } catch {
        setPets(MOCK_EXPLORE_PETS.map((p) => ({
            ...p,
            image: getRandomImage(p.type, p.id)
        })));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onSwipeRight = async (pet: PetModel) => {
    try {
      const me = await getPetByOwnerId();
      const myPetId = me?.id || MOCK_MY_PET.id;
      const result = await likePet(pet.id);
      await addLocalMatch(myPetId, pet);

      if (result.matched) {
        Alert.alert("It's a match!", `${me?.name || 'Thú cưng'} và ${pet.name} đã thích nhau.`);
      }
    } catch {
       const me = await getPetByOwnerId();
       await addLocalMatch(me?.id || MOCK_MY_PET.id, pet);
       Alert.alert('Đã thích', `Bạn đã thích ${pet.name}. Mở tab Matches để nhắn tin.`);
    }
  };

  const onSwipeLeft = () => {};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#E0EAFC', '#FFFFFF']}
        className="absolute left-0 right-0 top-0 bottom-0"
      />

      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.navigate('Filter')}>
          <Ionicons name="options-outline" size={28} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-[28px] font-bold text-primary italic">bossitive</Text>

        <TouchableOpacity>
          <View className="relative">
            <Ionicons name="notifications-outline" size={28} color="#1E293B" />
            <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose rounded-full border-2 border-white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Category Filter - Only Dog and Cat as requested */}
      <View className="px-4 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {['Tất cả', 'Chó', 'Mèo'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    className={`mr-2 px-8 py-3 rounded-full ${category === item ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-white/80 border border-gray-100'}`}
                  >
                      <Text className={`font-bold ${category === item ? 'text-white' : 'text-textSub'}`}>{item}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00B4DB" />
        </View>
      ) : (
        <View className="flex-1 px-4 mt-2">
          <SwipeDeck
            pets={pets.filter(p => {
                if (category === 'Tất cả') return true;
                if (category === 'Chó') return p.type === 'Dog';
                if (category === 'Mèo') return p.type === 'Cat';
                return true;
            })}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeSwipeScreen;
