import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, BackHandler, StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { COLORS, FONTS } from '../../utlis/comon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const REQUIRED_PERMISSIONS = Platform.select({
    ios: [
        { id: 'LOCATION', permission: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, name: 'Location' },
        { id: 'CAMERA', permission: PERMISSIONS.IOS.CAMERA, name: 'Camera' },
        { id: 'MICROPHONE', permission: PERMISSIONS.IOS.MICROPHONE, name: 'Microphone' },
        // iOS Push Notification permission is usually handled by @react-native-firebase/messaging or @notifee/react-native
    ],
    android: [
        { id: 'LOCATION', permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, name: 'Location' },
        { id: 'CAMERA', permission: PermissionsAndroid.PERMISSIONS.CAMERA, name: 'Camera' },
        { id: 'MICROPHONE', permission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, name: 'Microphone' },
        // Notifications for Android 13+
        ...(Platform.Version >= 33 ? [{ id: 'NOTIFICATIONS', permission: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, name: 'Notifications' }] : []),
    ]
});

export default function AppPermissionsScreen({ onAllPermissionsGranted }) {
    const [currentPermissionIndex, setCurrentPermissionIndex] = useState(0);
    const [allGranted, setAllGranted] = useState(false);

    // Animation Shared Values
    const scale = useSharedValue(1);

    useEffect(() => {
        // Pulse Animation
        scale.value = withRepeat(
            withTiming(1.1, { duration: 1000, easing: Easing.ease }),
            -1,
            true
        );
        checkAllPermissions();
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    // Block Back Button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => true // disable back
        );
        return () => backHandler.remove();
    }, []);

    const checkAllPermissions = async () => {
        let allGrantedSoFar = true;

        for (let i = 0; i < REQUIRED_PERMISSIONS.length; i++) {
            const item = REQUIRED_PERMISSIONS[i];
            let isGranted = false;

            if (Platform.OS === 'android') {
                isGranted = await PermissionsAndroid.check(item.permission);
            } else {
                const result = await check(item.permission);
                isGranted = (result === RESULTS.GRANTED);
            }

            if (!isGranted) {
                setCurrentPermissionIndex(i);
                allGrantedSoFar = false;
                break;
            }
        }

        if (allGrantedSoFar) {
            setAllGranted(true);
            onAllPermissionsGranted();
        }
    };

    const askPermissionsOneByOne = async () => {
        for (let i = currentPermissionIndex; i < REQUIRED_PERMISSIONS.length; i++) {
            const item = REQUIRED_PERMISSIONS[i];
            setCurrentPermissionIndex(i);

            let granted = false;

            if (Platform.OS === 'android') {
                try {
                    const result = await PermissionsAndroid.request(item.permission);
                    granted = (result === PermissionsAndroid.RESULTS.GRANTED);
                } catch (err) {
                    console.warn(err);
                }
            } else {
                const result = await request(item.permission);
                granted = (result === RESULTS.GRANTED);
            }

            if (!granted) {
                Alert.alert(
                    `${item.name} Permission Required`,
                    `LyvBond requires access to your ${item.name} to function properly. Please enable it in settings.`,
                    [
                        {
                            text: 'Open Settings',
                            onPress: () => Linking.openSettings(),
                        },
                        {
                            text: "Cancel",
                            style: "cancel"
                        }
                    ],
                    { cancelable: false }
                );
                return; // Stop the loop if they deny one, wait for them to click "Allow" again or go to settings
            }
        }

        // If it got through everything
        setAllGranted(true);
        onAllPermissionsGranted();
    };

    const currentItem = REQUIRED_PERMISSIONS[currentPermissionIndex] || REQUIRED_PERMISSIONS[0];

    const getIconName = (id) => {
        switch (id) {
            case 'LOCATION': return 'location';
            case 'CAMERA': return 'camera';
            case 'MICROPHONE': return 'mic';
            case 'NOTIFICATIONS': return 'notifications';
            default: return 'settings';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.purpleAccent]}
                        style={styles.gradientCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name={getIconName(currentItem.id)} size={60} color={COLORS.white} />
                    </LinearGradient>
                </Animated.View>

                <Text style={styles.title}>Enable {currentItem.name}</Text>

                <Text style={styles.description}>
                    We need your {currentItem.name.toLowerCase()} permission to ensure a seamless dating experience.
                </Text>

                <TouchableOpacity style={styles.buttonWrapper} onPress={askPermissionsOneByOne} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[COLORS.primary, '#fe909d']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.btnText}>Allow {currentItem.name}</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    You will be prompted to allow each required permission one by one.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    gradientCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: FONTS.RobotoBold,
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        fontFamily: FONTS.RobotoRegular,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 50,
        paddingHorizontal: 10,
    },
    buttonWrapper: {
        width: '100%',
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    gradientButton: {
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
    },
    footerText: {
        marginTop: 30,
        fontSize: 13,
        fontFamily: FONTS.RobotoRegular,
        color: '#999',
        textAlign: 'center',
    }
});
