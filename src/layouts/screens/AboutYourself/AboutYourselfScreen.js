import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';

import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import CustomSelectionButton from '../../components/CommonComponents/CustomSelectionButton';
import LongTextInput from '../../components/CommonComponents/LongTextInput';

const AboutYourselfScreen = ({ navigation, route }) => {
  const { gender, profileFor, firstName, lastName, day, month, year } =
    route.params || {};

  const [bio, setBio] = useState("");
  const [notShare, setNotShare] = useState(false);

  return (
    <View style={styles.container}>
      <Header title="" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ICON SECTION */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/images/aboutyourself.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* TOP TEXT */}
          <Text style={styles.topInfo}>
            Tell us something about yourself
          </Text>

          {/* HEADING */}
          <Text style={styles.sectionHeading}>About yourself</Text>

          {/* LONG TEXT INPUT */}
          <LongTextInput
            label="Write about yourself"
            value={bio}
            onChangeText={setBio}
            height={220}
          />

          <Text style={styles.helperText}>
            Make your introduction more personal and unique.
          </Text>

          <Text style={styles.charCount}>{bio.length}/4000</Text>

          {/* CHECKBOX */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setNotShare(!notShare)}
            style={styles.checkboxRow}
          >
            <CustomSelectionButton style={styles.checkboxCard}>

              {/* TICK BOX */}
              <View style={[styles.checkboxSquare, notShare && styles.checkboxChecked]}>
                {notShare && <Text style={styles.tickIcon}>✓</Text>}
              </View>

              <Text style={styles.checkboxText}>
                Do not add my Profile to LyvBond's affiliated Matchmaking services
              </Text>

            </CustomSelectionButton>
          </TouchableOpacity>

          {/* CONTINUE BUTTON */}
          <CustomButton
            title="Continue"
            paddingVertical={15}
            borderRadius={25}
            marginTop={35}
            onPress={() =>
              navigation.navigate('VarufyScreen', {
                ...route.params, // Pass all previous params
                about: bio,
                doNotShowProfile: notShare,
              })
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AboutYourselfScreen;

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
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  iconImage: {
    width: 130,
    height: 130,
  },

  topInfo: {
    textAlign: 'center',
    color: COLORS.textGrey,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 25,
  },

  sectionHeading: {
    fontSize: 30,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.black,
    marginBottom: 12,
  },

  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: FONTS.RobotoRegular,
  },

  charCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
  },

  checkboxRow: {
    marginTop: 25,
  },

  checkboxCard: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },

  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },

  tickIcon: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },

  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: FONTS.RobotoMedium,
    lineHeight: 18,
  },
});
