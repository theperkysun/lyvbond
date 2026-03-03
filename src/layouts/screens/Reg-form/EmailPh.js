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
  TextInput,
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

const EmailPh = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gender, profileFor, firstName, lastName, day, month, year, googleData } =
    route.params || {};

  const [email, setEmail] = useState(googleData?.email || '');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const isGoogleSignup = !!googleData;

  // Modals state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Custom Error Modal state
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorModalConfig, setErrorModalConfig] = useState({ title: '', message: '' });

  const showError = (title, message) => {
    setErrorModalConfig({ title, message });
    setIsErrorModalVisible(true);
  };

  // Validation
  const isValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim());
  const isValidMobile = mobile.trim().length == 10;
  const isValidPassword = password.length >= 6;
  const isFormValid = isValidEmail && isValidMobile && isValidPassword;

  const scrollViewRef = useRef(null);

  const handleSubmit = async () => {

    // ===== Email Validation =====
    if (!email.trim()) {
      showError('Missing Info', 'Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showError('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // ===== Mobile Validation =====
    if (!mobile.trim()) {
      showError('Missing Info', 'Please enter your mobile number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      showError('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // ===== Password Validation =====
    if (!password.trim()) {
      showError('Missing Info', 'Please enter your password.');
      return;
    }

    if (password.length < 6) {
      showError(
        'Weak Password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    // ===== All validations passed =====
    setLoading(true);
    try {
      // Create user and send OTP
      const payload = {
        email: email.trim(),
        phoneNumber: `${countryCode}${mobile}`,
        password,
        gender,
        profileFor,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        dob: { day, month, year },
        googleIdToken: googleData?.idToken, // Pass token if continuing via Google
        isGoogleSignup: isGoogleSignup,
      };

      // Log payload for debugging
      console.log("Initiating Signup with Payload:", JSON.stringify(payload, null, 2));

      // 🌟 NEW LOGIC: If Google Auth, Bypass OTP entirely and hit a Google verifier endpoint or just pass the flag to backend.
      if (isGoogleSignup) {
        // Backend should handle verifying the ID token and directly creating/logging in the user
        const response = await axios.post(`${BASE_URL}/signup/google-complete`, payload);

        if (response.data.success) {
          const { token, user } = response.data;

          navigation.navigate('CreateProfileStep', {
            token: token,
            userId: user._id,
            email: email.trim(),
            phone: `${countryCode}${mobile}`,
            gender,
            profileFor,
            firstName,
            lastName,
            day,
            month,
            year,
          });
        }
      } else {
        // Standard OTP Flow
        const response = await axios.post(`${BASE_URL}/signup/initiate`, payload);

        if (response.data.success) {
          Alert.alert("OTP Sent", "Please check your email for verification code.");
          navigation.navigate('SignupOTP', {
            email: email.trim(),
            phone: `${countryCode}${mobile}`,
          });
        }
      }

    } catch (error) {
      console.error("Error in handleSubmit:", error);
      let msg = error.response?.data?.message || "Something went wrong. Please try again.";

      // Intercept raw API error strings for existing users and map to a friendly popup
      if (typeof msg === 'string' && msg.toLowerCase().includes('exist')) {
        msg = "An account with this Email ID or Mobile number already exists. Please login instead, or use different details to create a new profile.";
      }

      showError("Registration Error", msg);
    } finally {
      setLoading(false);
    }
  };


  const InfoModal = ({ visible, onClose, title, content }) => (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalBody}>{content}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const privacyPolicyContent = `
Privacy Policy for Matrimonial App

1. Information Collection: We collect personal details (name, contact, DOB, gender) to create your matrimonial profile.
2. Purpose: Your data is used to find suitable matches and facilitate communication.
3. Security: We employ industry-standard security measures to protect your data.
4. Sharing: We do not share your private contact info without your explicit consent.
5. User Rights: You can edit or delete your profile at any time.
  `;

  const termsContent = `
Terms & Conditions

1. Eligibility: You must be of legal marriageable age.
2. Authenticity: You agree to provide accurate and truthful information.
3. Conduct: Abusive or inappropriate behavior is strictly prohibited.
4. Membership: Paid memberships are non-transferable.
5. Termination: We reserve the right to suspend accounts violating these terms.
  `;

  return (
    <View style={styles.container}>
      <Header title="" onBackPress={() => navigation.goBack()} />

      <InfoModal
        visible={showPrivacyModal}
        title="Privacy Policy"
        content={privacyPolicyContent}
        onClose={() => setShowPrivacyModal(false)}
      />
      <InfoModal
        visible={showTermsModal}
        title="Terms & Conditions"
        content={termsContent}
        onClose={() => setShowTermsModal(false)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/images/emailph.png')}
                style={styles.detailsImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            An active email ID & phone no. are required to secure your profile
          </Text>

          {/* Email Input */}
          <Text style={styles.label}>Email ID</Text>
          <View style={isGoogleSignup ? { opacity: 0.6 } : {}}>
            <CustomInput
              placeholder="Email ID"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isGoogleSignup} // Disable editing if from Google
            />
          </View>

          {/* Mobile Input with Animated Component */}
          <Text style={[styles.label, { marginTop: 25 }]}>Mobile no.</Text>
          <View style={styles.mobileContainer}>
            {/* +91 Design */}
            <TouchableOpacity style={styles.countryCodeBox} activeOpacity={0.8}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </TouchableOpacity>

            {/* Animated Input for Mobile */}
            <View style={styles.NumberInputWrapper}>
              <NumberInput
                label="Mobile number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Input with Toggle */}
          <Text style={[styles.label, { marginTop: 25 }]}>Password</Text>

          <CustomInput
            label="Create Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 500);
            }}
            RightAccessory={
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <MaterialCommunityIcons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color={COLORS.grey}
                />
              </TouchableOpacity>
            }
          />

          {/* Submit Button */}
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 35 }} />
          ) : (
            <CustomButton
              title="Continue"
              paddingVertical={15}
              borderRadius={25}
              marginTop={35}
              disabled={!isFormValid}
              onPress={handleSubmit}
            />
          )}


          {/* Footer */}
          <Text style={styles.footerText}>
            By creating account, you agree to our{' '}
            <Text style={styles.link} onPress={() => setShowPrivacyModal(true)}>Privacy Policy</Text> and{' '}
            <Text style={styles.link} onPress={() => setShowTermsModal(true)}>T&C</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Error Modal */}
      <Modal
        visible={isErrorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsErrorModalVisible(false)}
      >
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContent}>
            <Text style={styles.customModalTitle}>{errorModalConfig.title}</Text>
            <Text style={styles.customModalMessage}>{errorModalConfig.message}</Text>

            <View style={styles.customModalButtonGroup}>
              {errorModalConfig.title === "Registration Error" ? (
                <>
                  <TouchableOpacity
                    style={[styles.customModalButton, styles.cancelButton]}
                    onPress={() => setIsErrorModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.customModalButton, styles.actionButton]}
                    onPress={() => {
                      setIsErrorModalVisible(false);
                      navigation.navigate('MainLoginScreen'); // Navigate to Login if account exists
                    }}
                  >
                    <Text style={styles.actionButtonText}>Go to Login</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.customModalButton, styles.cancelButton, { flex: 1 }]}
                  onPress={() => setIsErrorModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: COLORS.primary }]}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

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
    width: 130,
    height: 130,
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.textGrey,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 15,
    marginBottom: 25,
    lineHeight: 22,
  },
  label: {
    fontFamily: FONTS.RobotoBold,
    fontSize: 30,
    color: COLORS.black,
    marginBottom: 8,
  },

  // Fix vertical alignment here
  mobileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countryCodeBox: {
    width: 80,
    height: 65,
    borderWidth: 1.8,
    borderRadius: 14,
    borderColor: COLORS.bordercolor,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: COLORS.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  countryCodeText: {
    fontSize: 17,
    fontFamily: FONTS.RobotoMedium,
    color: COLORS.black,
    marginTop: 2,
  },

  // Wrapper ensures the NumberInput vertically aligns perfectly
  NumberInputWrapper: {
    flex: 1,
    justifyContent: 'center',
    height: 65,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textGrey,
    marginTop: 25,
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 10, // Massive padding to ensure keyboard doesn't hide input
  },
  // ... existing styles ...


  modalBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  // Custom Error Modal Styles
  customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customModalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  customModalTitle: {
    fontFamily: FONTS.RobotoBold,
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  customModalMessage: {
    fontFamily: FONTS.RobotoRegular,
    fontSize: 15,
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  customModalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  customModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontFamily: FONTS.RobotoMedium,
    fontSize: 15,
    color: COLORS.black,
  },
  actionButtonText: {
    fontFamily: FONTS.RobotoMedium,
    fontSize: 15,
    color: COLORS.white,
  },
});

export default EmailPh;
