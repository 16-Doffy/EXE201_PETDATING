import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, MatchModel, PetModel, RootStackParamList } from '@/types';
import { getLocalMatches, getMatches, getPetById, getPetByOwnerId } from '@/services/petService';

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
  image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900',
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

      setPetMap({ ...localPetMap, ...remoteMap });
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMatches();
  }, [loadMatches]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return matches;
    const q = keyword.toLowerCase().trim();

    return matches.filter((item) => {
      const otherPetId = item.pet1 === myPet?.id ? item.pet2 : item.pet1;
      const otherPet = petMap[otherPetId];
      return otherPet?.name?.toLowerCase().includes(q);
    });
  }, [keyword, matches, myPet?.id, petMap]);

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <View className="flex-1 w-full max-w-[420px] self-center px-4 pt-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[40px] font-semibold text-figmaTextRed">Bạn bè</Text>
          <TouchableOpacity onPress={() => Alert.alert('Report', 'Tính năng report sẽ cập nhật sớm.')}>
            <Text className="text-[36px] text-figmaTextRed">⋯</Text>
          </TouchableOpacity>
        </View>

        <View className="border border-figmaTextRed rounded-xl px-4 py-3 mb-4 flex-row items-center">
          <Ionicons name="search" size={20} color="#FF476A" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiếm"
            placeholderTextColor="#FF476A"
            className="text-figmaTextRed text-[20px] ml-2 flex-1"
          />
        </View>

        <Text className="text-[32px] font-semibold text-figmaTextBlue mb-3">Danh sách chat</Text>

        {initialLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF476A" />
            <Text className="mt-3 text-figmaTextRed">Đang tải danh sách chat...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            onRefresh={onRefresh}
            refreshing={refreshing}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => {
              const otherPetId = item.pet1 === myPet?.id ? item.pet2 : item.pet1;
              const otherPet = petMap[otherPetId] ?? null;

              return (
                <View className="mb-3 flex-row items-center">
                  <View className="w-11 h-11 rounded-full bg-figmaYellow mr-3" />
                  <Text className="flex-1 text-figmaTextBlue text-[18px]" numberOfLines={1}>
                    {otherPet?.name ?? 'Đang cập nhật...'}
                  </Text>
                  <TouchableOpacity
                    className="bg-[#F28BA9] border border-figmaTextRed rounded-full px-4 py-2"
                    onPress={() =>
                      navigation.navigate('Chat', {
                        matchId: item.id,
                        otherPetName: otherPet?.name ?? 'Matched pet',
                        otherPetId,
                      })
                    }
                  >
                    <Text className="text-[#FFE8F2] font-semibold">Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={<Text className="text-center text-figmaTextRed mt-12">Chưa có match nào. Hãy tim ở Home trước.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MatchesScreen;
