import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const SignupOTP = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { setUserToken } = useAuth(); // <--- Get Context Setter

    // Destructure all params passed from EmailPh
    const {
        email,
        phone,
        password, // <--- Added password
        gender,
        profileFor,
        firstName,
        lastName,
        day,
        month,
        year,
    } = route.params || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
    const inputs = useRef([]);
    const [timer, setTimer] = useState(20);
    const [loading, setLoading] = useState(false);

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus next input
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (key, index) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

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

    const handleResend = () => {
        setTimer(20);
        // Logic to resend OTP if backend connected
        console.log("Resend OTP clicked");
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    const handleVerify = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6 || otp.some(digit => digit === '')) {
            Alert.alert(
                'Invalid OTP',
                'Please enter the complete 6 digit verification code.'
            );
            return;
        }

        console.log('Verifying OTP:', enteredOtp);

        setLoading(true);
        try {
            // Verify OTP against Backend
            const response = await axios.post(`${BASE_URL}/signup/verify-otp`, {
                email: email,
                otp: enteredOtp
            });

            if (response.data.token) {
                const { token, user } = response.data;

                // ⚠️ DO NOT set global userToken yet. 
                // Setting userToken would trigger AuthContext to switch to AppStack (Home) immediately.
                // We want to continue the signup flow.

                // Store temporarily if needed for future requests (e.g. "update profile" calls)
                // await AsyncStorage.setItem('tempSignupToken', token); 

                console.log("OTP Verified. Proceeding to Create Profile...");

                // Proceed to next step with the token
                navigation.navigate('CreateProfileStep', {
                    token, // Pass token to next screen so it can be used for API calls
                    userId: user._id,
                    email,
                    phone,
                    gender,
                    profileFor,
                    firstName,
                    lastName,
                    day,
                    month,
                    year,
                });
            }

        } catch (error) {
            console.error("OTP Verification Error:", error);
            const msg = error.response?.data?.message || "Invalid OTP or Error verifying.";
            Alert.alert("Verification Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="" onBackPress={() => navigation.goBack()} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Icon - Reusing emailph image or generic icon if preferred, 
              but user said "similar looking like the other pages". 
              EmailPh has a specific icon. I'll use a similar structure. */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            {/* Using the same image as EmailPh for consistency or a placeholder if different desired. 
                   Since I don't have a specific OTP image asset, I'll reuse the emailph one 
                   or just use the circle style. Let's use the same image for visual continuity 
                   or check if there is an OTP image. */}
                            <Image
                                source={require('../../../assets/images/emailph.png')}
                                style={styles.detailsImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <Text style={styles.titleText}>Verification Code</Text>

                    <Text style={styles.infoText}>
                        We have sent the verification code to your email address & mobile number
                    </Text>

                    {/* OTP Inputs */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpInput}
                                keyboardType="number-pad"
                                maxLength={1}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                ref={(input) => (inputs.current[index] = input)}
                                value={digit}
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    {/* Resend Timer */}
                    <View style={styles.resendContainer}>
                        {timer > 0 ? (
                            <Text style={styles.resendText}>Resend code in {timer}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={[styles.resendText, { color: COLORS.primary, fontWeight: '700' }]}>
                                    Resend Code
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>


                    {/* Verify Button */}
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 35 }} />
                    ) : (
                        <CustomButton
                            title="Verify & Continue"
                            paddingVertical={15}
                            borderRadius={25}
                            marginTop={35}
                            disabled={!isOtpComplete}
                            onPress={handleVerify}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgcolor,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 25,
    },
    iconCircle: {
        backgroundColor: COLORS.bgcolor,
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primaryShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    detailsImage: {
        width: 130, // Slightly larger than circle to match EmailPh style
        height: 130,
    },
    titleText: {
        fontSize: 24,
        fontFamily: FONTS.RobotoBold,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    infoText: {
        textAlign: 'center',
        color: COLORS.textGrey,
        fontFamily: FONTS.RobotoMedium,
        fontSize: 15,
        marginBottom: 30,
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Changed to space-between for 6 blocks
        marginBottom: 20,
    },
    otpInput: {
        width: 45, // Reduced from 50
        height: 50, // Height can stay 50 or match width for square
        borderWidth: 1,
        borderColor: COLORS.bordercolor,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: FONTS.RobotoBold,
        color: COLORS.black,
        elevation: 2,
        shadowColor: COLORS.primaryShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    resendText: {
        color: COLORS.textGrey,
        fontSize: 14,
        fontFamily: FONTS.RobotoMedium,
    },
});

export default SignupOTP;
