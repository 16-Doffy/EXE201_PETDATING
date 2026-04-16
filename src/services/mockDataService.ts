import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchModel, PetModel, ChatMessageModel } from '@/types';

// ─── Keys ───────────────────────────────────────────────────────────────────

const PETS_KEY = 'bossitive_explore_pets';
const MATCHES_KEY = 'bossitive_matches';
const CHAT_KEY = 'bossitive_chat_messages';
const MY_PET_KEY = 'bossitive_my_pet';

// ─── Default mock pets ───────────────────────────────────────────────────────

const DEFAULT_PETS: Omit<PetModel, 'ownerId'>[] = [
  {
    id: 'pet-1',
    name: 'Nocca',
    age: '3',
    breed: 'Mèo Anh lông ngắn',
    gender: 'Female',
    location: 'TP. Hồ Chí Minh',
    bio: 'Nocca là một cô mèo đáng yêu với bộ lông mịn màng. Bé rất thân thiện và thích được vuốt ve.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    ownerContact: '0901234567',
    weight: '1.8',
    tags: ['đã tiêm phòng', 'thân thiện'],
    type: 'Cat',
  },
  {
    id: 'pet-2',
    name: 'Olive',
    age: '2',
    breed: 'Poodle',
    gender: 'Male',
    location: 'Hà Nội',
    bio: 'Olive là chú chó Poodle thông minh và nghịch ngợm. Bé rất trung thành và thích chơi đùa.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
    ownerContact: '0902345678',
    weight: '2.8',
    tags: ['đã tiêm phòng', 'thích trẻ em'],
    type: 'Dog',
  },
  {
    id: 'pet-3',
    name: 'Milo',
    age: '1',
    breed: 'Mèo Ba Tư',
    gender: 'Male',
    location: 'Đà Nẵng',
    bio: 'Milo là chú mèo Ba Tư đáng yêu với đôi mắt to tròn. Bé thích ngồi trong lòng và được vuốt ve.',
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600',
    ownerContact: '0903456789',
    weight: '2.1',
    tags: ['đã tiêm phòng', 'hiền lành'],
    type: 'Cat',
  },
  {
    id: 'pet-4',
    name: 'Buddy',
    age: '4',
    breed: 'Golden Retriever',
    gender: 'Male',
    location: 'TP. Hồ Chí Minh',
    bio: 'Buddy là chú chó Golden Retriever đáng yêu. Bé rất thông minh, thân thiện và thích bơi lội.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600',
    ownerContact: '0904567890',
    weight: '15.0',
    tags: ['đã tiêm phòng', 'thân thiện'],
    type: 'Dog',
  },
  {
    id: 'pet-5',
    name: 'Luna',
    age: '2',
    breed: 'Mèo Munchkin',
    gender: 'Female',
    location: 'Cần Thơ',
    bio: 'Luna là cô mèo Munchkin xinh xắn. Bé rất nghịch ngợm và thích nhảy nhót khắp nhà.',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
    ownerContact: '0905678901',
    weight: '1.5',
    tags: ['đã tiêm phòng', 'năng động'],
    type: 'Cat',
  },
  {
    id: 'pet-6',
    name: 'Rocky',
    age: '5',
    breed: 'Bulldog',
    gender: 'Male',
    location: 'Hải Phòng',
    bio: 'Rocky là chú chó Bulldog đáng yêu. Dù nhìn hơi dữ nhưng thực ra rất hiền và thích được nằm trên sofa.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
    ownerContact: '0906789012',
    weight: '12.0',
    tags: ['đã tiêm phòng', 'hiền lành'],
    type: 'Dog',
  },
  {
    id: 'pet-7',
    name: 'Cleo',
    age: '1',
    breed: 'Mèo Ragdoll',
    gender: 'Female',
    location: 'Nha Trang',
    bio: 'Cleo là cô mèo Ragdoll mềm mại như bông. Bé rất thích được bế và thư giãn trong lòng chủ.',
    image: 'https://images.unsplash.com/photo-1526336028067-6484187f566e?w=600',
    ownerContact: '0907890123',
    weight: '2.3',
    tags: ['đã tiêm phòng', 'đáng yêu'],
    type: 'Cat',
  },
  {
    id: 'pet-8',
    name: 'Max',
    age: '3',
    breed: 'Husky',
    gender: 'Male',
    location: 'Lâm Đồng',
    bio: 'Max là chú chó Husky với bộ lông đẹp mắt. Bé rất năng động và thích chạy bên ngoài trời lạnh.',
    image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600',
    ownerContact: '0908901234',
    weight: '18.0',
    tags: ['đã tiêm phòng', 'năng động'],
    type: 'Dog',
  },
];

