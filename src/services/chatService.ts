import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api';
import { ChatMessageModel } from '@/types';

const LOCAL_CHAT_KEY = 'bossitive_local_chat_messages';

type LocalChatMap = Record<string, ChatMessageModel[]>;

const readLocalMap = async (): Promise<LocalChatMap> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_CHAT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalChatMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
};

const writeLocalMap = async (map: LocalChatMap) => {
  await AsyncStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(map));
};

export const getMessages = async (matchId: string) => {
  try {
    const data = await apiRequest<{ messages: ChatMessageModel[] }>(/chat//messages, { auth: true });
    const localMap = await readLocalMap();
    const local = localMap[matchId] ?? [];
    return [...data.messages, ...local].sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    const localMap = await readLocalMap();
    return localMap[matchId] ?? [];
  }
};

export const sendMessage = async (matchId: string, text: string, senderPetId = 'me') => {
  const fallbackMessage: ChatMessageModel = {
    id: local-,
    senderPetId,
    text,
    createdAt: Date.now(),
  };
  try {
    const data = await apiRequest<{ message: ChatMessageModel }>(/chat//messages, {
      method: 'POST', auth: true, body: { text },
    });
    return data.message;
  } catch {
    const localMap = await readLocalMap();
    const current = localMap[matchId] ?? [];
    await writeLocalMap({ ...localMap, [matchId]: [...current, fallbackMessage] });
    return fallbackMessage;
  }
};