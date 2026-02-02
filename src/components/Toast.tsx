import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ToastHandle {
    show: (message: string, type?: 'success' | 'error') => void;
}

const Toast = forwardRef<ToastHandle, {}>((props, ref) => {
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const opacity = useState(new Animated.Value(0))[0];

    useImperativeHandle(ref, () => ({
        show: (msg, type = 'success') => {
            setMessage(msg);
            setIsVisible(true);
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsVisible(false));
        },
    }));

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <View style={styles.content}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        backgroundColor: '#4a90e2',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    text: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
});

export default Toast;
