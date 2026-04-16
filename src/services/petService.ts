import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api';
import { MatchModel, PetModel } from '@/types';
import { getRandomImage } from '@/constants/images';

type PetPayload = Omit<PetModel, 'id' | 'ownerId'>;

type LocalMatchItem = {
  match: MatchModel;
  pet: PetModel;
};

type PetProfileListener = (pet: PetModel | null) => void;

const LOCAL_MATCHES_KEY = 'bossitive_local_matches';
const LOCAL_PET_KEY = 'bossitive_local_pet_profile';
const petProfileListeners = new Set<PetProfileListener>();

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

const inferPetType = (pet: Partial<PetModel>) => {
  if (pet.type === 'Dog' || pet.type === 'Cat') return pet.type;

  const source = [
    pet.breed,
    pet.name,
    pet.bio,
    Array.isArray(pet.tags) ? pet.tags.join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const catKeywords = ['cat', 'meo', 'mèo', 'anh', 'mun', 'mướp', 'scottish', 'persian'];
  const dogKeywords = ['dog', 'cho', 'chó', 'corgi', 'poodle', 'husky', 'retriever', 'becgie'];

  if (catKeywords.some((keyword) => source.includes(keyword))) return 'Cat';
  if (dogKeywords.some((keyword) => source.includes(keyword))) return 'Dog';
  return 'Dog';
};

const normalizePet = (pet: Partial<PetModel> & { id?: string; _id?: string }): PetModel => {
  const type = inferPetType(pet);
  const id = String(pet.id ?? pet._id ?? `pet-${Date.now()}`);

  return {
    id,
    ownerId: String(pet.ownerId ?? ''),
    name: String(pet.name ?? ''),
    age: String(pet.age ?? ''),
    breed: String(pet.breed ?? ''),
    gender: (pet.gender as PetModel['gender']) ?? 'Other',
    location: String(pet.location ?? ''),
    bio: String(pet.bio ?? ''),
    image: String(pet.image ?? '') || getRandomImage(type, id),
    ownerContact: String(pet.ownerContact ?? ''),
    weight: typeof pet.weight === 'string' ? pet.weight : '',
    tags: Array.isArray(pet.tags) ? pet.tags.map(String) : [],
    type,
  };
};

const normalizeMatch = (match: Partial<MatchModel> & { id?: string; _id?: string }): MatchModel => ({
  id: String(match.id ?? match._id ?? `match-${Date.now()}`),
  pet1: String(match.pet1 ?? ''),
  pet2: String(match.pet2 ?? ''),
  createdAt: toTimestamp(match.createdAt),
});

const emitPetProfile = (pet: PetModel | null) => {
  petProfileListeners.forEach((listener) => listener(pet));
};

const readLocalPet = async (): Promise<PetModel | null> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PET_KEY);
    if (!raw) return null;
    return normalizePet(JSON.parse(raw) as PetModel);
  } catch {
    return null;
  }
};

const writeLocalPet = async (pet: PetModel) => {
  const normalized = normalizePet(pet);
  await AsyncStorage.setItem(LOCAL_PET_KEY, JSON.stringify(normalized));
  emitPetProfile(normalized);
};

const readLocalMatches = async (): Promise<LocalMatchItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_MATCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalMatchItem[];
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          match: normalizeMatch(item.match),
          pet: normalizePet(item.pet),
        }))
      : [];
  } catch {
    return [];
  }
};

const writeLocalMatches = async (items: LocalMatchItem[]) => {
  await AsyncStorage.setItem(
    LOCAL_MATCHES_KEY,
    JSON.stringify(
      items.map((item) => ({
        match: normalizeMatch(item.match),
        pet: normalizePet(item.pet),
      }))
    )
  );
};

export const subscribePetProfile = (listener: PetProfileListener) => {
  petProfileListeners.add(listener);
  readLocalPet()
    .then(listener)
    .catch(() => listener(null));

  return () => {
    petProfileListeners.delete(listener);
  };
};

export const clearPetCache = async () => {
  await AsyncStorage.multiRemove([LOCAL_PET_KEY, LOCAL_MATCHES_KEY]);
  emitPetProfile(null);
};

export const createPetProfile = async (pet: PetPayload) => {
  const data = await apiRequest<{ pet: PetModel }>('/pets/me', {
    method: 'POST',
    auth: true,
    body: pet,
  });
  const normalized = normalizePet(data.pet);
  await writeLocalPet(normalized);
  return normalized;
};

export const getPetByOwnerId = async (_ownerId?: string) => {
  try {
    const data = await apiRequest<{ pet: PetModel | null }>('/pets/me', { auth: true });
    if (!data.pet) return null;
    const normalized = normalizePet(data.pet);
    await writeLocalPet(normalized);
    return normalized;
  } catch {
    return readLocalPet();
  }
};

export const getPetById = async (petId: string) => {
  try {
    const data = await apiRequest<{ pet: PetModel }>(`/pets/${petId}`, { auth: true });
    return normalizePet(data.pet);
  } catch {
    const localMatches = await readLocalMatches();
    const found = localMatches.find((item) => item.pet.id === petId);
    return found?.pet || null;
  }
};

export const getExplorePets = async () => {
  const data = await apiRequest<{ pets: PetModel[] }>('/pets/explore', { auth: true });
  return (data.pets || []).map(normalizePet);
};

export const likePet = async (toPetId: string) => {
  const result = await apiRequest<{ matched: boolean; matchId: string | null }>('/social/like', {
    method: 'POST',
    auth: true,
    body: { toPetId },
  });

  if (result.matched && result.matchId) {
    const [myPet, otherPet] = await Promise.all([
      readLocalPet(),
      getPetById(toPetId).catch(() => null),
    ]);

    if (myPet && otherPet) {
      await addLocalMatch(myPet.id, otherPet, result.matchId);
    }
  }

  return result;
};

export const unlikePet = async (toPetId: string) => {
  return apiRequest<{ success: boolean }>('/social/unlike', {
    method: 'POST',
    auth: true,
    body: { toPetId },
  });
};

export const unmatch = async (matchId: string) => {
  return apiRequest<{ success: boolean }>(`/social/matches/${matchId}`, {
    method: 'DELETE',
    auth: true,
  });
};

export const getSocialStats = async (): Promise<{ matches: number; likes: number; pets: number }> => {
  return apiRequest<{ matches: number; likes: number; pets: number }>('/social/stats', {
    auth: true,
  }).catch(async () => {
    const localPet = await readLocalPet();
    const localMatches = await readLocalMatches();
    return {
      matches: localMatches.length,
      likes: 0,
      pets: localPet ? 1 : 0,
    };
  });
};

export const addLocalMatch = async (myPetId: string, pet: PetModel, matchId?: string) => {
  const current = await readLocalMatches();
  const exists = current.some(
    (item) => item.pet.id === pet.id || (matchId ? item.match.id === matchId : false)
  );
  if (exists) return;

  const match: MatchModel = normalizeMatch({
    id: matchId || `local-match-${Date.now()}-${pet.id}`,
    pet1: myPetId,
    pet2: pet.id,
    createdAt: Date.now(),
  });

  await writeLocalMatches([{ match, pet: normalizePet(pet) }, ...current]);
};

export const getLocalMatches = async () => {
  return readLocalMatches();
};

export const getMatches = async () => {
  const data = await apiRequest<{ matches: MatchModel[] }>('/social/matches', { auth: true });
  return (data.matches || []).map(normalizeMatch);
};
