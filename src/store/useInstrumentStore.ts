import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';

export interface Instrument {
    id: string;
    name: string;
    description: string;
    image?: string;
    quantity: number;
    isWishlist?: boolean;
}

export interface SetInstrument {
    instrumentId: string;
    quantity: number;
}

export interface Set {
    id: string;
    name: string;
    description: string;
    icon?: string;
    instruments: SetInstrument[];
}

interface InstrumentStore {
    inventory: Instrument[];
    sets: Set[];
    addInstrument: (instrument: Omit<Instrument, 'id'>) => void;
    createSet: (name: string, description: string, icon?: string) => void;
    updateSet: (setId: string, updates: Partial<Set>) => void;
    addInstrumentToSet: (setId: string, instrumentId: string, quantity: number) => void;
    removeInstrumentFromSet: (setId: string, instrumentId: string, quantity: number) => void;
    deleteSet: (setId: string) => void;
    returnAllToInventory: (setId: string) => void;
    removeInstrument: (id: string) => void;
    updateInstrument: (id: string, updates: Partial<Instrument>) => void;
    toggleWishlist: (id: string) => void;
    reorderInventory: (fromIndex: number, toIndex: number) => void;
    reorderSetInstruments: (setId: string, fromIndex: number, toIndex: number) => void;
}

