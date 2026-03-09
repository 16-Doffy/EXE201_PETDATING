import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import MyProfileScreen from '@/screens/MyProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import PrivacyPolicyScreen from '@/screens/PrivacyPolicyScreen';
import LegalTermScreen from '@/screens/LegalTermScreen';
import AboutAppScreen from '@/screens/AboutAppScreen';
import FaqScreen from '@/screens/FaqScreen';
import { useAuth } from '@/hooks/useAuth';
import { getPetByOwnerId } from '@/services/petService';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#FF4F86',
      tabBarInactiveTintColor: '#9A9AA4',
      tabBarLabelStyle: { fontSize: 12, marginBottom: 2, fontWeight: '600' },
      tabBarStyle: {
        borderTopWidth: 0,
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: '#FFF8FA',
      },
      tabBarIcon: ({ color, size, focused }) => {
        if (route.name === 'Home') {
          return <Ionicons name={focused ? 'home' : 'home-outline'} size={size + 1} color={color} />;
        }
        if (route.name === 'Matches') {
          return (
            <MaterialCommunityIcons
              name={focused ? 'chat-processing' : 'chat-processing-outline'}
              size={size + 1}
              color={color}
            />
          );
        }
        return <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size + 1} color={color} />;
      },
      tabBarItemStyle: { paddingVertical: 2 },
    })}
  >
    <Tab.Screen name="Home" component={HomeSwipeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Matches" component={MatchesScreen} options={{ tabBarLabel: 'Matches' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [hasPetProfile, setHasPetProfile] = useState<boolean>(false);
  const [checkingPet, setCheckingPet] = useState(true);

  useEffect(() => {
    let alive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkPet = async () => {
      try {
        if (!user) {
          if (alive) {
            setHasPetProfile(false);
            setCheckingPet(false);
          }
          return;
        }

        const pet = await getPetByOwnerId();
        if (alive) {
          setHasPetProfile(Boolean(pet));
        }
      } catch {
        if (alive) {
          setHasPetProfile(false);
        }
      } finally {
        if (alive) {
          setCheckingPet(false);
        }
      }
    };

    checkPet();

    if (user && !hasPetProfile) {
      intervalId = setInterval(checkPet, 1500);
    }

    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, hasPetProfile]);

  if (loading || checkingPet) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
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
            <Stack.Screen name="MyProfile" component={MyProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="LegalTerm" component={LegalTermScreen} />
            <Stack.Screen name="AboutApp" component={AboutAppScreen} />
            <Stack.Screen name="FAQ" component={FaqScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
