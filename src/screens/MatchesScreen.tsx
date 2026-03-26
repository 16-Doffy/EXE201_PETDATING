import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, Feather } from '@expo/vector-icons';
import { MainTabParamList, MatchModel, PetModel, RootStackParamList } from '@/types';
import { getLocalMatches, getMatches, getPetById, getPetByOwnerId } from '@/services/petService';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImage } from '@/constants/images';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Matches'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MOCK_MY_PET: PetModel = {
  id: 'mock-my-pet',
  ownerId: 'mock-owner',
  name: 'Coco',
  age: '2 tuổi',
  breed: 'Pug',
  gender: 'Female',
  location: 'Quận 7, TP.HCM',
  bio: 'Mình thân thiện, thích đi dạo buổi tối.',
  image: getRandomImage('Dog', 'mock-my-pet'),
  ownerContact: '0909000001',
};

const MatchesScreen = ({ navigation }: Props) => {
  const [myPet, setMyPet] = useState<PetModel | null>(null);
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [petMap, setPetMap] = useState<Record<string, PetModel>>({});
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    try {
      const pet = await getPetByOwnerId();
      const currentPet = pet ?? MOCK_MY_PET;

      // Ensure my pet has a valid image
      if (!currentPet.image || currentPet.image.includes('placeholder')) {
          currentPet.image = getRandomImage(currentPet.type || 'Dog', currentPet.id);
      }
      setMyPet(currentPet);

      const [serverMatches, localMatches] = await Promise.all([
        pet ? getMatches().catch(() => []) : Promise.resolve([]),
        getLocalMatches(),
      ]);

      const localMatchList = localMatches.map((item) => item.match);
      const mergedMatches = [...localMatchList, ...serverMatches].reduce<MatchModel[]>((acc, item) => {
        if (acc.some((x) => x.id === item.id)) return acc;
        acc.push(item);
        return acc;
      }, []);

      mergedMatches.sort((a, b) => b.createdAt - a.createdAt);
      setMatches(mergedMatches);

      const localPetMap = localMatches.reduce<Record<string, PetModel>>((acc, item) => {
        acc[item.pet.id] = item.pet;
        return acc;
      }, {});

      const ids = [...new Set(mergedMatches.map((match) => (match.pet1 === currentPet.id ? match.pet2 : match.pet1)))];
      const entries = await Promise.all(
        ids.map(async (id) => {
          if (localPetMap[id]) return [id, localPetMap[id]] as const;
          try {
            const other = await getPetById(id);
            return [id, other] as const;
          } catch {
            return null;
          }
        })
      );

      const remoteMap = entries.filter(Boolean).reduce<Record<string, PetModel>>((acc, cur) => {
        if (!cur) return acc;
        acc[cur[0]] = cur[1];
        return acc;
      }, {});

      const finalPetMap = { ...localPetMap, ...remoteMap };

      // Diversity: ensure every pet has a unique-ish random image if it doesn't have one
      Object.keys(finalPetMap).forEach((id) => {
          if (!finalPetMap[id].image || finalPetMap[id].image.includes('placeholder')) {
              finalPetMap[id].image = getRandomImage(finalPetMap[id].type, id);
          }
      });

      setPetMap(finalPetMap);
    } catch {
      setMyPet(MOCK_MY_PET);
      setMatches([]);
      setPetMap({});
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const filtered = useMemo(() => {
    const list = matches.map(m => {
        const otherId = m.pet1 === myPet?.id ? m.pet2 : m.pet1;
        return { match: m, otherPet: petMap[otherId] };
    }).filter(item => item.otherPet);

    if (!keyword.trim()) return list;
    const q = keyword.toLowerCase().trim();
    return list.filter((item) => item.otherPet.name.toLowerCase().includes(q));
  }, [keyword, matches, myPet?.id, petMap]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#E0EAFC', '#FFFFFF']}
        className="absolute left-0 right-0 top-0 bottom-0"
      />

      {/* Header Messenger style */}
      <View className="px-4 py-2 flex-row justify-between items-center">
        <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-gray-100">
                <Image
                    source={{ uri: myPet?.image }}
                    className="w-full h-full"
                />
            </View>
            <Text className="ml-3 text-2xl font-bold text-textMain">Đoạn chat</Text>
        </View>
        <View className="flex-row">
            <TouchableOpacity className="bg-white/80 p-2 rounded-full ml-2 shadow-sm">
                <Ionicons name="camera" size={20} color="#1E293B" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/80 p-2 rounded-full ml-2 shadow-sm">
                <Feather name="edit" size={20} color="#1E293B" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-2">
        <View className="bg-white/80 rounded-full px-4 py-2 flex-row items-center border border-gray-100 shadow-sm">
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiếm bạn bè..."
            placeholderTextColor="#94A3B8"
            className="ml-2 flex-1 text-base py-1 text-textMain"
          />
        </View>
      </View>

      {initialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00B4DB" />
        </View>
      ) : (
        <ScrollView className="flex-1">
            {/* Horizontal Stories */}
            <View className="py-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                    <View className="items-center mr-4">
                        <View className="w-16 h-16 rounded-full bg-white items-center justify-center border border-dashed border-primary">
                            <Ionicons name="add" size={30} color="#00B4DB" />
                        </View>
                        <Text className="text-xs mt-1 text-textSub">Tin của bạn</Text>
                    </View>
                    {filtered.slice(0, 8).map((item) => (
                        <TouchableOpacity
                            key={`story-${item.match.id}`}
                            className="items-center mr-4"
                            onPress={() => navigation.navigate('Chat', {
                                matchId: item.match.id,
                                otherPetName: item.otherPet.name,
                                otherPetId: item.otherPet.id
                            })}
                        >
                            <View className="relative">
                                <Image source={{ uri: item.otherPet.image }} className="w-16 h-16 rounded-full border-2 border-primary bg-gray-50" />
                                <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            </View>
                            <Text className="text-xs mt-1 text-textMain font-medium">{item.otherPet.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Chat List */}
            <View className="px-4 bg-white/50 rounded-t-3xl pt-4 flex-1">
                {filtered.map((item) => (
                    <TouchableOpacity
                        key={item.match.id}
                        className="flex-row items-center mb-6"
                        onPress={() =>
                            navigation.navigate('Chat', {
                                matchId: item.match.id,
                                otherPetName: item.otherPet.name,
                                otherPetId: item.otherPet.id,
                            })
                        }
                    >
                        <Image source={{ uri: item.otherPet.image }} className="w-16 h-16 rounded-full bg-gray-50" />
                        <View className="flex-1 ml-4 border-b border-gray-50 pb-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-[17px] font-bold text-textMain" numberOfLines={1}>
                                    {item.otherPet.name}
                                </Text>
                                <Text className="text-xs text-textSub">
                                    {new Date(item.match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center mt-1">
                                <Text className="text-[15px] text-textSub flex-1 mr-2" numberOfLines={1}>
                                    Bắt đầu trò chuyện với {item.otherPet.name} ngay!
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {filtered.length === 0 && (
                    <View className="items-center justify-center mt-20">
                        <Ionicons name="chatbubbles-outline" size={80} color="#CBD5E1" />
                        <Text className="text-textSub mt-4 text-center px-10">
                            Chưa có cuộc trò chuyện nào. Hãy đi tìm "bạn đời" cho thú cưng của bạn nhé!
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MatchesScreen;