// ─── My Pet (current user) ───────────────────────────────────────────────────

export const DEFAULT_MY_PET: PetModel = {
  id: 'my-pet-1',
  ownerId: 'current-user',
  name: 'Coco',
  age: '2',
  breed: 'Shiba Inu',
  gender: 'Male',
  location: 'TP. Hồ Chí Minh',
  bio: 'Coco là chú Shiba Inu năng động và đáng yêu. Bé thích đi dạo và khám phá thế giới bên ngoài.',
  image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  ownerContact: '0912345678',
  weight: '6.5',
  tags: ['đã tiêm phòng', 'thân thiện'],
  type: 'Dog',
};

// ─── Pet Service (local) ─────────────────────────────────────────────────────

export const getExplorePets = async (): Promise<PetModel[]> => {
  try {
    const raw = await AsyncStorage.getItem(PETS_KEY);
    if (raw) {
      const pets = JSON.parse(raw) as PetModel[];
      if (pets.length > 0) return pets;
    }
  } catch {}
  // First time: seed with defaults
  const pets = DEFAULT_PETS.map((p) => ({ ...p, ownerId: 'other-user' }));
  await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
  return pets;
};

export const getPetById = async (petId: string): Promise<PetModel | null> => {
  const pets = await getExplorePets();
  return pets.find((p) => p.id === petId) ?? null;
};

export const getMyPet = async (): Promise<PetModel> => {
  try {
    const raw = await AsyncStorage.getItem(MY_PET_KEY);
    if (raw) return JSON.parse(raw) as PetModel;
  } catch {}
  await AsyncStorage.setItem(MY_PET_KEY, JSON.stringify(DEFAULT_MY_PET));
  return DEFAULT_MY_PET;
};

export const updateMyPet = async (updates: Partial<PetModel>): Promise<PetModel> => {
  const current = await getMyPet();
  const updated = { ...current, ...updates };
  await AsyncStorage.setItem(MY_PET_KEY, JSON.stringify(updated));
  return updated;
};

// ─── Like / Unlike ────────────────────────────────────────────────────────────

const LIKED_KEY = 'bossitive_liked_pets';
const DISLIKED_KEY = 'bossitive_disliked_pets';

const readIds = async (key: string): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const writeIds = async (key: string, ids: string[]) => {
  await AsyncStorage.setItem(key, JSON.stringify(ids));
};

export const likePet = async (petId: string): Promise<{ matched: boolean; matchId: string | null }> => {
  const liked = await readIds(LIKED_KEY);
  if (!liked.includes(petId)) {
    await writeIds(LIKED_KEY, [...liked, petId]);
  }

  // Simulate 30% match chance
  const matched = Math.random() < 0.3;
  if (matched) {
    const matchId = `match-${petId}-${Date.now()}`;
    await addMatch(matchId, petId);
    return { matched: true, matchId };
  }
  return { matched: false, matchId: null };
};

export const unlikePet = async (petId: string): Promise<void> => {
  const disliked = await readIds(DISLIKED_KEY);
  if (!disliked.includes(petId)) {
    await writeIds(DISLIKED_KEY, [...disliked, petId]);
  }
};

export const getLikedPetIds = async (): Promise<string[]> => readIds(LIKED_KEY);

// ─── Matches ──────────────────────────────────────────────────────────────────────

export const getMatches = async (): Promise<MatchModel[]> => {
  try {
    const raw = await AsyncStorage.getItem(MATCHES_KEY);
    if (raw) return JSON.parse(raw) as MatchModel[];
  } catch {}
  return [];
};

