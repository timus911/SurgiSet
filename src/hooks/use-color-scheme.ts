import { useThemeStore } from '../store/useThemeStore';

export function useColorScheme() {
    const { isDarkMode } = useThemeStore();
    return isDarkMode ? 'dark' : 'light';
}