export const useInstrumentStore = create<InstrumentStore>()(
    persist(
        (set) => ({
            inventory: [],
            sets: [
                { id: '1', name: 'Rhinoplasty Set 1', description: 'Standard open rhino set', instruments: [] },
                { id: '2', name: 'Basic Suturing', description: 'For minor lacerations', instruments: [] },
            ],

            addInstrument: (newInstrument) => set((state) => {
                const quantity = newInstrument.quantity || 1;
                const newEntries = Array.from({ length: quantity }).map(() => ({
                    ...newInstrument,
                    id: Math.random().toString(36).substr(2, 9),
                    quantity: 1
                }));
                return {
                    inventory: [...state.inventory, ...newEntries]
                };
            }),

            createSet: (name, description, icon) => set((state) => ({
                sets: [...state.sets, {
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    description,
                    icon: icon || 'layers',
                    instruments: []
                }]
            })),

            updateSet: (setId, updates) => set((state) => ({
                sets: state.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
            })),

            addInstrumentToSet: (setId: string, instrumentId: string, quantityToMove: number) => set((state) => {
                const instrument = state.inventory.find(i => i.id === instrumentId);
                if (!instrument || instrument.quantity < quantityToMove) return state;

                // Update inventory
                const newInventory = state.inventory.map(i => {
                    if (i.id === instrumentId) {
                        return { ...i, quantity: i.quantity - quantityToMove };
                    }
                    return i;
                });
                // Actually, usually you might want to keep it even if quantity is 0? 
                // The prompt says "once removed, these instruments show in the Purchased instruments folder".
                // Let's keep them in inventory but track quantity.

                // Update set
                const newSets = state.sets.map(s => {
                    if (s.id === setId) {
                        const existingInstrumentIndex = s.instruments.findIndex(si => si.instrumentId === instrumentId);
                        let newSetInstruments = [...s.instruments];

                        if (existingInstrumentIndex > -1) {
                            newSetInstruments[existingInstrumentIndex] = {
                                ...newSetInstruments[existingInstrumentIndex],
                                quantity: newSetInstruments[existingInstrumentIndex].quantity + quantityToMove
                            };
                        } else {
                            newSetInstruments.push({ instrumentId, quantity: quantityToMove });
                        }

                        return { ...s, instruments: newSetInstruments };
                    }
                    return s;
                });

                return { inventory: newInventory, sets: newSets };
            }),

            removeInstrumentFromSet: (setId: string, instrumentId: string, quantityToRemove: number) => set((state) => {
                const setToUpdate = state.sets.find(s => s.id === setId);
                if (!setToUpdate) return state;

                const setInstrument = setToUpdate.instruments.find(si => si.instrumentId === instrumentId);
                if (!setInstrument || setInstrument.quantity < quantityToRemove) return state;

                // Update set
                const newSets = state.sets.map(s => {
                    if (s.id === setId) {
                        const newSetInstruments = s.instruments.map(si => {
                            if (si.instrumentId === instrumentId) {
                                return { ...si, quantity: si.quantity - quantityToRemove };
                            }
                            return si;
                        }).filter(si => si.quantity > 0);
                        return { ...s, instruments: newSetInstruments };
                    }
                    return s;
                });

                // Update inventory (return to purchased instruments)
                const existingInventoryItem = state.inventory.find(i => i.id === instrumentId);
                let newInventory = [...state.inventory];

                if (existingInventoryItem) {
                    newInventory = newInventory.map(i => {
                        if (i.id === instrumentId) {
                            return { ...i, quantity: i.quantity + quantityToRemove };
                        }
                        return i;
                    });
                }

                return { inventory: newInventory, sets: newSets };
            }),

            returnAllToInventory: (setId: string) => set((state) => {
                const setToReturn = state.sets.find(s => s.id === setId);
                if (!setToReturn) return state;

                let newInventory = [...state.inventory];
                setToReturn.instruments.forEach(si => {
                    const existingItem = newInventory.find(i => i.id === si.instrumentId);
                    if (existingItem) {
                        newInventory = newInventory.map(i =>
                            i.id === si.instrumentId ? { ...i, quantity: i.quantity + si.quantity } : i
                        );
                    }
                });

                const newSets = state.sets.map(s =>
                    s.id === setId ? { ...s, instruments: [] } : s
                );

                return { inventory: newInventory, sets: newSets };
            }),

            deleteSet: (setId) => set((state) => {
                const setToDelete = state.sets.find(s => s.id === setId);
                if (!setToDelete) return state;

                // Automatically return items when deleting set
                let newInventory = [...state.inventory];
                setToDelete.instruments.forEach(si => {
                    newInventory = newInventory.map(i =>
                        i.id === si.instrumentId ? { ...i, quantity: i.quantity + si.quantity } : i
                    );
                });

                return {
                    inventory: newInventory,
                    sets: state.sets.filter(s => s.id !== setId)
                };
            }),

            removeInstrument: (id) => set((state) => ({
                inventory: state.inventory.filter(i => i.id !== id),
                // Also remove from any sets?
                sets: state.sets.map(s => ({
                    ...s,
                    instruments: s.instruments.filter(si => si.instrumentId !== id)
                }))
            })),

            updateInstrument: (id, updates) => set((state) => ({
                inventory: state.inventory.map(i =>
                    i.id === id ? { ...i, ...updates, quantity: updates.quantity ? Math.min(updates.quantity, 1) : i.quantity } : i
                )
            })),

            toggleWishlist: (id) => set((state) => ({
                inventory: state.inventory.map(i =>
                    i.id === id ? { ...i, isWishlist: !i.isWishlist } : i
                )
            })),

            reorderInventory: (fromIndex, toIndex) => set((state) => {
                const newInventory = [...state.inventory];
                const [movedItem] = newInventory.splice(fromIndex, 1);
                newInventory.splice(toIndex, 0, movedItem);
                return { inventory: newInventory };
            }),

            reorderSetInstruments: (setId, fromIndex, toIndex) => set((state) => {
                const newSets = state.sets.map(s => {
                    if (s.id === setId) {
                        const newInstruments = [...s.instruments];
                        const [movedItem] = newInstruments.splice(fromIndex, 1);
                        newInstruments.splice(toIndex, 0, movedItem);
                        return { ...s, instruments: newInstruments };
                    }
                    return s;
                });
                return { sets: newSets };
            })
        }),
        {
            name: 'instrument-storage',
            storage: createJSONStorage(() => storage),
        }
    )
);
