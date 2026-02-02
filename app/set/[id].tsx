import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Image, Platform, Modal, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInstrumentStore } from '../../src/store/useInstrumentStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../src/constants/theme';

export default function SetDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { sets, inventory, removeInstrumentFromSet, deleteSet, updateSet, reorderSetInstruments, toggleWishlist } = useInstrumentStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? Colors.dark : Colors.light;
    const [isEditingIcon, setIsEditingIcon] = useState(false);

    const SET_ICONS = [
        'layers', 'medkit', 'bandage', 'flask', 'fitness', 'basket',
        'cube', 'briefcase', 'clipboard', 'shield-checkmark', 'heart',
        'thermometer', 'pulse', 'medical', 'construct'
    ];

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
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
            maxWidth: '70%',
        },
        backButton: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: theme.accent,
        },
        banner: {
            alignItems: 'center',
            marginBottom: 32,
            backgroundColor: theme.card,
            padding: 32,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
            borderWidth: 1,
            borderColor: theme.border,
        },
        iconBox: {
            width: 72,
            height: 72,
            backgroundColor: theme.accent,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        setTitle: {
            fontSize: 24,
            fontWeight: '800',
            color: theme.text,
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: -0.5,
        },
        setNotes: {
            fontSize: 15,
            color: theme.subtext,
            textAlign: 'center',
            lineHeight: 22,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
        },
        list: {
            backgroundColor: theme.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
        },
        listItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        itemName: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        itemCategory: {
            fontSize: 13,
            color: theme.subtext,
            marginTop: 2,
        },
        qtyBadge: {
            backgroundColor: theme.accent,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            marginRight: 10,
        },
        qtyText: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
        },
        deleteButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
            padding: 18,
            borderRadius: 16,
            backgroundColor: '#FEF2F2',
        },
        pickerContainer: {
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 340,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
        },
        pickerTitle: {
            fontSize: 18,
            fontWeight: '800',
            color: theme.text,
            marginBottom: 20,
        },
        gridIconBox: {
            width: 54,
            height: 54,
            borderRadius: 16,
            backgroundColor: theme.background,
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
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 16,
        }
    });

    const currentSet = sets.find(s => s.id === id);

    if (!currentSet) {
        return (
            <SafeAreaView style={dynamicStyles.container}>
                <View style={dynamicStyles.header}>
                    <Pressable onPress={() => router.back()} style={dynamicStyles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </Pressable>
                    <Text style={dynamicStyles.headerTitle}>Set Not Found</Text>
                </View>
                <View style={dynamicStyles.emptyContainer}>
                    <Text style={[dynamicStyles.emptyText, { color: theme.subtext }]}>This set no longer exists.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleDeleteSet = () => {
        const performDelete = () => {
            deleteSet(currentSet.id);
            router.back();
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this set? All instruments will be returned to inventory.")) {
                performDelete();
            }
        } else {
            Alert.alert(
                "Delete Set",
                "Are you sure you want to delete this set? All instruments will be returned to inventory.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: performDelete }
                ]
            );
        }
    };

    const handleRemoveInstrument = (instrumentId: string, name: string) => {
        const performRemove = () => removeInstrumentFromSet(currentSet.id, instrumentId, 1);

        if (Platform.OS === 'web') {
            if (window.confirm(`Remove 1 ${name} from this set?`)) {
                performRemove();
            }
        } else {
            Alert.alert(
                "Remove Instrument",
                `Remove 1 ${name} from this set?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", onPress: performRemove }
                ]
            );
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < currentSet.instruments.length) {
            reorderSetInstruments(currentSet.id, index, newIndex);
        }
    };

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={dynamicStyles.header}>
                <Pressable onPress={() => router.back()} style={dynamicStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={dynamicStyles.headerTitle} numberOfLines={1}>{currentSet.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={dynamicStyles.banner}>
                    <Pressable
                        style={dynamicStyles.iconBox}
                        onPress={() => setIsEditingIcon(true)}
                    >
                        <Ionicons name={(currentSet.icon || 'layers') as any} size={32} color={theme.text} />
                        <View style={[styles.editBadge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
                            <Ionicons name="pencil" size={10} color="white" />
                        </View>
                    </Pressable>
                    <Text style={dynamicStyles.setTitle}>{currentSet.name}</Text>
                    {currentSet.description ? <Text style={dynamicStyles.setNotes}>{currentSet.description}</Text> : null}
                </View>

                {/* Icon Picker Modal */}
                <Modal
                    visible={isEditingIcon}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsEditingIcon(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setIsEditingIcon(false)}
                    >
                        <Animated.View
                            entering={ZoomIn}
                            exiting={FadeOut}
                            style={dynamicStyles.pickerContainer}
                        >
                            <Text style={dynamicStyles.pickerTitle}>Select Set Icon</Text>
                            <View style={styles.iconGrid}>
                                {SET_ICONS.map((icon) => (
                                    <Pressable
                                        key={icon}
                                        onPress={() => {
                                            updateSet(currentSet.id, { icon });
                                            setIsEditingIcon(false);
                                        }}
                                        style={[
                                            dynamicStyles.gridIconBox,
                                            currentSet.icon === icon && dynamicStyles.gridIconBoxSelected
                                        ]}
                                    >
                                        <Ionicons
                                            name={icon as any}
                                            size={24}
                                            color={currentSet.icon === icon ? theme.text : theme.subtext}
                                        />
                                    </Pressable>
                                ))}
                            </View>
                        </Animated.View>
                    </Pressable>
                </Modal>

                <View style={styles.sectionHeader}>
                    <Text style={dynamicStyles.sectionTitle}>Instruments ({currentSet.instruments.reduce((acc, curr) => acc + curr.quantity, 0)})</Text>
                    <Pressable style={[styles.addButtonSmall, { backgroundColor: theme.primary }]} onPress={() => router.push('/')}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </Pressable>
                </View>

                <View style={dynamicStyles.list}>
                    {currentSet.instruments.length === 0 ? (
                        <View style={styles.emptyItem}>
                            <Text style={[styles.emptyItemText, { color: theme.subtext }]}>No instruments in this set yet.</Text>
                        </View>
                    ) : (
                        currentSet.instruments.map((si, index) => {
                            const instrument = inventory.find(i => i.id === si.instrumentId);
                            const isWishlist = instrument?.isWishlist;

                            return (
                                <View key={si.instrumentId} style={[dynamicStyles.listItem, index === currentSet.instruments.length - 1 && styles.lastItem, isWishlist && styles.wishlistRow]}>
                                    <View style={styles.sortControls}>
                                        <Pressable onPress={() => moveItem(index, 'up')} hitSlop={5}>
                                            <Ionicons name="caret-up" size={16} color={theme.subtext} />
                                        </Pressable>
                                        <Pressable onPress={() => moveItem(index, 'down')} hitSlop={5}>
                                            <Ionicons name="caret-down" size={16} color={theme.subtext} />
                                        </Pressable>
                                    </View>

                                    <View style={styles.itemInfo}>
                                        <Text style={[dynamicStyles.itemName, isWishlist && styles.wishlistText]}>{instrument?.name || 'Unknown Instrument'}</Text>
                                        <Text style={dynamicStyles.itemCategory}>{instrument?.description || ''} {isWishlist ? '(Wishlist)' : ''}</Text>
                                    </View>

                                    <View style={styles.listItemActions}>
                                        <Pressable onPress={() => toggleWishlist(si.instrumentId)} style={styles.iconBtn}>
                                            <Ionicons name={isWishlist ? "cart" : "briefcase-outline"} size={20} color={isWishlist ? theme.tint : theme.subtext} />
                                        </Pressable>

                                        <View style={dynamicStyles.qtyBadge}>
                                            <Text style={dynamicStyles.qtyText}>x{si.quantity}</Text>
                                        </View>
                                        <Pressable
                                            onPress={() => handleRemoveInstrument(si.instrumentId, instrument?.name || 'Instrument')}
                                            style={styles.removeIcon}
                                        >
                                            <Ionicons name="remove-circle-outline" size={22} color="#EF4444" />
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <Pressable style={dynamicStyles.deleteButton} onPress={handleDeleteSet}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.deleteText}>Delete Set</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButtonSmall: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    itemInfo: {
        flex: 1,
    },
    listItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeIcon: {
        padding: 4,
    },
    emptyItem: {
        padding: 32,
        alignItems: 'center',
    },
    emptyItemText: {
        fontStyle: 'italic',
    },
    deleteText: {
        color: '#EF4444',
        fontWeight: '700',
        marginLeft: 8,
    },
    sortControls: {
        flexDirection: 'column',
        marginRight: 12,
        alignItems: 'center',
        gap: 4,
    },
    wishlistRow: {
        opacity: 0.7,
    },
    wishlistText: {
        fontStyle: 'italic',
    },
    iconBtn: {
        padding: 4,
        marginRight: 8,
    },
    editBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
});
