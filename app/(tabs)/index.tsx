import { View, Text, ScrollView, Pressable, StyleSheet, Image, Alert, FlatList, Platform, StatusBar } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateCatalogPDF } from '../../src/services/pdfService';
import { useInstrumentStore, Instrument } from '../../src/store/useInstrumentStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../src/constants/theme';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Toast, { ToastHandle } from '../../src/components/Toast';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const router = useRouter();
  const { inventory, sets, addInstrumentToSet, toggleWishlist, reorderInventory, removeInstrument } = useInstrumentStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const trayY = useSharedValue(1000);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const toastRef = useRef<ToastHandle>(null);

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: trayY.value }]
  }));

  const addBtnScale = useSharedValue(1);
  const setBtnScale = useSharedValue(1);
  const pdfBtnScale = useSharedValue(1);

  const animateScale = (scale: any, toValue: number) => {
    scale.value = withSpring(toValue, { damping: 10, stiffness: 200 });
  };

  const getAnimatedStyle = (scale: any) => useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handleAddToSet = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    trayY.value = withSpring(0, { damping: 15 });
  };

  const closeTray = () => {
    trayY.value = withSpring(1000);
    setTimeout(() => setSelectedInstrument(null), 300);
  };

  const confirmAddToSet = (setId: string, setName: string) => {
    if (selectedInstrument) {
      addInstrumentToSet(setId, selectedInstrument.id, 1);
      closeTray();
      toastRef.current?.show(`Added to ${setName}`);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < inventory.length) {
      reorderInventory(index, newIndex);
    }
  };

  const handleDelete = (instrument: Instrument) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${instrument.name}?`)) {
        removeInstrument(instrument.id);
      }
    } else {
      Alert.alert(
        "Delete Instrument",
        `Are you sure you want to delete ${instrument.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => removeInstrument(instrument.id) }
        ]
      );
    }
  };

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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    searchBar: {
      margin: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accent,
      paddingHorizontal: 16,
      borderRadius: 16,
      height: 52,
    },
    searchText: {
      color: theme.subtext,
      marginLeft: 10,
      fontSize: 15,
    },
    actionText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '700',
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    listContainer: {
      backgroundColor: theme.card,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    instrumentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    rowSubtitle: {
      fontSize: 12,
      color: theme.subtext,
      marginTop: 2,
    },
    emptyBox: {
      padding: 30,
      backgroundColor: theme.card,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.border,
    },
    bottomTray: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 12,
      paddingHorizontal: 24,
      paddingBottom: 40,
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      zIndex: 1000,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.subtext,
      marginBottom: 20,
    },
    setOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.accent,
      marginBottom: 10,
    },
    setOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginLeft: 12,
    },
    setIconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    deleteButtonSmall: {
      padding: 8,
      backgroundColor: '#FEF2F2',
      borderRadius: 10,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.title}>SurgiSet</Text>
            <Text style={dynamicStyles.subtitle}>Manage your surgical inventory</Text>
          </View>
          <Pressable onPress={toggleTheme} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Image
              source={require('../../logo/GSS1.png')}
              style={[styles.logo, isDarkMode && { tintColor: 'white' }]}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* Global Search Trigger */}
        <Pressable
          onPress={() => router.push('/(tabs)/search')}
          style={dynamicStyles.searchBar}
        >
          <Ionicons name="search" size={20} color={theme.subtext} />
          <Text style={dynamicStyles.searchText}>Search instruments...</Text>
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.topActionsRow}>
            <AnimatedPressable
              style={[styles.actionButton, styles.addBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#334155' }, getAnimatedStyle(addBtnScale)]}
              onPressIn={() => animateScale(addBtnScale, 0.95)}
              onPressOut={() => animateScale(addBtnScale, 1)}
              onPress={() => router.push('/add-instrument')}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={dynamicStyles.actionText}>Add</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.actionButton, styles.setBtn, { backgroundColor: isDarkMode ? '#334155' : '#475569' }, getAnimatedStyle(setBtnScale)]}
              onPressIn={() => animateScale(setBtnScale, 0.95)}
              onPressOut={() => animateScale(setBtnScale, 1)}
              onPress={() => router.push('/create-set')}
            >
              <Ionicons name="layers-outline" size={24} color="white" />
              <Text style={dynamicStyles.actionText}>New Set</Text>
            </AnimatedPressable>
          </View>

          <AnimatedPressable
            style={[styles.actionButton, styles.fullWidthBtn, { backgroundColor: theme.primary }, getAnimatedStyle(pdfBtnScale)]}
            onPressIn={() => animateScale(pdfBtnScale, 0.98)}
            onPressOut={() => animateScale(pdfBtnScale, 1)}
            onPress={async () => {
              try {
                await generateCatalogPDF(inventory, sets);
              } catch (e) {
                console.error(e);
                Alert.alert("Error", "Could not export PDF");
              }
            }}
          >
            <View style={styles.fullWidthBtnContent}>
              <Ionicons name="document-text-outline" size={24} color="white" />
              <Text style={[dynamicStyles.actionText, { marginTop: 0, marginLeft: 12, fontSize: 16, fontWeight: '500' }]}>Export PDF Catalog</Text>
            </View>
          </AnimatedPressable>
        </View>

        {/* My Instruments Box */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>My Instruments ({inventory.filter(i => i.quantity > 0).length})</Text>

          {inventory.filter(i => i.quantity > 0).length === 0 ? (
            <View style={dynamicStyles.emptyBox}>
              <Text style={styles.emptyText}>No instruments available. Add some!</Text>
            </View>
          ) : (
            <View style={dynamicStyles.listContainer}>
              {inventory.filter(i => i.quantity > 0).map((item, index) => (
                <View
                  key={item.id}
                  style={[dynamicStyles.instrumentRow, item.isWishlist && styles.wishlistRow]}
                >
                  <View style={styles.sortControls}>
                    <Pressable onPress={() => moveItem(index, 'up')} hitSlop={5}>
                      <Ionicons name="caret-up" size={16} color={theme.subtext} />
                    </Pressable>
                    <Pressable onPress={() => moveItem(index, 'down')} hitSlop={5}>
                      <Ionicons name="caret-down" size={16} color={theme.subtext} />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.rowMainPressable}
                    onPress={() => handleAddToSet(item)}
                  >
                    <View style={styles.rowTextContainer}>
                      <Text style={[dynamicStyles.rowTitle, item.isWishlist && styles.wishlistText]} numberOfLines={1}>{item.name}</Text>
                      <Text style={dynamicStyles.rowSubtitle}>Qty: {item.quantity} {item.isWishlist ? ' (Wishlist)' : ''}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.rowActionsRight}>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => toggleWishlist(item.id)}
                    >
                      <Ionicons name={item.isWishlist ? "cart" : "briefcase-outline"} size={20} color={item.isWishlist ? theme.tint : theme.subtext} />
                    </Pressable>

                    <Pressable
                      style={dynamicStyles.deleteButtonSmall}
                      onPress={() => handleDelete(item)}
                    >
                      <Ionicons name="remove-circle-outline" size={20} color="#EF4444" />
                    </Pressable>

                    <Pressable
                      style={styles.editBtn}
                      onPress={() => router.push({ pathname: '/instrument/[id]', params: { id: item.id } })}
                    >
                      <Ionicons name="chevron-forward" size={18} color={theme.subtext} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Set Tray */}
      <Animated.View style={[dynamicStyles.bottomTray, trayStyle]}>
        <View style={styles.trayHandle} />
        <View>
          <Text style={dynamicStyles.modalTitle}>Add to Set</Text>
          <Text style={dynamicStyles.modalSubtitle}>Select target set for {selectedInstrument?.name}</Text>

          <FlatList
            data={sets}
            keyExtractor={(item) => item.id}
            style={styles.trayList}
            renderItem={({ item }) => (
              <Pressable
                style={dynamicStyles.setOption}
                onPress={() => confirmAddToSet(item.id, item.name)}
              >
                <View style={dynamicStyles.setIconBox}>
                  <Ionicons name={(item.icon || 'layers') as any} size={20} color={theme.text} />
                </View>
                <Text style={dynamicStyles.setOptionText}>{item.name}</Text>
              </Pressable>
            )}
          />

          <Pressable
            style={styles.closeTrayButton}
            onPress={closeTray}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Toast ref={toastRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtn: { backgroundColor: '#1E293B' },
  setBtn: { backgroundColor: '#334155', marginHorizontal: 10 },
  pdfBtn: { backgroundColor: '#475569' },
  fullWidthBtn: {
    width: '100%',
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidthBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  trayHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  trayList: {
    maxHeight: 300,
  },
  closeTrayButton: {
    marginTop: 10,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  sortControls: {
    flexDirection: 'column',
    marginRight: 10,
    alignItems: 'center',
    gap: 4,
  },
  rowMainPressable: {
    flex: 1,
    paddingVertical: 8,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginRight: 4,
  },
  editBtn: {
    padding: 8,
  },
  wishlistRow: {
    opacity: 0.6,
  },
  wishlistText: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  logo: {
    width: 120, // Slightly larger for better branding
    height: 60,
  }
});
