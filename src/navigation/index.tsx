import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '@/types';
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import PhoneRegisterScreen from '@/screens/PhoneRegisterScreen';
import CreatePetProfileScreen from '@/screens/CreatePetProfileScreen';
import HomeSwipeScreen from '@/screens/HomeSwipeScreen';
import MatchesScreen from '@/screens/MatchesScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import PetDetailScreen from '@/screens/PetDetailScreen';
import ChatScreen from '@/screens/ChatScreen';
import HealthInfoScreen from '@/screens/HealthInfoScreen';
import PaymentScreen from '@/screens/PaymentScreen';
import MyProfileScreen from '@/screens/MyProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import PrivacyPolicyScreen from '@/screens/PrivacyPolicyScreen';
import LegalTermScreen from '@/screens/LegalTermScreen';
import AboutAppScreen from '@/screens/AboutAppScreen';
import FaqScreen from '@/screens/FaqScreen';
import FilterScreen from '@/screens/FilterScreen';
import AdminDashboardScreen from '@/screens/AdminDashboardScreen';
import { useAuth } from '@/hooks/useAuth';
import { getPetByOwnerId } from '@/services/petService';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const LOCAL_PET_KEY = 'bossitive_local_pet_profile';

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#00B4DB',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarLabelStyle: { fontSize: 12, marginBottom: 2, fontWeight: '600' },
      tabBarStyle: { borderTopWidth: 0, height: 70, paddingBottom: 8, paddingTop: 8, backgroundColor: '#FFFFFF', elevation: 10 },
      tabBarIcon: ({ color, size, focused }) => {
        if (route.name === 'Home') return <Ionicons name={focused ? 'home' : 'home-outline'} size={size + 1} color={color} />;
        if (route.name === 'Matches') return <MaterialCommunityIcons name={focused ? 'chat-processing' : 'chat-processing-outline'} size={size + 1} color={color} />;
        return <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size + 1} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeSwipeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
    <Tab.Screen name="Matches" component={MatchesScreen} options={{ tabBarLabel: 'Trò chuyện' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Cá nhân' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [hasPetProfile, setHasPetProfile] = useState<boolean | null>(null);

  const checkPet = useCallback(async () => {
    if (!user) {
      setHasPetProfile(false);
      return;
    }
    // 1. Đọc local trước — nhanh, không cần API
    const local = await AsyncStorage.getItem(LOCAL_PET_KEY).catch(() => null);
    if (local) {
      setHasPetProfile(true);
      return;
    }
    // 2. Local không có → thử hỏi server
    try {
      const pet = await getPetByOwnerId();
      setHasPetProfile(Boolean(pet));
    } catch {
      setHasPetProfile(false);
    }
  }, [user]);

  useEffect(() => {
    checkPet();
  }, [checkPet]);

  if (loading || hasPetProfile === null) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="PhoneRegister" component={PhoneRegisterScreen} />
        </>
      ) : !hasPetProfile ? (
        <Stack.Screen name="CreatePetProfile" component={CreatePetProfileScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="PetDetail" component={PetDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="HealthInfo" component={HealthInfoScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="MyProfile" component={MyProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="LegalTerm" component={LegalTermScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
          <Stack.Screen name="FAQ" component={FaqScreen} />
          <Stack.Screen name="Filter" component={FilterScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
