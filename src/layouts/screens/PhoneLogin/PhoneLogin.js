import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Animated, Alert } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FloatingLabelInput = ({ label, value, onChangeText, error, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: (isFocused || value) ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        position: 'absolute',
        left: 0,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.grey, COLORS.grey],
        }),
        fontFamily: FONTS.RobotoRegular,
    };

    const borderColor = error ? 'red' : '#E0E0E0';

    return (
        <View style={styles.inputContainer}>
            <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: borderColor }}>
                <TextInput
                    {...props}
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    blurOnSubmit
                    keyboardType="phone-pad"
                    maxLength={10}
                />
            </View>
            {error && <Text style={styles.errorText}>Give correct phone number</Text>}
        </View>
    );
};

const PhoneLogin = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [error, setError] = useState(false);

    const handleGetOtp = () => {
        if (phoneNumber.length !== 10) {
            setError(true);
            return;
        }
        setError(false);
        navigation.navigate('OTPScreen');
    };

    return (
        <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: COLORS.white }}>
            <View style={styles.centerWrapper}>
                <Image
                    source={require('../../../assets/images/LyvBondLogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Login with Mobile Number</Text>


                {/* Mobile Input with Country Code */}
                <View style={[styles.phoneInputRow, { alignItems: error ? 'center' : 'flex-end' }]}>
                    <View style={[styles.countryCodeContainer, { marginBottom: error ? 20 : 0 }]}>
                        <Text style={styles.countryCodeText}>(+91) India</Text>
                        <Ionicons name="caret-down-outline" size={14} color={COLORS.grey} style={{ marginLeft: 5 }} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <FloatingLabelInput
                            label="Phone Number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                if (error) setError(false);
                            }}
                            error={error}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleGetOtp}
                >
                    <Text style={styles.loginButtonText}>Get OTP</Text>
                </TouchableOpacity>

            </View>

            <View style={styles.bottomWrapper}>
                <Text style={styles.bottomText}>
                    Don’t have an account?{' '}
                    <Text
                        style={styles.signupText}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        Signup free now
                    </Text>
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.white,
        paddingVertical: 60,
    },
    centerWrapper: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    title: {
        fontFamily: FONTS.RobotoBold,
        fontSize: 26,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontFamily: FONTS.RobotoRegular,
        fontSize: 16,
        color: COLORS.grey,
        textAlign: 'center',
        marginBottom: 50,
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end', // Align bottom borders
        marginBottom: 30
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 12, // Match input vertical padding
        // Removed fixed height
    },
    countryCodeText: {
        fontFamily: FONTS.RobotoRegular,
        fontSize: 16,
        color: COLORS.black,
    },
    inputContainer: {
        marginBottom: 0, // Handled by row
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontFamily: FONTS.RobotoRegular,
        fontSize: 16,
        color: COLORS.black,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20
    },
    loginButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.RobotoBold,
        fontSize: 18,
    },
    bottomWrapper: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: -20,
    },
    bottomText: {
        fontSize: 14,
        fontFamily: FONTS.RobotoRegular,
        color: COLORS.grey,
    },
    signupText: {
        color: COLORS.primary,
        fontFamily: FONTS.RobotoMedium,
    },
    logo: {
        width: 220,
        height: 150,
        alignSelf: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        fontFamily: FONTS.RobotoRegular,
    },
});

export default PhoneLogin;
