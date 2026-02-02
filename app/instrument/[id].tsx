import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInstrumentStore } from '../../src/store/useInstrumentStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../src/constants/theme';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InstrumentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { inventory, updateInstrument, removeInstrument } = useInstrumentStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.text,
        },
        saveBtn: {
            backgroundColor: theme.accent,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
        },
        saveText: {
            color: theme.tint,
            fontWeight: '700',
            fontSize: 15,
        },
        formGroup: {
            marginBottom: 24,
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.subtext,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
        },
        input: {
            fontSize: 17,
            color: theme.text,
            fontWeight: '500',
            paddingVertical: 4,
        },
        deleteButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            padding: 18,
            backgroundColor: '#FFF1F2',
            borderRadius: 20,
        },
        backButton: {
            marginTop: 16,
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.accent,
        },
        center: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    const instrument = inventory.find(i => i.id === id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (instrument) {
            setName(instrument.name);
            setDescription(instrument.description || '');
        }
    }, [instrument]);

    if (!instrument) {
        return (
            <SafeAreaView style={dynamicStyles.container}>
                <View style={dynamicStyles.center}>
                    <Text style={{ color: theme.text }}>Instrument not found</Text>
                    <Pressable onPress={() => router.back()} style={dynamicStyles.backButton}>
                        <Text style={{ color: theme.text, fontWeight: '600' }}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const handleSave = () => {
        updateInstrument(instrument.id, {
            name,
            description
        });
        router.back();
    };

    const handleDelete = () => {
        const performDelete = () => {
            removeInstrument(instrument.id);
            router.back();
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this instrument?")) {
                performDelete();
            }
        } else {
            Alert.alert(
                "Delete Instrument",
                "Are you sure you want to delete this instrument?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: performDelete }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={dynamicStyles.header}>
                <Pressable onPress={() => router.back()} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </Pressable>
                <Text style={dynamicStyles.headerTitle}>Edit Instrument</Text>
                <Pressable onPress={handleSave} style={dynamicStyles.saveBtn}>
                    <Text style={dynamicStyles.saveText}>Done</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Name</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Instrument Name"
                        placeholderTextColor={theme.subtext}
                    />
                </View>

                <View style={dynamicStyles.formGroup}>
                    <Text style={dynamicStyles.label}>Description</Text>
                    <TextInput
                        style={[dynamicStyles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add details..."
                        placeholderTextColor={theme.subtext}
                        multiline
                    />
                </View>

                <Pressable onPress={handleDelete} style={dynamicStyles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.deleteText}>Delete Instrument</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    navButton: {
        padding: 4,
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },
    textArea: {
        minHeight: 80,
    },
    deleteText: {
        color: '#EF4444',
        fontWeight: '700',
        marginLeft: 8,
    },
});
