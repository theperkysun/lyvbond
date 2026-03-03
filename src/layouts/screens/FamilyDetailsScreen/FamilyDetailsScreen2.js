import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import CustomSelection from '../../components/CommonComponents/CustomSelection';
import { COLORS, FONTS } from '../../../utlis/comon';

const FamilyDetailsScreen2 = ({ navigation, route }) => {
  const [liveWithFamily, setLiveWithFamily] = useState(null);
  const [financialStatus, setFinancialStatus] = useState(null);

  const financialOptions = ['Elite', 'High', 'Middle', 'Aspiring'];

  const canContinue = liveWithFamily !== null && financialStatus !== null;

  return (
    <View style={styles.container}>
      <Header title="" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ICON */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../../../assets/images/family.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.heading}>Add family details</Text>
        <Text style={styles.subHeading}>
          This really helps find common connections
        </Text>

        {/* Family location section */}
        <Text style={styles.sectionTitle}>Your Family Location</Text>
        <Text style={styles.subTitle2}>You live with your family?</Text>

        <View style={styles.yesNoRow}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              liveWithFamily === 'Yes' && styles.yesNoActive,
            ]}
            onPress={() => setLiveWithFamily('Yes')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.yesNoText,
                liveWithFamily === 'Yes' && styles.yesNoTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.yesNoButton,
              liveWithFamily === 'No' && styles.yesNoActive,
            ]}
            onPress={() => setLiveWithFamily('No')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.yesNoText,
                liveWithFamily === 'No' && styles.yesNoTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {/* Financial status */}
        <Text style={styles.sectionTitle2}>Your Family’s Financial Status</Text>

        {financialOptions.map((item) => (
          <CustomSelection
            key={item}
            title={item}
            selected={financialStatus === item}
            onPress={() => setFinancialStatus(item)}
          />
        ))}

        {/* CONTINUE BUTTON */}
        <CustomButton
          title="Continue"
          paddingVertical={15}
          borderRadius={25}
          marginTop={30}
          backgroundColor={canContinue ? COLORS.primary : '#D3D3D3'}
          disabled={!canContinue}
          onPress={() => navigation.navigate('PreferencesOverview', {
            ...route.params,
            liveWithFamily: liveWithFamily,
            familyFinancialStatus: financialStatus,
          })}
        />
      </ScrollView>
    </View>
  );
};

export default FamilyDetailsScreen2;

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
    marginVertical: 20,
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

  heading: {
    fontSize: 28,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.black,
    marginTop: 10,
  },

  subHeading: {
    color: COLORS.textGrey,
    fontSize: 15,
    marginBottom: 25,
    fontFamily: FONTS.RobotoRegular,
  },

  sectionTitle: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.black,
  },

  subTitle2: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 15,
    fontFamily: FONTS.RobotoRegular,
  },

  yesNoRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },

  yesNoButton: {
    flex: 1,
    borderWidth: 1.6,
    borderColor: COLORS.bordercolor,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white,
  },

  yesNoActive: {
    backgroundColor: '#FFE7EB',
    borderColor: COLORS.primary,
  },

  yesNoText: {
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
    color: COLORS.grey,
  },

  yesNoTextActive: {
    color: COLORS.primary,
  },

  sectionTitle2: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 18,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.black,
  },
});
