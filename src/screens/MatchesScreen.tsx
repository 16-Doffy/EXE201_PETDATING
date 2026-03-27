import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View, ScrollView,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList, MatchModel, PetModel, RootStackParamList } from '@/types';
import { getLocalMatches, getMatches, getPetById, getPetByOwnerId } from '@/services/petService';
import { getMessages } from '@/services/chatService';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImage } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Matches'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ChatPreview = {
  match: MatchModel;
  otherPet: PetModel;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
};

const MatchesScreen = ({ navigation }: Props) => {
  const [myPet, setMyPet] = useState<PetModel | null>(null);
  const [matches, setMatches] = useState<ChatPreview[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const pet = await getPetByOwnerId();
      setMyPet(pet);

      const [serverMatches, localMatches] = await Promise.all([
        getMatches().catch(() => []),
        getLocalMatches(),
      ]);

      const serverMatchList = serverMatches as MatchModel[];
      const localMatchList = localMatches.map((item: { match: MatchModel; pet: PetModel }) => item);

      const mergedMap = new Map<string, ChatPreview>();

      // Process local matches first
      for (const item of localMatchList) {
        const otherId = item.match.pet1 === myPet?.id ? item.match.pet2 : item.match.pet1;
        const lastMsg = `Da bat dau cuoc tro chuyen voi ${item.pet.name}`;
        mergedMap.set(item.match.id, {
          match: item.match,
          otherPet: item.pet,
          lastMessage: lastMsg,
          lastMessageTime: item.match.createdAt,
          unreadCount: 0,
        });
      }

      // Override/append server matches
      for (const match of serverMatchList) {
        const otherId = match.pet1 === myPet?.id ? match.pet2 : match.pet1;
        try {
          const otherPet = await getPetById(otherId);
          if (!otherPet) continue;

          let lastMsg = 'Bat dau cuoc tro chuyen';
          let lastTime = match.createdAt;
          let unread = 0;

          try {
            const msgs = await getMessages(match.id);
            if (msgs.length > 0) {
              lastMsg = msgs[msgs.length - 1].text;
              lastTime = msgs[msgs.length - 1].createdAt;
              unread = msgs.filter(m => m.senderPetId !== myPet?.id && m.createdAt > Date.now() - 86400000).length;
            }
          } catch {}

          mergedMap.set(match.id, {
            match,
            otherPet,
            lastMessage: lastMsg,
            lastMessageTime: lastTime,
            unreadCount: unread,
          });
        } catch {}
      }

      const all = Array.from(mergedMap.values());
      all.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      setMatches(all);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadMatches);
    return unsubscribe;
  }, [navigation, loadMatches]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      Alert.alert('Thanh cong', 'Da cap nhat anh dai dien moi!');
    }
  };

  const filtered = useMemo(() => {
    if (!keyword.trim()) return matches;
    const q = keyword.toLowerCase().trim();
    return matches.filter(item => item.otherPet.name.toLowerCase().includes(q));
  }, [keyword, matches]);

  const formatTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return 'Vua xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}p`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50"
      onPress={() => navigation.navigate('Chat', {
        matchId: item.match.id,
        otherPetName: item.otherPet.name,
        otherPetId: item.otherPet.id,
      })}
    >
      {/* Avatar */}
      <View className="relative">
        <Image
          source={{ uri: item.otherPet.image || getRandomImage(item.otherPet.type || 'Dog', item.otherPet.id) }}
          className="w-16 h-16 rounded-full bg-gray-100"
        />
        <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        {item.unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className={`text-base font-bold ${item.unreadCount > 0 ? 'text-textMain' : 'text-gray-600'}`}>
            {item.otherPet.name}
          </Text>
          <Text className="text-xs text-gray-400">{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View className="flex-row justify-between items-center mt-0.5">
          <Text
            className={`text-sm flex-1 ${item.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View className="ml-2 bg-[#00B4DB] rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
            </View>
          )}
        </View>
        {/* Pet info subtitle */}
        <Text className="text-xs text-gray-300 mt-0.5">{item.otherPet.breed} - {item.otherPet.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#E0EAFC', '#FFFFFF']} className="absolute inset-0" />

      {/* Header - Messenger style */}
      <View className="px-4 py-3 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={pickImage} className="relative">
            <Image
              source={{ uri: myPet?.image || getRandomImage('Dog', 'me') }}
              className="w-10 h-10 rounded-full border-2 border-[#00B4DB] bg-gray-100"
            />
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
          <Text className="ml-3 text-2xl font-bold text-textMain">Doan chat</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-2">
            <Ionicons name="camera" size={20} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-2">
            <Feather name="edit" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-3">
        <View className="bg-gray-100 rounded-2xl px-4 py-2.5 flex-row items-center">
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiem"
            placeholderTextColor="#94A3B8"
            className="ml-2 flex-1 text-[15px] text-textMain"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00B4DB" className="mt-10" />
      ) : (
        <>
          {/* Stories Row */}
          {matches.length > 0 && (
            <View className="px-4 pb-3 border-b border-gray-100">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {/* Your Story */}
                <TouchableOpacity onPress={pickImage} className="items-center mr-4">
                  <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                    <Ionicons name="add" size={28} color="#94A3B8" />
                  </View>
                  <Text className="text-[11px] mt-1 text-textSub">Tin cua ban</Text>
                </TouchableOpacity>

                {/* Match Stories */}
                {matches.map(item => (
                  <TouchableOpacity
                    key={`story-${item.match.id}`}
                    className="items-center mr-4"
                    onPress={() => navigation.navigate('Chat', {
                      matchId: item.match.id,
                      otherPetName: item.otherPet.name,
                      otherPetId: item.otherPet.id,
                    })}
                  >
                    <View className="relative">
                      <Image
                        source={{ uri: item.otherPet.image || getRandomImage(item.otherPet.type || 'Dog', item.otherPet.id) }}
                        className="w-16 h-16 rounded-full border-2 border-[#00B4DB] p-0.5 bg-white"
                      />
                      <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    </View>
                    <Text className="text-[11px] mt-1 text-textMain font-medium" numberOfLines={1}>{item.otherPet.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chat List */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.match.id}
            renderItem={renderItem}
            contentContainerStyle={filtered.length === 0 ? { flex: 1 } : undefined}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-8">
                <MaterialCommunityIcons name="facebook-messenger" size={80} color="#CBD5E1" />
                <Text className="text-xl font-bold text-gray-400 mt-4 text-center">
                  Chua co cuoc tro chuyen nao.
                </Text>
                <Text className="text-sm text-gray-300 mt-2 text-center">
                  Hãy thich một thú cưng để bắt đầu trò chuyện
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Home' as any)}
                  className="mt-6 bg-[#00B4DB] px-8 py-3 rounded-full shadow-lg shadow-[#00B4DB]/30"
                >
                  <Text className="text-white font-bold">Tim thú cưng</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default MatchesScreen;
