import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInstrumentStore } from '../src/store/useInstrumentStore';
import { useThemeStore } from '../src/store/useThemeStore';
import { Colors } from '../src/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SET_ICONS = [
    'layers', 'medkit', 'bandage', 'flask', 'fitness', 'basket',
    'cube', 'briefcase', 'clipboard', 'shield-checkmark', 'heart',
    'thermometer', 'pulse', 'medical', 'construct'
];

export default function CreateSetScreen() {
    const router = useRouter();
    const { createSet } = useInstrumentStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('layers');
    const [loading, setLoading] = useState(false);

    const saveScale = useSharedValue(1);

    const animateScale = (scale: any, toValue: number) => {
        scale.value = withSpring(toValue, { damping: 10, stiffness: 200 });
    };

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter a set name');
            return;
        }

        setLoading(true);
        createSet(name, notes, selectedIcon);

        setTimeout(() => {
            setLoading(false);
            router.back();
        }, 300);
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
        mainIconCircle: {
            width: 100,
            height: 100,
            borderRadius: 32,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 10,
            borderWidth: 1,
            borderColor: theme.border,
        },
        selectionLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.subtext,
            marginBottom: 16,
        },
        gridIconBox: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.border,
        },
        gridIconBoxSelected: {
            borderColor: theme.tint,
            backgroundColor: theme.accent,
            borderWidth: 2,
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
                <Text style={dynamicStyles.headerTitle}>Create New Set</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconSelectionArea}>
                    <View style={dynamicStyles.mainIconCircle}>
                        <Ionicons name={selectedIcon as any} size={48} color={theme.text} />
                    </View>
                    <Text style={dynamicStyles.selectionLabel}>Choose an icon</Text>

                    <View style={styles.iconGrid}>
                        {SET_ICONS.map((icon) => (
                            <Pressable
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                style={[
                                    dynamicStyles.gridIconBox,
                                    selectedIcon === icon && dynamicStyles.gridIconBoxSelected
                                ]}
                            >
                                <Ionicons
                                    name={icon as any}
                                    size={20}
                                    color={selectedIcon === icon ? theme.text : theme.subtext}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={dynamicStyles.label}>Set Name</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="e.g. Major Laparotomy"
                        placeholderTextColor={theme.subtext}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={dynamicStyles.label}>Description</Text>
                    <TextInput
                        style={[dynamicStyles.input, styles.textArea]}
                        placeholder="What is this set for?"
                        placeholderTextColor={theme.subtext}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <AnimatedPressable
                    style={[
                        dynamicStyles.saveButton,
                        loading && styles.saveButtonDisabled,
                        useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }))
                    ]}
                    onPressIn={() => animateScale(saveScale, 0.96)}
                    onPressOut={() => animateScale(saveScale, 1)}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>{loading ? 'Creating...' : 'Create Set'}</Text>
                </AnimatedPressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    iconSelectionArea: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    textArea: {
        height: 100,
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
