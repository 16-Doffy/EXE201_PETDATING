import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ChatMessageModel, PetModel } from '@/types';
import { getMessages, sendMessage } from '@/services/chatService';
import { getPetByOwnerId, getPetById } from '@/services/petService';
import { getRandomImage } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const MAX_TEXT_LENGTH = 1000;

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

// ─── Date Separator ───────────────────────────────────────────────────────

const DateSeparator = ({ ts }: { ts: number }) => (
  <View className="flex-row items-center py-2 px-4">
    <View className="flex-1 h-px bg-white/10" />
    <Text className="text-xs text-gray-500 mx-3">{formatDate(ts)}</Text>
    <View className="flex-1 h-px bg-white/10" />
  </View>
);

// ─── Chat Bubble ─────────────────────────────────────────────────────────

const ChatBubble = ({
  text,
  isMine,
  time,
  isFirst = false,
}: {
  text: string;
  isMine: boolean;
  time: number;
  isFirst?: boolean;
}) => {
  if (isMine) {
    return (
      <View className="flex-row justify-end px-3 py-0.5">
        <View className="max-w-[75%]">
          <View className="bg-[#0084FF] rounded-2xl rounded-tr-md px-4 py-2.5">
            <Text className="text-white text-[15px] leading-5">{text}</Text>
          </View>
          <Text className="text-[11px] text-gray-500 mt-0.5 text-right">
            {formatTime(time)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row justify-start px-3 py-0.5">
      <View className="max-w-[75%]">
        <View className="bg-[#2c2c2e] rounded-2xl rounded-tl-md px-4 py-2.5">
          <Text className="text-white text-[15px] leading-5">{text}</Text>
        </View>
        <Text className="text-[11px] text-gray-500 mt-0.5">{formatTime(time)}</Text>
      </View>
    </View>
  );
};

// ─── ChatScreen ───────────────────────────────────────────────────────────

const ChatScreen = ({ route, navigation }: Props) => {
  const { matchId, otherPetName, otherPetId } = route.params;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [myPetId, setMyPetId] = useState<string>('');
  const [otherPet, setOtherPet] = useState<PetModel | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // ── Load data ──────────────────────────────────────────────────────────

  const loadChat = useCallback(async () => {
    setLoading(true);
    try {
      const [me, other] = await Promise.all([
        getPetByOwnerId(),
        otherPetId ? getPetById(otherPetId) : Promise.resolve(null),
      ]);

      if (me) setMyPetId(me.id);
      if (other) setOtherPet(other);

      const msgs = await getMessages(matchId);
      setMessages(msgs);
    } catch (err) {
      console.error('[Chat] Lỗi loadChat:', err);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [matchId, otherPetId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  // ── Send message ───────────────────────────────────────────────────────

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setDraft('');
    setSending(true);

    // Hiển thị ngay (optimistic)
    const tempMsg: ChatMessageModel = {
      id: `temp-${Date.now()}`,
      senderPetId: myPetId || 'me',
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendMessage(matchId, text, myPetId || 'me');
    } catch (err) {
      console.error('[Chat] Gửi lỗi:', err);
    } finally {
      setSending(false);
    }
  };

  // ── Pick image ─────────────────────────────────────────────────────────

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const text = '[Hình ảnh]';
      setDraft('');
      const tempMsg: ChatMessageModel = {
        id: `temp-${Date.now()}`,
        senderPetId: myPetId || 'me',
        text,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, tempMsg]);
      try {
        await sendMessage(matchId, text, myPetId || 'me');
      } catch {}
    }
  };

  // ── Group messages by date ─────────────────────────────────────────────

  type MessageGroup = {
    type: 'date' | 'message';
    key: string;
    data: number | ChatMessageModel;
  };

  const groupedMessages: MessageGroup[] = [];
  let lastDate = '';

  for (const msg of messages) {
    const msgDate = formatDate(msg.createdAt || Date.now());
    if (msgDate !== lastDate) {
      lastDate = msgDate;
      groupedMessages.push({ type: 'date', key: `date-${msg.id}`, data: msg.createdAt || Date.now() });
    }
    groupedMessages.push({ type: 'message', key: msg.id, data: msg });
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: MessageGroup }) => {
    if (item.type === 'date') {
      return <DateSeparator ts={item.data as number} />;
    }
    const msg = item.data as ChatMessageModel;
    return (
      <ChatBubble
        text={msg.text}
        isMine={msg.senderPetId === myPetId || msg.senderPetId === 'me'}
        time={msg.createdAt || Date.now()}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#1a1a1a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* ── Header ── */}
      <View
        className="flex-row items-center px-3 py-3 border-b border-white/10"
        style={{ paddingBottom: 12 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#0084FF" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="w-10 h-10 rounded-full overflow-hidden bg-[#2c2c2e] items-center justify-center">
          {otherPet?.image ? (
            <Image source={{ uri: otherPet.image }} className="w-full h-full" />
          ) : (
            <Text className="text-white font-bold text-sm">
              {getInitials(otherPetName || '??')}
            </Text>
          )}
        </View>

        {/* Name + status */}
        <TouchableOpacity className="flex-1 ml-3">
          <Text className="text-white font-semibold text-[16px]" numberOfLines={1}>
            {otherPetName}
          </Text>
          <Text className="text-[12px] text-green-400">Đang hoạt động</Text>
        </TouchableOpacity>

        {/* Actions */}
        <TouchableOpacity className="p-2">
          <Ionicons name="call" size={22} color="#8e8e93" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Ionicons name="videocam" size={24} color="#8e8e93" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={20} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0084FF" />
          <Text className="text-gray-500 mt-3 text-sm">Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={groupedMessages}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingVertical: 12,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? 'center' : 'flex-end',
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="items-center px-8">
              {/* Avatar lớn */}
              <View className="w-20 h-20 rounded-full overflow-hidden bg-[#2c2c2e] items-center justify-center mb-4 border-2 border-[#0084FF]">
                {otherPet?.image ? (
                  <Image source={{ uri: otherPet.image }} className="w-full h-full" />
                ) : (
                  <Text className="text-white font-bold text-2xl">
                    {getInitials(otherPetName || '??')}
                  </Text>
                )}
              </View>
              <Text className="text-white font-semibold text-lg">{otherPetName}</Text>
              <Text className="text-gray-500 text-sm mt-1 text-center">
                Các bạn đã match! Hãy gửi lời chào ngay 👋
              </Text>
            </View>
          }
        />
      )}

      {/* ── Input ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          className="flex-row items-end px-3 py-3 border-t border-white/10"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          {/* Image button */}
          <TouchableOpacity onPress={pickImage} className="p-2">
            <Ionicons name="image" size={26} color="#8e8e93" />
          </TouchableOpacity>

          {/* Text input */}
          <View className="flex-1 bg-[#2c2c2e] rounded-full px-4 py-2 mx-2 flex-row items-center max-h-28">
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="Tin nhan"
              placeholderTextColor="#8e8e93"
              multiline
              maxLength={MAX_TEXT_LENGTH}
              className="flex-1 text-white text-[15px] max-h-20 py-0.5"
              style={{ textAlignVertical: 'center' }}
            />
            {draft.length > 50 && (
              <Text className="text-[11px] text-gray-500 mr-1">
                {draft.length}/{MAX_TEXT_LENGTH}
              </Text>
            )}
          </View>

          {/* Send button */}
          {draft.trim() ? (
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending}
              className="p-2"
            >
              <Ionicons
                name="send"
                size={24}
                color={sending ? '#555' : '#0084FF'}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={pickImage} className="p-2">
              <Ionicons name="heart" size={24} color="#8e8e93" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
