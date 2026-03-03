import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Animated, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import LoginOptionButton from '../../components/CommonComponents/LoginOptionButton';
import { useAuth } from '../../../context/AuthContext';

const FloatingLabelInput = ({ label, value, onChangeText, secureTextEntry, isPassword, onTogglePassword, passwordVisible, ...props }) => {
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
            outputRange: [COLORS.grey, COLORS.grey], // Can change active color if needed
        }),
        fontFamily: FONTS.RobotoRegular,
    };

    return (
        <View style={styles.inputContainer}>
            <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
                <TextInput
                    {...props}
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={secureTextEntry}
                    blurOnSubmit
                />
                {isPassword && (
                    <TouchableOpacity onPress={onTogglePassword} style={styles.showButton}>
                        <Text style={styles.showText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const EmailLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { login, isLoading } = useAuth(); // Use Global Auth Context

    const handleLogin = async () => {
        // Simple client-side validation
        if (!email || !password) {
            // Optionally show an alert or error message
            console.log("Email/Phone and password cannot be empty.");
            return;
        }

        // Check if input is phone or email for basic formatting if needed, 
        // but backend handles both. Assuming user puts one or the other in 'email' field.
        // We will pass the 'email' state value as 'email' prop to login if it looks like email, 
        // or 'phoneNumber' if it looks like phone?
        // Or simpler: pass both, let backend decide, or just pass as email for now if we don't distinguish UI.
        // Based on backend: login({ email, phoneNumber, password })

        let isPhone = /^\d+$/.test(email);

        // API INTEGRATED: AuthContext `login` function
        // PURPOSE: Triggers the backend login API call managed in AuthContext to authenticate the user.
        const success = await login(
            isPhone ? null : email, // if phone, email is null
            isPhone ? email : null, // if phone, phone is the value 
            password
        );

        if (success) {
            navigation.replace('Home');
        }
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
                <Text style={styles.subtitle}>Login to your account</Text>

                <LoginOptionButton
                    title="Continue with Google"
                    iconName="logo-google"
                    iconColor="#DB4437"
                    onPress={() => navigation.replace('Home')}
                />

                <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                {/* Mobile/Email Input */}
                <FloatingLabelInput
                    label="Mobile No. / Email ID"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Password Input */}
                <FloatingLabelInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    isPassword={true}
                    secureTextEntry={!passwordVisible}
                    passwordVisible={passwordVisible}
                    onTogglePassword={() => setPasswordVisible(!passwordVisible)}
                />

                <View style={styles.linkContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')}><Text style={styles.linkText}>Login with OTP</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.linkText}>Forgot Password?</Text></TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
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
        marginBottom: 30,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    orText: {
        marginHorizontal: 10,
        color: COLORS.grey,
        fontFamily: FONTS.RobotoRegular,
        fontSize: 12,
    },
    inputContainer: {
        marginBottom: 25,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontFamily: FONTS.RobotoRegular,
        fontSize: 16,
        color: COLORS.black,
        // Remove individual borders since height is managed by container
    },
    showButton: {
        paddingVertical: 8,
    },
    showText: {
        fontFamily: FONTS.RobotoRegular,
        color: COLORS.grey,
        fontSize: 12,
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 30,
    },
    linkText: {
        color: COLORS.primary,
        fontFamily: FONTS.RobotoMedium,
        fontSize: 14,
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
        //marginBottom: 20,
    },
});

export default EmailLogin;
