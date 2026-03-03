// import libraries
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import { COLORS, FONTS } from '../../../utlis/comon';
import LoginOptionButton from '../../components/CommonComponents/LoginOptionButton';
import { useAuth } from '../../../context/AuthContext';
import GoogleSignin from '../../../config/googleAuth';
import { statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';

const MainLoginScreen = ({ navigation }) => {
  const { userToken, setUserToken, googleLogin } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  // Custom Modal State
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalConfig, setModalConfig] = React.useState({ title: '', message: '', type: 'error' });

  console.log('token:', userToken);

  // 🔐 GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);

    try {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignored
      }

      console.log('STEP 1: Checking Play Services');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('STEP 1 OK');

      console.log('STEP 2: Calling GoogleSignin.signIn()');
      const response = await GoogleSignin.signIn();
      console.log('STEP 2 RESULT:', response);

      // Check if the response contains data (v16 structure)
      const { idToken } = response.data || {};

      if (!idToken) {
        throw new Error('We could not retrieve your account information from Google. Please try again.');
      }

      console.log('STEP 3: Creating Firebase credential');
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      await auth().signInWithCredential(googleCredential);
      console.log('STEP 3 OK');

      console.log('STEP 4: Getting Firebase token');
      const firebaseToken = await auth().currentUser.getIdToken();
      console.log('STEP 4 TOKEN obtained');

      // STEP 5: Backend Authentication
      const result = await googleLogin(firebaseToken);

      if (result.success) {
        if (result.status === 'LOGIN_SUCCESS') {
          // Context updates userToken, AppNavigation will switch to Home automatically
          console.log("Login Success");
        } else if (result.status === 'USER_NOT_FOUND') {
          console.log("New User - Prompting for Signup");
          setModalConfig({
            title: "Account Not Found",
            message: "You don't have an account yet. Please complete the signup process to continue.",
            type: 'signup'
          });
          setIsModalVisible(true);
        }
      } else {
        // Error handling is done in googleLogin mostly, but safe fallback
        console.log("Backend auth failed");
      }

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('❌ FAILED AT STEP:', error);
        setModalConfig({
          title: "Google Login Error",
          message: error.message,
          type: 'error'
        });
        setIsModalVisible(true);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* Centered content */}
      <View style={styles.centerWrapper}>
        <Image
          source={require('../../../assets/images/LyvBondLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Welcome back!{'\n'}Please Login
        </Text>

        <Text style={styles.subtitle}>
          Use the same Email ID or Mobile No. that you{'\n'}
          used to create your Profile.
        </Text>

        <View style={styles.buttonGroup}>
          <LoginOptionButton
            title="Continue with Google"
            iconName="logo-google"
            iconColor="#DB4437"
            onPress={handleGoogleLogin}
          />

          <LoginOptionButton
            title="Sign up with Apple"
            iconName="logo-apple"
            iconColor={COLORS.black}
            onPress={() => navigation.navigate('EmailLogin')}
          />

          <LoginOptionButton
            title="Continue with Password"
            iconName="mail-outline"
            iconColor={COLORS.primary}
            onPress={() => navigation.navigate('EmailLogin')}
          />

          {/* <LoginOptionButton
            title="Continue with OTP"
            iconName="chatbubble-ellipses-outline"
            iconColor="#F4B400"
            onPress={() => navigation.navigate('PhoneLogin')}
          /> */}
        </View>
      </View>

      {/* Bottom Signup section */}
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

      {/* Custom Alert Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {modalConfig.type === 'signup' && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.actionButton]}
                  onPress={() => {
                    setIsModalVisible(false);
                    navigation.navigate('Signup');
                  }}
                >
                  <Text style={styles.actionButtonText}>Go to Signup</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  title: {
    fontFamily: FONTS.RobotoBold,
    fontSize: 26,
    color: COLORS.black,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: FONTS.RobotoRegular,
    fontSize: 14,
    color: COLORS.grey,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 35,
    lineHeight: 20,
  },

  buttonGroup: {
    width: '100%',
    marginTop: 10,
  },

  bottomWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
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
  },

  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalTitle: {
    fontFamily: FONTS.RobotoBold,
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: FONTS.RobotoRegular,
    fontSize: 15,
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
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

export default MainLoginScreen;
