import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ChatMessageModel } from '@/types';
import { getMessages, sendMessage } from '@/services/chatService';
import { getPetByOwnerId } from '@/services/petService';
import ChatBubble from '@/components/ChatBubble';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type DeliveryStatus = 'sending' | 'sent';

const formatTime = (ts: number) => {
  const date = new Date(ts);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const ChatScreen = ({ route }: Props) => {
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [myPetId, setMyPetId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, DeliveryStatus>>({});
  const listRef = useRef<FlatList<ChatMessageModel> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const pet = await getPetByOwnerId();
        if (pet) setMyPetId(pet.id);

        const incoming = await getMessages(route.params.matchId);
        setMessages(incoming);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [route.params.matchId]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages]);

  const onSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    const optimistic: ChatMessageModel = {
      id: `local-${Date.now()}`,
      senderPetId: myPetId || 'me',
      text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setStatusMap((prev) => ({ ...prev, [optimistic.id]: 'sending' }));
    setDraft('');

    try {
      setSending(true);
      const serverMessage = await sendMessage(route.params.matchId, text, optimistic.senderPetId);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? serverMessage : m)));
      setStatusMap((prev) => {
        const next = { ...prev };
        delete next[optimistic.id];
        next[serverMessage.id] = 'sent';
        return next;
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setStatusMap((prev) => {
        const next = { ...prev };
        delete next[optimistic.id];
        return next;
      });
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 w-full max-w-[420px] self-center px-4">
          <View className="py-3 border-b border-rose-200">
            <Text className="text-[26px] font-semibold text-figmaTextBlue" numberOfLines={1}>
              {route.params.otherPetName}
            </Text>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FF476A" />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={sortedMessages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 12, paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isMine = item.senderPetId === myPetId || item.senderPetId === 'me';
                const status = statusMap[item.id] ?? (isMine ? 'sent' : undefined);
                const statusLabel = status === 'sending' ? 'Đang gửi...' : status === 'sent' ? 'Đã gửi' : undefined;

                return (
                  <ChatBubble
                    text={item.text}
                    isMine={isMine}
                    timeLabel={formatTime(item.createdAt)}
                    statusLabel={statusLabel}
                  />
                );
              }}
              ListEmptyComponent={
                <Text className="text-center text-figmaTextRed mt-10">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.</Text>
              }
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          <View className="flex-row items-center mb-3 mt-1">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-rose-300 rounded-full px-4 py-3 text-base bg-white"
              placeholderTextColor="#9A9AA4"
            />
            <TouchableOpacity
              onPress={onSend}
              disabled={sending || !draft.trim()}
              className={`ml-2 w-11 h-11 rounded-full items-center justify-center ${sending || !draft.trim() ? 'bg-rose-200' : 'bg-figmaTextRed'}`}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
