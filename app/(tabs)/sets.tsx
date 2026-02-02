import { View, Text, FlatList, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInstrumentStore } from '../../src/store/useInstrumentStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../src/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SetCard({ item, onPress, theme }: { item: any; onPress: () => void; theme: any }) {
    const scale = useSharedValue(1);
    const itemCount = item.instruments.reduce((acc: number, curr: any) => acc + curr.quantity, 0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const animateScale = (toValue: number) => {
        scale.value = withSpring(toValue, { damping: 10, stiffness: 200 });
    };

    const cardStyles = StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
        },
        cardIconBox: {
            width: 48,
            height: 48,
            backgroundColor: theme.accent,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        cardTitle: {
            fontSize: 17,
            fontWeight: '700',
            color: theme.text,
        },
        cardSubtitle: {
            fontSize: 13,
            color: theme.subtext,
            marginTop: 2,
        },
    });

    return (
        <AnimatedPressable
            style={[cardStyles.card, animatedStyle]}
            onPressIn={() => animateScale(0.98)}
            onPressOut={() => animateScale(1)}
            onPress={onPress}
        >
            <View style={cardStyles.cardIconBox}>
                <Ionicons name={(item.icon || 'layers') as any} size={24} color={theme.text} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={cardStyles.cardTitle}>{item.name}</Text>
                <Text style={cardStyles.cardSubtitle}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} • {item.description || 'General'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.subtext} />
        </AnimatedPressable>
    );
}

export default function SetsScreen() {
    const router = useRouter();
    const { sets } = useInstrumentStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? Colors.dark : Colors.light;

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 20,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.text,
            letterSpacing: -0.5,
        },
        subtitle: {
            fontSize: 14,
            color: theme.subtext,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '800',
            color: theme.text,
        },
        emptySubtitle: {
            fontSize: 15,
            color: theme.subtext,
            textAlign: 'center',
            marginTop: 10,
            lineHeight: 22,
        },
        createButton: {
            marginTop: 24,
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 16,
        },
        fab: {
            position: 'absolute',
            bottom: 24,
            right: 24,
            backgroundColor: theme.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
        },
        emptyIconCircle: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.border,
        },
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.title}>Sets</Text>
                <Text style={dynamicStyles.subtitle}>{sets.length} surgical collections</Text>
            </View>

            <FlatList
                data={sets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <SetCard
                        item={item}
                        theme={theme}
                        onPress={() => router.push({ pathname: '/set/[id]', params: { id: item.id } })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={dynamicStyles.emptyIconCircle}>
                            <Ionicons name="layers-outline" size={48} color={theme.subtext} />
                        </View>
                        <Text style={dynamicStyles.emptyTitle}>No Sets Yet</Text>
                        <Text style={dynamicStyles.emptySubtitle}>Start grouping your surgical instruments into procedural sets.</Text>
                        <Pressable
                            style={dynamicStyles.createButton}
                            onPress={() => router.push('/create-set')}
                        >
                            <Text style={styles.createButtonText}>Create Your First Set</Text>
                        </Pressable>
                    </View>
                }
            />

            <Pressable
                style={dynamicStyles.fab}
                onPress={() => router.push('/create-set')}
            >
                <Ionicons name="add" size={28} color="white" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    cardInfo: {
        flex: 1,
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    createButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});
