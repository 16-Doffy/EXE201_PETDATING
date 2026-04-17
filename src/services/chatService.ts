import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api';
import { ChatMessageModel } from '@/types';

const LOCAL_CHAT_KEY = 'bossitive_local_chat_messages';

type LocalChatMap = Record<string, ChatMessageModel[]>;

const toTimestamp = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const direct = Number(value);
    if (!Number.isNaN(direct) && direct > 0) return direct;
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (value instanceof Date) return value.getTime();
  return Date.now();
};

const normalizeMessage = (message: Partial<ChatMessageModel> & { id?: string }): ChatMessageModel => ({
  id: String(message.id ?? `msg-${Date.now()}`),
  senderPetId: String(message.senderPetId ?? 'me'),
  text: String(message.text ?? ''),
  createdAt: toTimestamp(message.createdAt),
  type: message.type,
  image: message.image,
  seen: message.seen,
  status: message.status,
});

const dedupeMessages = (messages: ChatMessageModel[]) => {
  const map = new Map<string, ChatMessageModel>();

  messages
    .map(normalizeMessage)
    .forEach((message) => {
      const key =
        message.id.startsWith('temp-') || message.id.startsWith('local-')
          ? `${message.senderPetId}:${message.text}:${message.createdAt}`
          : message.id;

      if (!map.has(key)) {
        map.set(key, message);
      }
    });

  return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
};

const readLocalMap = async (): Promise<LocalChatMap> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_CHAT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalChatMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeLocalMap = async (map: LocalChatMap) => {
  await AsyncStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(map));
};

const persistLocalMessage = async (matchId: string, message: ChatMessageModel) => {
  const localMap = await readLocalMap();
  const current = localMap[matchId] ?? [];

  await writeLocalMap({
    ...localMap,
    [matchId]: dedupeMessages([...current, message]),
  });
};

export const clearChatCache = async () => {
  await AsyncStorage.removeItem(LOCAL_CHAT_KEY);
};

export const getMessages = async (matchId: string): Promise<ChatMessageModel[]> => {
  try {
    const data = await apiRequest<{ messages: ChatMessageModel[] }>(
      `/chat/${matchId}/messages`,
      { auth: true }
    );

    const localMap = await readLocalMap();
    const local = localMap[matchId] ?? [];

    return dedupeMessages([...(data.messages || []), ...local]);
  } catch {
    const localMap = await readLocalMap();
    return dedupeMessages(localMap[matchId] ?? []);
  }
};

export const sendMessage = async (
  matchId: string,
  text: string,
  senderPetId = 'me'
): Promise<ChatMessageModel> => {
  try {
    const data = await apiRequest<{ message: ChatMessageModel }>(
      `/chat/${matchId}/messages`,
      {
        method: 'POST',
        auth: true,
        body: { text },
      }
    );

    const message = normalizeMessage({ ...data.message, status: 'sent' });
    await persistLocalMessage(matchId, message);
    return message;
  } catch {
    const fallbackMessage = normalizeMessage({
      id: `local-${Date.now()}`,
      senderPetId,
      text,
      createdAt: Date.now(),
      status: 'pending',
    });

    await persistLocalMessage(matchId, fallbackMessage);
    return fallbackMessage;
  }
};
