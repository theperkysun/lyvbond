//import liraries
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import LoginOptionButton from '../../components/CommonComponents/LoginOptionButton';
import auth from '@react-native-firebase/auth';
import GoogleSignin from '../../../config/googleAuth';
import { statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../../context/AuthContext';
import { Alert } from 'react-native';

const Signup = ({ navigation, route }) => {
  const { googleLogin } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const initialGoogleData = route?.params?.googleData; // Receive googleData from MainLoginScreen if available

  // Use initialGoogleData if we already authenticated on MainLoginScreen and it pushed us here
  React.useEffect(() => {
    if (initialGoogleData) {
      // Just visually proceed or something, or wait for them to click "Sign up with Google"?
      // Usually, if we got here with googleData, the user already did it. 
      // But we can let them click it or auto-proceed. Let's just store it.
    }
  }, [initialGoogleData]);

  const handleNavigate = () => {
    // Standard manual signup with email/mobile
    navigation.navigate('UploadPhoto', { googleData: null });
  };

  const handleGoogleSignup = async () => {
    // If we already have it from MainLoginScreen, just skip directly
    if (initialGoogleData) {
      navigation.navigate('UploadPhoto', { googleData: initialGoogleData });
      return;
    }

    if (isGoogleLoading) return;
    setIsGoogleLoading(true);

    try {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignored
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const { idToken } = response.data || {};

      if (!idToken) {
        throw new Error('Could not retrieve your account information. Please try again.');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      const firebaseToken = await auth().currentUser.getIdToken();

      // Check with backend
      const result = await googleLogin(firebaseToken);

      if (result.success) {
        if (result.status === 'USER_NOT_FOUND') {
          // This is a NEW user! Proceed with Signup flow.
          navigation.navigate('UploadPhoto', { googleData: result.googleData });
        } else if (result.status === 'LOGIN_SUCCESS') {
          // They already have an account!
          Alert.alert("Account Exists", "You already have an account. Logging you in...");
          // AuthContext automatically redirects to Home since userToken is set
        }
      } else {
        Alert.alert("Sign up Failed", "Backend authentication failed.");
      }

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is already in progress');
      } else {
        console.error('FAILED GOOGLE SIGNUP:', error);
        Alert.alert("Google Error", error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* TOP IMAGE TAKES ALL REMAINING SPACE */}
      <View style={styles.imageContainer}>
        <ImageBackground
          source={require('../../../assets/images/signupbg.png')}
          style={styles.bgImage}
          resizeMode="cover"
        />
      </View>

      {/* WHITE BOTTOM SECTION (AUTO HEIGHT ONLY) */}
      <View style={styles.bottomCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          bounces={false}
        >
          <Text style={styles.title}>Create your account</Text>

          <View style={styles.buttonGroup}>
            <LoginOptionButton
              title="Sign up with Email"
              iconName="mail-outline"
              iconColor={COLORS.black}
              onPress={handleNavigate}
            />

            {/* <LoginOptionButton
              title="Sign up with Mobile"
              iconName="call-outline"
              iconColor={COLORS.black}
              onPress={handleNavigate}
            /> */}

            <LoginOptionButton
              title={isGoogleLoading ? "Loading..." : "Sign up with Google"}
              iconName="logo-google"
              iconColor="#DB4437"
              onPress={handleGoogleSignup}
            />

            <LoginOptionButton
              title="Sign up with Apple"
              iconName="logo-apple"
              iconColor={COLORS.black}
              onPress={handleNavigate}
            />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.haveAccount}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: 'column',
  },

  /* TOP IMAGE TAKES ALL AVAILABLE FREE SPACE */
  imageContainer: {
    flex: 1, // <-- Image grows to fill remaining area
    width: '100%',
  },

  bgImage: {
    width: '100%',
    height: '100%',
  },

  /* WHITE CARD BELOW → ONLY TAKES NEEDED HEIGHT */
  bottomCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 30,
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    marginTop: -100,
  },

  title: {
    marginTop: 5, // as requested
    fontSize: 22,
    fontFamily: FONTS.RobotoBold,
    textAlign: 'center',
    marginBottom: 25,
    color: COLORS.black,
  },

  buttonGroup: {
    width: '100%',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  haveAccount: {
    fontFamily: FONTS.RobotoRegular,
    fontSize: 14,
    color: COLORS.grey,
  },

  loginText: {
    marginLeft: 4,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default Signup;
