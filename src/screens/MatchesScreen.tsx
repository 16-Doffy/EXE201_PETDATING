import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList, MatchModel, PetModel, RootStackParamList } from '@/types';
import { getLocalMatches, getMatches, getPetById, getPetByOwnerId, subscribeMatchUpdate } from '@/services/petService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessages } from '@/services/chatService';
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

const asId = (value: unknown) => String(value ?? '');
const getOtherPetId = (match: MatchModel, myPetId?: string) => {
  if (!myPetId) return asId(match.pet1 || match.pet2);
  return asId(match.pet1) === myPetId ? asId(match.pet2) : asId(match.pet1);
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatTime = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Bây giờ';
  if (diffMins < 60) return `${diffMins}p`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}ngày`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ─── Story Avatar ───────────────────────────────────────────────────────────

const StoryAvatar = ({
  item,
  onPress,
  isOnline = true,
}: {
  item: ChatPreview;
  onPress: () => void;
  isOnline?: boolean;
}) => (
  <TouchableOpacity onPress={onPress} className="items-center mr-4">
    <View className="w-16 h-16 rounded-full p-0.5" style={{ backgroundColor: '#ff5a99' }}>
      <Image
        source={{ uri: item.otherPet.image || getRandomImage(item.otherPet.type || 'Dog', item.otherPet.id) }}
        className="w-full h-full rounded-full"
      />
      {isOnline && (
        <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#ff5a99]" />
      )}
    </View>
    <Text className="text-[11px] mt-1 text-slate-500 text-center w-16" numberOfLines={1}>
      {item.otherPet.name}
    </Text>
  </TouchableOpacity>
);

// ─── Chat List Item ────────────────────────────────────────────────────────

const ChatListItem = ({
  item,
  onPress,
}: {
  item: ChatPreview;
  onPress: () => void;
}) => {
  const hasUnread = item.unreadCount > 0;

  return (
    <TouchableOpacity
      className="mx-4 mb-3 flex-row items-center rounded-[24px] bg-white px-4 py-4"
      onPress={onPress}
      style={{
        shadowColor: '#f472b6',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      }}
    >
      {/* Avatar */}
      <View className="relative">
        <View className="w-14 h-14 rounded-full overflow-hidden bg-rose-50 items-center justify-center">
          <Image
            source={{ uri: item.otherPet.image || getRandomImage(item.otherPet.type || 'Dog', item.otherPet.id) }}
            className="w-full h-full"
          />
        </View>
        <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text
            className={`text-[15px] font-semibold flex-1 mr-2 ${hasUnread ? 'text-slate-900' : 'text-slate-700'}`}
            numberOfLines={1}
          >
            {item.otherPet.name}
          </Text>
          <Text className="text-[12px] text-slate-400">{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View className="flex-row justify-between items-center mt-0.5">
          <Text
            className={`text-[13px] flex-1 mr-2 ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {hasUnread && (
            <View className="bg-[#ff5a99] rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-[11px] font-bold">
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── MatchesScreen ─────────────────────────────────────────────────────────

const MatchesScreen = ({ navigation }: Props) => {
  const [myPet, setMyPet] = useState<PetModel | null>(null);
  const [matches, setMatches] = useState<ChatPreview[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<ScrollView>(null);

  const loadMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Lấy pet của mình TRƯỚC
      const pet = await getPetByOwnerId();
      setMyPet(pet);

      // Gọi server + local song song
      const [serverMatchesRaw, localMatches] = await Promise.all([
        getMatches().catch(() => [] as MatchModel[]),
        getLocalMatches(),
      ]);

      const serverMatchList = serverMatchesRaw as MatchModel[];
      const localList = localMatches.map((item: { match: MatchModel; pet: PetModel }) => item);
      const merged = new Map<string, ChatPreview>();

      // Xử lý server matches (ưu tiên cao hơn local)
      await Promise.allSettled(
        serverMatchList.map(async (match) => {
          const otherId = getOtherPetId(match, pet?.id);
          if (!otherId || otherId === pet?.id) return;
          const otherPet = await getPetById(otherId);
          if (!otherPet) return;

          let lastMsg = 'Bắt đầu cuộc trò chuyện';
          let lastTime = match.createdAt || Date.now();
          let unread = 0;

          try {
            const msgs = await getMessages(match.id);
            if (msgs.length > 0) {
              const last = msgs[msgs.length - 1];
              lastMsg = last.text;
              lastTime = last.createdAt || Date.now();
              unread = msgs.filter(
                (m) => m.senderPetId !== pet?.id && (m.createdAt || 0) > Date.now() - 86400000
              ).length;
            }
          } catch {}

          merged.set(otherPet.id, {
            match,
            otherPet,
            lastMessage: lastMsg,
            lastMessageTime: lastTime,
            unreadCount: unread,
          });
        })
      );

      // Xử lý local matches (chỉ khi server chưa có)
      for (const item of localList) {
        if (!item.pet?.id || item.pet.id === pet?.id || merged.has(item.pet.id)) continue;
        merged.set(item.pet.id, {
          match: item.match,
          otherPet: item.pet,
          lastMessage: `Bắt đầu cuộc trò chuyện với ${item.pet.name}`,
          lastMessageTime: item.match.createdAt || Date.now(),
          unreadCount: 0,
        });
      }

      // Xử lý pending match (tạo từ HomeSwipeScreen khi vừa match xong)
      try {
        const pendingRaw = await AsyncStorage.getItem('bossitive_pending_match');
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          await AsyncStorage.removeItem('bossitive_pending_match');
          if (pending.pet && !merged.has(pending.pet.id)) {
            const pendingMatch: MatchModel = normalizeMatch({
              id: pending.matchId || `pending-${Date.now()}`,
              pet1: pet?.id,
              pet2: pending.pet.id,
              createdAt: pending.timestamp || Date.now(),
            });
            merged.set(pending.pet.id, {
              match: pendingMatch,
              otherPet: normalizePet(pending.pet),
              lastMessage: '🎉 Match mới! Bắt đầu cuộc trò chuyện',
              lastMessageTime: pending.timestamp || Date.now(),
              unreadCount: 0,
            });
          }
        }
      } catch {}

      const all = Array.from(merged.values()).sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );

      setMatches(all);
    } catch (err) {
      console.error('[Matches] Lỗi loadMatches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload khi tab Matches được focus
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  // Subscribe match update để load lại khi có match mới từ HomeSwipeScreen
  useEffect(() => {
    const unsubscribe = subscribeMatchUpdate(() => {
      loadMatches();
    });
    return unsubscribe;
  }, [loadMatches]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới!');
    }
  };

  const filtered = useMemo(() => {
    if (!keyword.trim()) return matches;
    const q = keyword.toLowerCase().trim();
    return matches.filter((item) =>
      item.otherPet.name.toLowerCase().includes(q)
    );
  }, [keyword, matches]);

  return (
    <SafeAreaView className="flex-1 bg-[#fff7fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#fff7fb" />

      {/* ── Header ── */}
      <View className="px-4 pt-2 pb-3 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={pickImage}>
            <View className="relative">
              <View className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm">
                <Text className="text-slate-700 font-bold text-sm">
                  {myPet ? getInitials(myPet.name) : '🐾'}
                </Text>
              </View>
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            </View>
          </TouchableOpacity>
          <Text className="ml-3 text-xl font-black text-slate-800">Đoạn chat</Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center bg-white mr-2"
            onPress={() => loadMatches(true)}
          >
            <Ionicons name="reload" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-white">
            <Ionicons name="chatbubble-ellipses" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View className="px-4 pb-3">
        <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center shadow-sm">
          <Ionicons name="search" size={16} color="#94a3b8" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiếm"
            placeholderTextColor="#94a3b8"
            className="ml-2 flex-1 text-[15px] text-slate-700"
            style={{ color: '#334155' }}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff5a99" />
          <Text className="text-slate-500 mt-3 text-sm">Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <>
          {/* ── Stories ── */}
          {matches.length > 0 && (
            <View className="pb-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {/* Your Story */}
                <TouchableOpacity onPress={pickImage} className="items-center mr-5">
                  <View className="w-16 h-16 rounded-full bg-white items-center justify-center border-2 border-dashed border-rose-200">
                    <Ionicons name="add" size={28} color="#ff5a99" />
                  </View>
                  <Text className="text-[11px] mt-1 text-slate-500">Tin của bạn</Text>
                </TouchableOpacity>

                {matches.map((item) => (
                  <StoryAvatar
                    key={`story-${item.match.id}`}
                    item={item}
                    onPress={() =>
                      navigation.navigate('Chat', {
                        matchId: item.match.id,
                        otherPetName: item.otherPet.name,
                        otherPetId: item.otherPet.id,
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Chat List ── */}
          <ScrollView
            ref={listRef as any}
            style={{ flex: 1 }}
            contentContainerStyle={
              filtered.length === 0 ? { flex: 1 } : undefined
            }
            onContentSizeChange={() => listRef.current?.scrollTo({ y: 0, animated: false })}
          >
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <ChatListItem
                  key={item.match.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      matchId: item.match.id,
                      otherPetName: item.otherPet.name,
                      otherPetId: item.otherPet.id,
                    })
                  }
                />
              ))
            ) : (
              <View className="flex-1 items-center justify-center px-8 py-20">
                <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-6 shadow-sm">
                  <Ionicons name="chatbubbles-outline" size={44} color="#ff5a99" />
                </View>
                <Text className="text-xl font-semibold text-slate-700 text-center">
                  Chưa có cuộc trò chuyện nào.
                </Text>
                <Text className="text-sm text-slate-500 mt-2 text-center">
                  Hãy thích một thú cưng để bắt đầu trò chuyện
                </Text>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('Home')}
                  className="mt-8 bg-[#ff5a99] px-8 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">Tìm thú cưng</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default MatchesScreen;
