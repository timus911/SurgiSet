export const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        if (typeof localStorage !== 'undefined') {
            return localStorage.removeItem(key);
        }
    },
};
