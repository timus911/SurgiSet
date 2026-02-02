import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const pickImageFromLibrary = async (): Promise<string | null> => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            return saveImageToDisk(result.assets[0].uri);
        }
    } catch (error) {
        console.error('Error picking image:', error);
    }
    return null;
};

export const takePhoto = async (): Promise<string | null> => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            return saveImageToDisk(result.assets[0].uri);
        }
    } catch (error) {
        console.error('Error taking photo:', error);
    }
    return null;
};

const saveImageToDisk = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web') {
        // Convert blob URI to Base64 for persistence
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Failed to convert web image to base64', e);
            return uri;
        }
    }

    const filename = uri.split('/').pop();
    const newPath = FileSystem.documentDirectory + filename;

    try {
        await FileSystem.copyAsync({
            from: uri,
            to: newPath,
        });
        return newPath;
    } catch (error) {
        console.error('Error saving image:', error);
        return uri; // Return original URI if copy fails
    }
};
