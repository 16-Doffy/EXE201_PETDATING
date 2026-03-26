export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  PhoneRegister: undefined;
  CreatePetProfile: undefined;
  HealthInfo: undefined;
  MyProfile: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
  LegalTerm: undefined;
  AboutApp: undefined;
  FAQ: undefined;
  MainTabs: undefined;
  PetDetail: { petId: string };
  Chat: { matchId: string; otherPetName: string; otherPetId?: string };
  Filter: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Matches: undefined;
  Profile: undefined;
};

export type UserModel = {
  id: string;
  email: string;
  createdAt?: number;
};

export type PetModel = {
  id: string;
  ownerId: string;
  name: string;
  age: string;
  breed: string;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  bio: string;
  image: string;
  ownerContact: string;
  weight?: string;
  tags?: string[];
  type?: 'Dog' | 'Cat';
};

export type MatchModel = {
  id: string;
  pet1: string;
  pet2: string;
  createdAt: number;
};

export type ChatMessageModel = {
  id: string;
  senderPetId: string;
  text: string;
  createdAt: number;
};
