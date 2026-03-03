import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, BackHandler, StatusBar } from 'react-native';
import { requestLocationPermission } from '../../utils/locationPermission';
import { COLORS, FONTS } from '../../utlis/comon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

export default function LocationPermissionScreen({ onPermissionGranted }) {
    // Animation Shared Values
    const scale = useSharedValue(1);

    useEffect(() => {
        // Pulse Animation
        scale.value = withRepeat(
            withTiming(1.1, { duration: 1000, easing: Easing.ease }),
            -1,
            true
        );
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

    const askPermission = async () => {
        const granted = await requestLocationPermission();

        if (granted) {
            onPermissionGranted();
        } else {
            Alert.alert(
                'Permission Required',
                'Location access is mandatory to find nearby matches. Please enable it in settings.',
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
                        <Ionicons name="location" size={60} color={COLORS.white} />
                    </LinearGradient>
                </Animated.View>

                <Text style={styles.title}>Enable Location</Text>

                <Text style={styles.description}>
                    We need your location to show you nearby people and ensure a seamless experience.
                </Text>

                <TouchableOpacity style={styles.buttonWrapper} onPress={askPermission} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[COLORS.primary, '#fe909d']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.btnText}>Allow Location Access</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    Your location finds matches around you.
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
