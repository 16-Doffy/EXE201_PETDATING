import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '@/types';
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import PhoneRegisterScreen from '@/screens/PhoneRegisterScreen';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
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
import TransactionHistoryScreen from '@/screens/TransactionHistoryScreen';
import { useAuth } from '@/hooks/useAuth';
import { getPetByOwnerId, subscribePetProfile } from '@/services/petService';
import AppIcon from '@/components/ui/AppIcon';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const LOCAL_PET_KEY = 'bossitive_local_pet_profile';

const TabIcon = ({
  icon,
  label,
  color,
  focused,
}: {
  icon: 'home' | 'chat' | 'profile';
  label: string;
  color: string;
  focused: boolean;
}) => (
  <View className="items-center justify-center">
    <View
      className={`w-14 h-14 rounded-[20px] items-center justify-center ${focused ? 'bg-sky-50' : 'bg-transparent'}`}
    >
      <AppIcon name={icon} size={22} color={color} />
    </View>
    <View className="mt-1">
      <Text
        style={{
          fontSize: 11,
          lineHeight: 12,
          fontWeight: focused ? '700' : '600',
          color,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#00B4DB',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarShowLabel: false,
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        borderTopWidth: 0,
        height: 88,
        paddingBottom: 12,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
        elevation: 10,
      },
      tabBarIcon: ({ color, size, focused }) => {
        if (route.name === 'Home') {
          return (
            <TabIcon
              icon="home"
              label="Trang chủ"
              color={color}
              focused={focused}
            />
          );
        }

        if (route.name === 'Matches') {
          return (
            <TabIcon
              icon="chat"
              label="Chat"
              color={color}
              focused={focused}
            />
          );
        }

        return (
          <TabIcon
            icon="profile"
            label="Cá nhân"
            color={color}
            focused={focused}
          />
        );
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
      const pet = await Promise.race<Awaited<ReturnType<typeof getPetByOwnerId>>>([
        getPetByOwnerId(),
        new Promise((resolve) => setTimeout(() => resolve(null), 3500)),
      ]);
      setHasPetProfile(Boolean(pet));
    } catch {
      setHasPetProfile(false);
    }
  }, [user]);

  useEffect(() => {
    checkPet();
  }, [checkPet]);

  useEffect(() => {
    const unsubscribe = subscribePetProfile((pet) => {
      if (!user) {
        setHasPetProfile(false);
        return;
      }

      setHasPetProfile(Boolean(pet));
    });

    return unsubscribe;
  }, [user]);

  if (loading || (Boolean(user) && hasPetProfile === null)) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="PhoneRegister" component={PhoneRegisterScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : user.role === 'admin' ? (
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      ) : !hasPetProfile ? (
        <Stack.Screen name="CreatePetProfile" component={CreatePetProfileScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="PetDetail" component={PetDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="HealthInfo" component={HealthInfoScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
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
