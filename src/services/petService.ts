import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/services/api';
import { MatchModel, PetModel } from '@/types';

type PetPayload = Omit<PetModel, 'id' | 'ownerId'>;

type LocalMatchItem = {
  match: MatchModel;
  pet: PetModel;
};

const LOCAL_MATCHES_KEY = 'bossitive_local_matches';
const LOCAL_PET_KEY = 'bossitive_local_pet_profile';

const readLocalPet = async (): Promise<PetModel | null> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PET_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PetModel;
  } catch {
    return null;
  }
};

const writeLocalPet = async (pet: PetModel) => {
  await AsyncStorage.setItem(LOCAL_PET_KEY, JSON.stringify(pet));
};

const readLocalMatches = async (): Promise<LocalMatchItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_MATCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalMatchItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalMatches = async (items: LocalMatchItem[]) => {
  await AsyncStorage.setItem(LOCAL_MATCHES_KEY, JSON.stringify(items));
};

export const createPetProfile = async (pet: PetPayload) => {
  try {
    const data = await apiRequest<{ pet: PetModel }>('/pets/me', {
      method: 'POST',
      auth: true,
      body: pet,
    });
    await writeLocalPet(data.pet);
    return data.pet;
  } catch {
    const fallback: PetModel = {
      id: `local-pet-${Date.now()}`,
      ownerId: 'local-owner',
      ...pet,
    };
    await writeLocalPet(fallback);
    return fallback;
  }
};

export const getPetByOwnerId = async (_ownerId?: string) => {
  try {
    const data = await apiRequest<{ pet: PetModel | null }>('/pets/me', { auth: true });
    if (data.pet) await writeLocalPet(data.pet);
    return data.pet;
  } catch {
    const fallback = await readLocalPet();
    return fallback;
  }
};

export const getPetById = async (petId: string) => {
  try {
    const data = await apiRequest<{ pet: PetModel }>(`/pets/${petId}`, { auth: true });
    return data.pet;
  } catch {
    // Fallback if API fails
    const localMatches = await readLocalMatches();
    const found = localMatches.find(m => m.pet.id === petId);
    return found?.pet || null;
  }
};

export const getExplorePets = async () => {
  const data = await apiRequest<{ pets: PetModel[] }>('/pets/explore', { auth: true });
  return data.pets;
};

export const likePet = async (toPetId: string) => {
  return apiRequest<{ matched: boolean; matchId: string | null }>('/social/like', {
    method: 'POST',
    auth: true,
    body: { toPetId },
  });
};

export const unlikePet = async (toPetId: string) => {
    // In a real app, this would be a DELETE or POST to /social/unlike
    // For local fallback:
    const current = await readLocalMatches();
    const filtered = current.filter(item => item.pet.id !== toPetId);
    await writeLocalMatches(filtered);

    return apiRequest<{ success: boolean }>('/social/unlike', {
      method: 'POST',
      auth: true,
      body: { toPetId },
    }).catch(() => ({ success: true }));
};

export const addLocalMatch = async (myPetId: string, pet: PetModel) => {
  const current = await readLocalMatches();
  const exists = current.some((item) => item.pet.id === pet.id);
  if (exists) return;

  const match: MatchModel = {
    id: `local-match-${Date.now()}-${pet.id}`,
    pet1: myPetId,
    pet2: pet.id,
    createdAt: Date.now(),
  };

  await writeLocalMatches([{ match, pet }, ...current]);
};

export const getLocalMatches = async () => {
  return readLocalMatches();
};

export const getMatches = async () => {
  const data = await apiRequest<{ matches: MatchModel[] }>('/social/matches', { auth: true });
  return data.matches;
};
