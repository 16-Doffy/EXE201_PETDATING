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
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, ChatMessageModel, PetModel } from '@/types';
import { getMessages, sendMessage } from '@/services/chatService';
import { getPetByOwnerId, getPetById } from '@/services/petService';
import ChatBubble from '@/components/ChatBubble';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen = ({ route, navigation }: Props) => {
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [myPetId, setMyPetId] = useState<string>('');
  const [otherPet, setOtherPet] = useState<PetModel | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<ChatMessageModel> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [me, other] = await Promise.all([
            getPetByOwnerId(),
            route.params.otherPetId ? getPetById(route.params.otherPetId) : Promise.resolve(null)
        ]);
        if (me) setMyPetId(me.id);
        if (other) setOtherPet(other);

        const incoming = await getMessages(route.params.matchId);
        setMessages(incoming);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 200);
      }
    };
    init();
  }, [route.params.matchId, route.params.otherPetId]);

  const onSend = async (customText?: string) => {
    const text = (customText || draft).trim();
    if (!text) return;

    const newMessage: ChatMessageModel = {
      id: `temp-${Date.now()}`,
      senderPetId: myPetId || 'me',
      text,
      createdAt: Date.now(),
    };

    // Hiển thị ngay lập tức lên màn hình
    setMessages((prev) => [...prev, newMessage]);
    setDraft('');

    try {
      await sendMessage(route.params.matchId, text, newMessage.senderPetId);
    } catch (err) {
      console.log('Gửi tin nhắn lỗi:', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
        onSend('[Hình ảnh]');
    }
  };

  const handleCall = (type: 'thoại' | 'video') => {
    Alert.alert(`Cuộc gọi ${type}`, `Đang kết nối đến ${route.params.otherPetName}...`, [{ text: 'Hủy', style: 'cancel' }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <LinearGradient colors={['#E0EAFC', '#FFFFFF']} className="absolute inset-0" />

      {/* Header */}
      <View className="flex-row items-center px-2 py-2 border-b border-gray-100 bg-white/90">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="chevron-back" size={28} color="#00B4DB" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 flex-row items-center ml-1">
            <View className="relative">
                <Image source={{ uri: otherPet?.image }} className="w-10 h-10 rounded-full border border-gray-100" />
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </View>
            <View className="ml-3">
                <Text className="text-[17px] font-bold text-textMain" numberOfLines={1}>{route.params.otherPetName}</Text>
                <Text className="text-[12px] text-textSub">Đang hoạt động</Text>
            </View>
        </TouchableOpacity>

        <View className="flex-row items-center px-2">
            <TouchableOpacity onPress={() => handleCall('thoại')} className="p-2">
                <Ionicons name="call" size={22} color="#00B4DB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCall('video')} className="p-2">
                <Ionicons name="videocam" size={24} color="#00B4DB" />
            </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {loading ? (
          <ActivityIndicator size="large" color="#00B4DB" className="mt-10" />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 16 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <ChatBubble
                text={item.text}
                isMine={item.senderPetId === myPetId || item.senderPetId === 'me'}
                otherAvatar={otherPet?.image}
              />
            )}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Image source={{ uri: otherPet?.image }} className="w-24 h-24 rounded-full mb-4 border-2 border-white" />
                <Text className="text-xl font-bold text-textMain">{route.params.otherPetName}</Text>
                <Text className="text-textSub text-center px-10 mt-2">Các bạn đã match! Hãy gửi lời chào ngay.</Text>
              </View>
            }
          />
        )}

        {/* Footer Input */}
        <View className="flex-row items-center px-2 py-3 border-t border-gray-50 bg-white">
            <TouchableOpacity onPress={pickImage} className="p-2">
                <Ionicons name="add-circle" size={26} color="#00B4DB" />
            </TouchableOpacity>

            <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 mx-1 flex-row items-center">
                <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Aa"
                    className="flex-1 text-[16px] text-textMain py-1"
                    multiline
                />
                <TouchableOpacity onPress={() => setDraft(prev => prev + '😊')}>
                    <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#00B4DB" />
                </TouchableOpacity>
            </View>

            {draft.trim() ? (
                <TouchableOpacity onPress={() => onSend()} className="p-2">
                    <Ionicons name="send" size={24} color="#00B4DB" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => onSend('👍')} className="p-2">
                    <Ionicons name="thumbs-up" size={26} color="#00B4DB" />
                </TouchableOpacity>
            )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
