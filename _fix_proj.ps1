$root = 'd:\Desktop\exe201'
$app = @"
import 'react-native-gesture-handler';
import './global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation';

export default function App() {
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
"@
$tmp = "$env:TEMP\__app_fixtmp.tsx"
[System.IO.File]::WriteAllText($tmp, $app, [System.Text.Encoding]::UTF8)
Copy-Item $tmp "$root\App.tsx" -Force
Remove-Item $tmp -Force -EA SilentlyContinue
Write-Host 'App done'
