import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useState, useEffect, useRef } from 'react';
import { storage } from '../../src/utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInstrumentStore } from '../../src/store/useInstrumentStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../src/constants/theme';
import { searchCatalog, CatalogItem } from '../../src/services/catalogService';
import Toast, { ToastHandle } from '../../src/components/Toast';

const RECENT_SEARCHES_KEY = 'recent_searches';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CatalogItem[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const toastRef = useRef<ToastHandle>(null);
    const router = useRouter();
    const { addInstrument } = useInstrumentStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        try {
            const saved = await storage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load recent searches');
        }
    };

    const saveSearch = async (term: string) => {
        if (!term.trim()) return;
        const newSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newSearches);
        try {
            await storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
        } catch (e) {
            console.error('Failed to save recent search');
        }
    };

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            try {
                const searchResults = searchCatalog(query, 100);
                setResults(searchResults);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleAddToInventory = (item: CatalogItem) => {
        addInstrument({
            name: item.name,
            description: item.description,
            quantity: 1,
            image: item.image || undefined
        });
        saveSearch(item.name);
        toastRef.current?.show(`${item.name} added to inventory`);
    };

    const clearRecentSearches = async () => {
        setRecentSearches([]);
        await storage.removeItem(RECENT_SEARCHES_KEY);
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.accent,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
        },
        searchInput: {
            flex: 1,
            marginLeft: 8,
            fontSize: 16,
            color: theme.text,
            height: 40,
        },
        recentTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.subtext,
        },
        clearText: {
            fontSize: 12,
            color: theme.tint,
        },
        recentItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.accent,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginRight: 8,
            marginBottom: 8,
        },
        recentItemText: {
            marginLeft: 4,
            fontSize: 14,
            color: theme.text,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
            marginTop: 16,
        },
        emptySubtitle: {
            fontSize: 14,
            color: theme.subtext,
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 20,
        },
        createButton: {
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 99,
        }
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={dynamicStyles.header}>
                <View style={dynamicStyles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.subtext} />
                    <TextInput
                        style={dynamicStyles.searchInput}
                        placeholder="Search catalog..."
                        placeholderTextColor={theme.subtext}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={18} color={theme.subtext} />
                        </Pressable>
                    )}
                </View>
            </View>

            {query === '' && recentSearches.length > 0 && (
                <View style={styles.recentSection}>
                    <View style={styles.recentHeader}>
                        <Text style={dynamicStyles.recentTitle}>Recent Searches</Text>
                        <Pressable onPress={clearRecentSearches}>
                            <Text style={dynamicStyles.clearText}>Clear</Text>
                        </Pressable>
                    </View>
                    <View style={styles.recentList}>
                        {recentSearches.map((term, index) => (
                            <Pressable
                                key={index}
                                style={dynamicStyles.recentItem}
                                onPress={() => setQuery(term)}
                            >
                                <Ionicons name="time-outline" size={16} color={theme.subtext} />
                                <Text style={dynamicStyles.recentItemText}>{term}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}

            <FlatList
                data={results}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => <SearchItem item={item} onAdd={handleAddToInventory} theme={theme} isDarkMode={isDarkMode} />}
                ListHeaderComponent={query === '' && recentSearches.length > 0 ? null : (
                    query === '' ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={64} color={theme.border} />
                            <Text style={dynamicStyles.emptyTitle}>Start searching</Text>
                            <Text style={dynamicStyles.emptySubtitle}>Find your surgical instruments by name or category.</Text>
                        </View>
                    ) : null
                )}
                ListEmptyComponent={
                    query !== '' ? (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: theme.subtext }]}>Instrument not in catalog?</Text>
                            <Pressable
                                style={dynamicStyles.createButton}
                                onPress={() => router.push('/add-instrument')}
                            >
                                <Text style={styles.createButtonText}>Add Manually</Text>
                            </Pressable>
                        </View>
                    ) : null
                }
            />
            <Toast ref={toastRef} />
        </SafeAreaView>
    );
}

function SearchItem({ item, onAdd, theme, isDarkMode }: { item: CatalogItem, onAdd: (item: CatalogItem) => void, theme: any, isDarkMode: boolean }) {
    const scale = useSharedValue(1);
    const [isAdded, setIsAdded] = useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePress = () => {
        scale.value = withSequence(
            withSpring(1.05),
            withSpring(1)
        );
        setIsAdded(true);
        onAdd(item);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const itemStyles = StyleSheet.create({
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isAdded ? theme.tint : theme.border,
        },
        avatar: {
            width: 60,
            height: 60,
            backgroundColor: theme.background,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
        },
        itemName: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        itemCategory: {
            fontSize: 14,
            color: theme.subtext,
        },
        addButton: {
            backgroundColor: theme.background,
            padding: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
        },
        addedBadge: {
            backgroundColor: theme.tint,
            borderColor: theme.tint,
        },
    });

    return (
        <Animated.View style={[styles.listItemContainer, animatedStyle]}>
            <Pressable
                style={[itemStyles.listItem, isAdded && { backgroundColor: theme.accent }]}
                onPress={handlePress}
            >
                <View style={itemStyles.avatar}>
                    <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 18 }}>{item.name[0]}</Text>
                </View>
                <View style={styles.itemDetails}>
                    <Text style={itemStyles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={itemStyles.itemCategory} numberOfLines={2}>{item.description}</Text>
                </View>
                <View style={[itemStyles.addButton, isAdded && itemStyles.addedBadge]}>
                    <Ionicons
                        name={isAdded ? "checkmark" : "add"}
                        size={20}
                        color={isAdded ? "white" : theme.tint}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
    },
    listItemContainer: {
        marginBottom: 8,
    },
    itemDetails: {
        flex: 1,
    },
    emptyState: {
        marginTop: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginBottom: 16,
    },
    createButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    recentSection: {
        padding: 16,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recentList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
