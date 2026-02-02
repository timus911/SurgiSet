import { View, StatusBar } from 'react-native';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '../src/store/useThemeStore';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <Slot />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
