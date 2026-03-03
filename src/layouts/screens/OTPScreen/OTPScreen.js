import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, TextInput, Animated, Easing } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

const OTPScreen = ({ navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = [];

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputs[index + 1].focus();
        }
    };

    const [timer, setTimer] = useState(20);
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        const startRotation = () => {
            Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };

        if (timer > 0) {
            startRotation();
        } else {
            rotation.stopAnimation();
            rotation.setValue(0);
        }
    }, [timer]);

    const handleResend = () => {
        setTimer(20);
        // Add resend logic here
    };

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handleBackspace = (key, index) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs[index - 1].focus();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forgot Password</Text>
            </View>

            {/* Notification Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerText}>
                    OTP has been sent to your registered email and mobile number
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Enter OTP</Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                            ref={(input) => { inputs[index] = input; }}
                            value={digit}
                        />
                    ))}
                </View>

                {/* <View style={styles.autoReadContainer}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="reload" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
                    </Animated.View>
                    <Text style={styles.autoReadText}>Auto-reading OTP</Text>
                </View> */}

            </View>

            {/* Footer */}
            <View style={styles.footer}>
                {timer > 0 ? (
                    <Text style={styles.resendText}>You can resend OTP in {timer} secs</Text>
                ) : (
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={[styles.resendText, { color: COLORS.primary, fontWeight: 'bold' }]}>Resend OTP</Text>
                    </TouchableOpacity>
                )}
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.primary,
        height: 60 + (Platform.OS === 'android' ? (StatusBar.currentHeight || 35) : 0),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 35) : 0,
        elevation: 4,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontFamily: FONTS.RobotoMedium,
        fontSize: 18,
        color: COLORS.white,
    },
    banner: {
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerText: {
        fontFamily: FONTS.RobotoRegular,
        fontSize: 13,
        color: '#555',
        flex: 1,
        marginRight: 10,
        lineHeight: 18,
    },
    editButton: {
        color: COLORS.primary,
        fontFamily: FONTS.RobotoBold,
        fontSize: 14,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
    },
    title: {
        fontFamily: FONTS.RobotoMedium,
        fontSize: 24,
        color: '#333',
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 30,
    },
    otpInput: {
        borderBottomWidth: 2,
        borderBottomColor: '#E0E0E0',
        width: 40,
        height: 50,
        fontSize: 24,
        textAlign: 'center',
        color: '#333',
        fontFamily: FONTS.RobotoBold,
    },
    autoReadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    autoReadText: {
        fontFamily: FONTS.RobotoRegular,
        color: '#333',
        fontSize: 14,
    },
    footer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    resendText: {
        color: COLORS.grey,
        fontFamily: FONTS.RobotoRegular,
        fontSize: 14,
        marginBottom: 15,
    },
});

export default OTPScreen;
