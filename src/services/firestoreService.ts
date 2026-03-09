import {
  addDoc,
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ChatMessageModel, MatchModel, PetModel } from '@/types';

export const saveUser = async (userId: string, email: string) => {
  await setDoc(doc(db, 'users', userId), {
    id: userId,
    email,
    createdAt: Date.now(),
  });
};

export const createPetProfile = async (ownerId: string, pet: Omit<PetModel, 'id' | 'ownerId'>) => {
  await setDoc(doc(db, 'pets', ownerId), {
    id: ownerId,
    ownerId,
    ...pet,
  });
};

export const getPetByOwnerId = async (ownerId: string) => {
  const petRef = doc(db, 'pets', ownerId);
  const snap = await getDoc(petRef);
  return snap.exists() ? (snap.data() as PetModel) : null;
};

export const getExplorePets = async (currentPetId: string) => {
  const petsRef = collection(db, 'pets');
  const snap = await getDocs(petsRef);
  return snap.docs
    .map((d) => d.data() as PetModel)
    .filter((pet) => pet.id !== currentPetId);
};

export const likePet = async (fromPetId: string, toPetId: string) => {
  await addDoc(collection(db, 'likes'), {
    fromPetId,
    toPetId,
    createdAt: serverTimestamp(),
  });

  const reciprocal = query(
    collection(db, 'likes'),
    where('fromPetId', '==', toPetId),
    where('toPetId', '==', fromPetId)
  );
  const reciprocalSnap = await getDocs(reciprocal);

  if (!reciprocalSnap.empty) {
    const pair = [fromPetId, toPetId].sort();
    const existingMatch = query(
      collection(db, 'matches'),
      or(
        and(where('pet1', '==', pair[0]), where('pet2', '==', pair[1])),
        and(where('pet1', '==', pair[1]), where('pet2', '==', pair[0]))
      )
    );
    const existingSnap = await getDocs(existingMatch);

    if (existingSnap.empty) {
      await addDoc(collection(db, 'matches'), {
        pet1: pair[0],
        pet2: pair[1],
        createdAt: Date.now(),
      });
      return { matched: true };
    }
  }

  return { matched: false };
};

export const subscribeMatches = (
  petId: string,
  callback: (matches: MatchModel[]) => void
) => {
  const matchesQuery = query(
    collection(db, 'matches'),
    or(where('pet1', '==', petId), where('pet2', '==', petId)),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(matchesQuery, (snapshot) => {
    callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<MatchModel, 'id'>) })));
  });
};

export const sendMessage = async (matchId: string, senderPetId: string, text: string) => {
  await addDoc(collection(db, 'matches', matchId, 'messages'), {
    senderPetId,
    text,
    createdAt: Date.now(),
  });
};

export const subscribeMessages = (
  matchId: string,
  callback: (messages: ChatMessageModel[]) => void
) => {
  const messagesQuery = query(
    collection(db, 'matches', matchId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ChatMessageModel, 'id'>),
      }))
    );
  });
};