const addMatch = async (matchId: string, otherPetId: string) => {
  const myPet = await getMyPet();
  const match: MatchModel = {
    id: matchId,
    pet1: myPet.id,
    pet2: otherPetId,
    createdAt: Date.now(),
  };
  const current = await getMatches();
  const exists = current.some((m) => m.id === matchId || (m.pet2 === otherPetId));
  if (!exists) {
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify([match, ...current]));
  }
};

export const getMatchByPetId = async (otherPetId: string): Promise<MatchModel | null> => {
  const matches = await getMatches();
  return matches.find((m) => m.pet2 === otherPetId) ?? null;
};

// ─── Chat Messages ────────────────────────────────────────────────────────────

type LocalChatMap = Record<string, ChatMessageModel[]>;

const readChatMap = async (): Promise<LocalChatMap> => {
  try {
    const raw = await AsyncStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const writeChatMap = async (map: LocalChatMap) => {
  await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(map));
};

export const getMessages = async (matchId: string): Promise<ChatMessageModel[]> => {
  const map = await readChatMap();
  return map[matchId] ?? [];
};

export const sendMessage = async (
  matchId: string,
  text: string,
  senderPetId: string
): Promise<ChatMessageModel> => {
  const msg: ChatMessageModel = {
    id: `local-${Date.now()}`,
    senderPetId,
    text,
    createdAt: Date.now(),
  };
  const map = await readChatMap();
  await writeChatMap({ ...map, [matchId]: [...(map[matchId] ?? []), msg] });
  return msg;
};

export const getUnreadCount = async (matchId: string, myPetId: string): Promise<number> => {
  const msgs = await getMessages(matchId);
  const oneDayAgo = Date.now() - 86400000;
  return msgs.filter(
    (m) => m.senderPetId !== myPetId && (m.createdAt || 0) > oneDayAgo
  ).length;
};

// ─── Seed demo data for testing ───────────────────────────────────────────────

export const seedDemoData = async () => {
  const existingMatches = await getMatches();
  if (existingMatches.length > 0) return; // already seeded

  const pets = await getExplorePets();
  if (pets.length < 2) return;

  // Create 2 demo matches with messages
  const myPet = await getMyPet();

  const demoMatches: MatchModel[] = [
    {
      id: 'match-demo-1',
      pet1: myPet.id,
      pet2: pets[0].id,
      createdAt: Date.now() - 3600000, // 1 hour ago
    },
    {
      id: 'match-demo-2',
      pet1: myPet.id,
      pet2: pets[3].id,
      createdAt: Date.now() - 86400000, // 1 day ago
    },
  ];

  const demoMessages: LocalChatMap = {
    'match-demo-1': [
      { id: 'dm1-1', senderPetId: pets[0].id, text: 'Chào bạn! 😺 Bé Nocca rất vui được gặp bạn!', createdAt: Date.now() - 3500000 },
      { id: 'dm1-2', senderPetId: myPet.id, text: 'Chào Nocca! Mình cũng rất vui! 🐶', createdAt: Date.now() - 3400000 },
      { id: 'dm1-3', senderPetId: pets[0].id, text: 'Bạn ơi, bạn có muốn gặp mình không?', createdAt: Date.now() - 3300000 },
      { id: 'dm1-4', senderPetId: myPet.id, text: 'Được chứ! Hẹn gặp cuối tuần nhé!', createdAt: Date.now() - 3200000 },
    ],
    'match-demo-2': [
      { id: 'dm2-1', senderPetId: pets[3].id, text: 'Chào bạn! Buddy đây 🐕', createdAt: Date.now() - 85000000 },
      { id: 'dm2-2', senderPetId: myPet.id, text: 'Chào Buddy! Bạn đẹp quá!', createdAt: Date.now() - 84000000 },
      { id: 'dm2-3', senderPetId: pets[3].id, text: 'Cảm ơn bạn! Mình thích chơi đùa với các bạn chó khác lắm!', createdAt: Date.now() - 83000000 },
    ],
  };

  await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(demoMatches));
  await writeChatMap(demoMessages);
};
