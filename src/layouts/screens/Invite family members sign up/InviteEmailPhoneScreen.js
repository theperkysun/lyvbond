import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomInput from '../../components/CommonComponents/CustomInput';
import CustomButton from '../../components/CommonComponents/CustomButton';
import NumberInput from '../../components/CommonComponents/NumberInput';
import { useAuth } from '../../../context/AuthContext';
import ChatService from '../../../services/ChatService';

const InviteEmailPhoneScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { forceLogin } = useAuth();

    const {
        chatId, inviterId, profileFor, gender, firstName, lastName, day, month, year, profileImage
    } = route.params || {};

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [countryCode, setCountryCode] = useState('+91');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalConfig, setErrorModalConfig] = useState({ title: '', message: '' });

    const showError = (title, message) => {
        setErrorModalConfig({ title, message });
        setIsErrorModalVisible(true);
    };

    const isValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim());
    const isValidMobile = mobile.trim().length >= 10;
    const isValidPassword = password.length >= 6;
    const isFormValid = isValidEmail && isValidMobile && isValidPassword;

    const scrollViewRef = useRef(null);

    const handleSubmit = async () => {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            showError('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        if (!mobile.trim() || !/^[0-9]{10}$/.test(mobile)) {
            showError('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!password.trim() || password.length < 6) {
            showError('Weak Password', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', email.trim());
            formData.append('phoneNumber', `${countryCode}${mobile}`);
            formData.append('password', password);
            formData.append('gender', gender);
            formData.append('profileFor', profileFor);
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('name', `${firstName} ${lastName}`.trim());
            formData.append('dob', JSON.stringify({ day, month, year }));
            formData.append('isInvitedUser', 'true');
            formData.append('familyRelation', profileFor);
            if (inviterId && inviterId !== 'true') {
                formData.append('invitedBy', inviterId);
            }

            if (profileImage) {
                formData.append('profileImage', {
                    uri: profileImage.uri,
                    type: profileImage.type || 'image/jpeg',
                    name: profileImage.fileName || 'profile.jpg'
                });
            }

            const response = await axios.post(`${BASE_URL}/signup/family-signup`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Navigate to the OTP verification screen
                navigation.navigate('InviteSignupOTP', {
                    email: email.trim(),
                    chatId: chatId
                });
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            let msg = error.response?.data?.message || "Something went wrong. Please try again.";
            if (typeof msg === 'string' && msg.toLowerCase().includes('exist')) {
                msg = "An account with this Email ID or Mobile number already exists. Please login instead.";
            }
            showError("Registration Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="" onBackPress={() => navigation.goBack()} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Image source={require('../../../assets/images/emailph.png')} style={styles.detailsImage} resizeMode="contain" />
                        </View>
                    </View>

                    <Text style={styles.infoText}>An active email ID & phone no. are required to secure your profile</Text>

                    <Text style={styles.label}>Email ID</Text>
                    <CustomInput placeholder="Email ID" keyboardType="email-address" value={email} onChangeText={setEmail} />

                    <Text style={[styles.label, { marginTop: 25 }]}>Mobile no.</Text>
                    <View style={styles.mobileContainer}>
                        <TouchableOpacity style={styles.countryCodeBox} activeOpacity={0.8}>
                            <Text style={styles.countryCodeText}>{countryCode}</Text>
                        </TouchableOpacity>
                        <View style={styles.NumberInputWrapper}>
                            <NumberInput label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
                        </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 25 }]}>Password</Text>
                    <CustomInput
                        label="Create Password" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible}
                        onFocus={() => { setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 500); }}
                        RightAccessory={
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <MaterialCommunityIcons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color={COLORS.grey} />
                            </TouchableOpacity>
                        }
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 35 }} />
                    ) : (
                        <CustomButton title="Sign up" paddingVertical={15} borderRadius={25} marginTop={35} disabled={!isFormValid} onPress={handleSubmit} />
                    )}

                    <Text style={styles.footerText}>
                        By creating account, you agree to our Privacy Policy and T&C
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={isErrorModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsErrorModalVisible(false)}>
                <View style={styles.customModalOverlay}>
                    <View style={styles.customModalContent}>
                        <Text style={styles.customModalTitle}>{errorModalConfig.title}</Text>
                        <Text style={styles.customModalMessage}>{errorModalConfig.message}</Text>
                        <View style={styles.customModalButtonGroup}>
                            <TouchableOpacity style={[styles.customModalButton, styles.cancelButton, { flex: 1 }]} onPress={() => setIsErrorModalVisible(false)}>
                                <Text style={[styles.cancelButtonText, { color: COLORS.primary }]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgcolor },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
    iconContainer: { alignItems: 'center', marginVertical: 25 },
    iconCircle: {
        backgroundColor: COLORS.bgcolor, width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center',
        shadowColor: COLORS.primaryShadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4,
    },
    detailsImage: { width: 130, height: 130 },
    infoText: { textAlign: 'center', color: COLORS.textGrey, fontFamily: FONTS.RobotoMedium, fontSize: 15, marginBottom: 25, lineHeight: 22 },
    label: { fontFamily: FONTS.RobotoBold, fontSize: 30, color: COLORS.black, marginBottom: 8 },
    mobileContainer: { flexDirection: 'row', alignItems: 'center' },
    countryCodeBox: {
        width: 80, height: 65, borderWidth: 1.8, borderRadius: 14, borderColor: COLORS.bordercolor, backgroundColor: COLORS.white,
        justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: COLORS.primaryShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    countryCodeText: { fontSize: 17, fontFamily: FONTS.RobotoMedium, color: COLORS.black, marginTop: 2 },
    NumberInputWrapper: { flex: 1, justifyContent: 'center', height: 65 },
    footerText: { textAlign: 'center', fontSize: 13, color: COLORS.textGrey, marginTop: 25, lineHeight: 20 },
    customModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    customModalContent: { width: '85%', backgroundColor: COLORS.white, borderRadius: 15, padding: 25, elevation: 5 },
    customModalTitle: { fontFamily: FONTS.RobotoBold, fontSize: 20, color: COLORS.black, marginBottom: 10, textAlign: 'center' },
    customModalMessage: { fontFamily: FONTS.RobotoRegular, fontSize: 15, color: COLORS.grey, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    customModalButtonGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    customModalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#F0F0F0' },
    cancelButtonText: { fontFamily: FONTS.RobotoMedium, fontSize: 15, color: COLORS.black },
});

export default InviteEmailPhoneScreen;
