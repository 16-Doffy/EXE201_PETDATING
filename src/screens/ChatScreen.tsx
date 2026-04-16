import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatMessageModel, PetModel, RootStackParamList } from '@/types';
import { getMessages, sendMessage } from '@/services/chatService';
import { getPetById, getPetByOwnerId } from '@/services/petService';
import { getRandomImage } from '@/constants/images';
import * as ImagePicker from 'expo-image-picker';
import AppIcon from '@/components/ui/AppIcon';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const MAX_TEXT_LENGTH = 1000;

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
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const DateSeparator = ({ ts }: { ts: number }) => (
  <View className="flex-row items-center px-4 py-3">
    <View className="flex-1 h-px bg-rose-100" />
    <View className="mx-3 rounded-full bg-white px-3 py-1">
      <Text className="text-[11px] font-semibold text-slate-400">{formatDate(ts)}</Text>
    </View>
    <View className="flex-1 h-px bg-rose-100" />
  </View>
);

const ChatBubble = ({
  text,
  isMine,
  time,
}: {
  text: string;
  isMine: boolean;
  time: number;
}) => {
  if (isMine) {
    return (
      <View className="items-end px-4 py-1.5">
        <View className="max-w-[78%]">
          <LinearGradient
            colors={['#ff6ea8', '#ff4f96']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-[22px] rounded-br-md px-4 py-3"
          >
            <Text className="text-[15px] leading-5 text-white">{text}</Text>
          </LinearGradient>
          <Text className="mt-1 text-right text-[11px] text-slate-400">{formatTime(time)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="items-start px-4 py-1.5">
      <View className="max-w-[78%]">
        <View className="rounded-[22px] rounded-bl-md bg-white px-4 py-3">
          <Text className="text-[15px] leading-5 text-slate-700">{text}</Text>
        </View>
        <Text className="mt-1 text-[11px] text-slate-400">{formatTime(time)}</Text>
      </View>
    </View>
  );
};

const ChatScreen = ({ route, navigation }: Props) => {
  const { matchId, otherPetName, otherPetId } = route.params;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [myPetId, setMyPetId] = useState('');
  const [otherPet, setOtherPet] = useState<PetModel | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);

  const loadChat = useCallback(async () => {
    setLoading(true);
    try {
      const [me, other, msgs] = await Promise.all([
        getPetByOwnerId(),
        otherPetId ? getPetById(otherPetId) : Promise.resolve(null),
        getMessages(matchId),
      ]);

      if (me) setMyPetId(me.id);
      if (other) setOtherPet(other);
      setMessages(msgs);
    } catch (error) {
      console.error('[Chat] load error', error);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 120);
    }
  }, [matchId, otherPetId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadChat();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [loadChat]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setDraft('');
    setSending(true);

    const tempMsg: ChatMessageModel = {
      id: `temp-${Date.now()}`,
      senderPetId: myPetId || 'me',
      text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const saved = await sendMessage(matchId, text, myPetId || 'me');
      setMessages((prev) => prev.map((item) => (item.id === tempMsg.id ? saved : item)));
    } catch (error) {
      console.error('[Chat] send error', error);
      setMessages((prev) => prev.filter((item) => item.id !== tempMsg.id));
      Alert.alert('Không gửi được', 'Tin nhắn chưa được gửi lên máy chủ. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const text = '[Hình ảnh]';
      const tempMsg: ChatMessageModel = {
        id: `temp-${Date.now()}`,
        senderPetId: myPetId || 'me',
        text,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, tempMsg]);
      try {
        const saved = await sendMessage(matchId, text, myPetId || 'me');
        setMessages((prev) => prev.map((item) => (item.id === tempMsg.id ? saved : item)));
      } catch {
        setMessages((prev) => prev.filter((item) => item.id !== tempMsg.id));
        Alert.alert('Không gửi được', 'Ảnh chưa được gửi lên máy chủ.');
      }
    }
  };

  type MessageGroup = {
    type: 'date' | 'message';
    key: string;
    data: number | ChatMessageModel;
  };

  const groupedMessages: MessageGroup[] = [];
  let lastDate = '';

  for (const message of messages) {
    const currentDate = formatDate(message.createdAt || Date.now());
    if (currentDate !== lastDate) {
      lastDate = currentDate;
      groupedMessages.push({
        type: 'date',
        key: `date-${message.id}`,
        data: message.createdAt || Date.now(),
      });
    }

    groupedMessages.push({
      type: 'message',
      key: message.id,
      data: message,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fff7fb]">
      <StatusBar barStyle="dark-content" backgroundColor="#fff7fb" />
      <LinearGradient colors={['#fff9fc', '#fff4f8', '#ffffff']} className="absolute inset-0" />

      <View
        className="mx-3 mt-2 mb-2 rounded-[28px] bg-white px-3 py-3 flex-row items-center"
        style={{
          shadowColor: '#f472b6',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-11 h-11 rounded-full bg-rose-50 items-center justify-center">
          <AppIcon name="chevron-left" size={22} color="#ff4f96" />
        </TouchableOpacity>

        <View className="ml-3 w-12 h-12 rounded-full overflow-hidden bg-slate-200 items-center justify-center">
          {otherPet?.image ? (
            <Image source={{ uri: otherPet.image }} className="w-full h-full" />
          ) : (
            <Text className="text-sm font-bold text-slate-700">{getInitials(otherPetName || '??')}</Text>
          )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[18px] font-black text-slate-800" numberOfLines={1}>
            {otherPetName}
          </Text>
          <View className="mt-1 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-400" />
            <Text className="ml-1.5 text-[12px] font-semibold text-emerald-500">Đang hoạt động</Text>
          </View>
        </View>

        <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-2">
          <AppIcon name="call" size={20} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
          <AppIcon name="more" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff4f96" />
          <Text className="mt-3 text-sm font-medium text-slate-500">Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={groupedMessages}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return <DateSeparator ts={item.data as number} />;
            }

            const message = item.data as ChatMessageModel;
            return (
              <ChatBubble
                text={message.text}
                isMine={message.senderPetId === myPetId || message.senderPetId === 'me'}
                time={message.createdAt || Date.now()}
              />
            );
          }}
          contentContainerStyle={{
            paddingTop: 6,
            paddingBottom: 16,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? 'center' : 'flex-end',
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="items-center px-8">
              <View className="w-24 h-24 rounded-full overflow-hidden bg-white items-center justify-center shadow-sm border border-rose-100">
                {otherPet?.image ? (
                  <Image
                    source={{ uri: otherPet.image || getRandomImage(otherPet?.type || 'Dog', otherPet?.id) }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-2xl font-black text-slate-700">
                    {getInitials(otherPetName || '??')}
                  </Text>
                )}
              </View>
              <Text className="mt-5 text-lg font-black text-slate-800">{otherPetName}</Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Hai bé đã match với nhau rồi. Gửi lời chào đầu tiên để bắt đầu câu chuyện nhé.
              </Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View
          className="mx-3 mb-2 mt-2 rounded-[28px] bg-white px-3 py-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 10),
            shadowColor: '#f472b6',
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <View className="mb-3 flex-row items-center rounded-2xl bg-rose-50 px-3 py-2">
            <AppIcon name="sparkle" size={16} color="#ff4f96" />
            <Text className="ml-2 text-[12px] font-medium text-rose-600">
              Nhắn nhẹ nhàng để làm quen với bé và chủ nuôi nhé.
            </Text>
          </View>

          <View className="flex-row items-end">
            <TouchableOpacity
              onPress={pickImage}
              className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center"
            >
              <AppIcon name="image" size={22} color="#ff4f96" />
            </TouchableOpacity>

            <View className="flex-1 mx-3 rounded-[24px] bg-[#f8f4f7] px-4 py-2 min-h-[54px] flex-row items-center border border-rose-100">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={MAX_TEXT_LENGTH}
                className="flex-1 text-[15px] text-slate-700 py-1"
                style={{ textAlignVertical: 'center', maxHeight: 88 }}
              />
              {draft.length > 50 && (
                <Text className="ml-2 text-[10px] font-semibold text-slate-400">
                  {draft.length}/{MAX_TEXT_LENGTH}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSend}
              disabled={sending || !draft.trim()}
              className={`w-12 h-12 rounded-2xl items-center justify-center ${draft.trim() && !sending ? '' : 'bg-slate-200'}`}
            >
              {draft.trim() && !sending ? (
                <LinearGradient
                  colors={['#ff6ea8', '#ff4f96']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                >
                  <AppIcon name="send" size={20} color="#ffffff" />
                </LinearGradient>
              ) : (
                <AppIcon name="send" size={20} color="#94a3b8" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
