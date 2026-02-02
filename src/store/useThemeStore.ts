import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: false,
            toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => storage),
        }
    )
);
