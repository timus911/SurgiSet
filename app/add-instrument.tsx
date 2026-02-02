import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Image, Platform, StatusBar } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInstrumentStore } from '../src/store/useInstrumentStore';
import { useThemeStore } from '../src/store/useThemeStore';
import { Colors } from '../src/constants/theme';

export default function AddInstrumentScreen() {
    const router = useRouter();
    const { addInstrument } = useInstrumentStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !description || !quantity) {
            if (typeof window !== 'undefined' && Platform.OS === 'web') {
                window.alert('Please fill in all fields');
            } else {
                Alert.alert('Error', 'Please fill in all fields');
            }
            return;
        }

        setLoading(true);
        addInstrument({
            name,
            description,
            quantity: parseInt(quantity) || 1,
        });

        setTimeout(() => {
            setLoading(false);
            router.back();
        }, 500);
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 20,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        backButton: {
            padding: 8,
            backgroundColor: theme.accent,
            borderRadius: 12,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.subtext,
            marginBottom: 8,
        },
        input: {
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            fontSize: 16,
            color: theme.text,
            borderWidth: 1,
            borderColor: theme.border,
        },
        saveButton: {
            backgroundColor: theme.primary,
            paddingVertical: 18,
            borderRadius: 20,
            alignItems: 'center',
            marginTop: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
        },
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={dynamicStyles.header}>
                <Pressable onPress={() => router.back()} style={dynamicStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={dynamicStyles.headerTitle}>Add Instrument</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={dynamicStyles.label}>Instrument Name</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="e.g. Mosquito Forceps"
                        placeholderTextColor={theme.subtext}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={dynamicStyles.label}>Instrument Description</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="e.g. Curved, 5.5 inch"
                        placeholderTextColor={theme.subtext}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={dynamicStyles.label}>Quantity Bought</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="1"
                        placeholderTextColor={theme.subtext}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                    />
                </View>

                <Pressable
                    style={[dynamicStyles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Instrument'}</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#94A3B8',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
});
