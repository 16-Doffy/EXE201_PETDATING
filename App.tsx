import 'react-native-gesture-handler';
import './global.css';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppNavigator from './src/navigation';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...Feather.font,
  });
  const [allowAppRender, setAllowAppRender] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setAllowAppRender(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      setAllowAppRender(true);
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [fontsLoaded]);

  if (!allowAppRender) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
