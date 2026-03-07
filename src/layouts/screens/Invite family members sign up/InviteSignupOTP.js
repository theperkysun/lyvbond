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
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const InviteSignupOTP = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { forceLogin } = useAuth(); // Login context setter

    // Destructure all params passed from InviteEmailPhoneScreen
    const {
        email,
        chatId
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

                try {
                    // Automatically join the family group now that we have a user and token
                    if (chatId) {
                        await axios.post(
                            `${BASE_URL}/chat/join-family-group`,
                            { conversationId: chatId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                } catch (e) {
                    console.error('Error joining family group after signup:', e);
                }

                // Properly log in with the new token and user object, saving to AsyncStorage
                await forceLogin(token, user);
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
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Image
                                source={require('../../../assets/images/emailph.png')}
                                style={styles.detailsImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <Text style={styles.titleText}>Verification Code</Text>

                    <Text style={styles.infoText}>
                        We have sent the verification code to your email address
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
                                    Resend OTP
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <CustomButton
                            title="Verify & Join"
                            paddingVertical={15}
                            borderRadius={25}
                            marginTop={35}
                            disabled={!isOtpComplete}
                            onPress={handleVerify}
                            style={{ opacity: isOtpComplete ? 1 : 0.6 }}
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
        marginVertical: 15,
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
        width: 130,
        height: 130,
    },
    titleText: {
        fontFamily: FONTS.RobotoBold,
        fontSize: 32,
        color: COLORS.black,
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        textAlign: 'center',
        color: COLORS.textGrey,
        fontFamily: FONTS.RobotoMedium,
        fontSize: 16,
        marginBottom: 30,
        lineHeight: 22,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        textAlign: 'center',
        fontSize: 22,
        fontFamily: FONTS.RobotoBold,
        color: COLORS.black,
        shadowColor: COLORS.primaryShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    resendText: {
        fontFamily: FONTS.RobotoMedium,
        fontSize: 15,
        color: COLORS.grey,
    },
});

export default InviteSignupOTP;
