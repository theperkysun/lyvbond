import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FONTS, COLORS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import ProfileImageSection from './ProfileImageSection';
import ProfileOptionsCard from './ProfileOptionsCard';
import ProfileInfoNote from './ProfileInfoNote';
import GenderSelection from './GenderSelection';
import CustomButton from '../../components/CommonComponents/CustomButton';
import { SELECTION_DATA } from "../../components/CommonComponents/selectionboxdata";

const UploadPhoto = ({ navigation, route }) => {
  const [selectedProfileFor, setSelectedProfileFor] = useState(null);
  const googleData = route?.params?.googleData; // Receive googleData

  const PROFILE_FOR_MAPPING = {
    'Myself': 'Self',
    'My Son': 'Parents',
    'My Daughter': 'Parents',
    'My Brother': 'Family Member',
    'My Sister': 'Family Member',
    'My Friend': 'Friend',
    'My Relative': 'Relative'
  };

  const handleProfileSelect = (label) => {
    setSelectedProfileFor(label);
  };

  const handleNext = () => {
    if (!selectedProfileFor) return;

    const mappedProfileFor = PROFILE_FOR_MAPPING[selectedProfileFor] || selectedProfileFor;

    switch (selectedProfileFor) {
      case 'My Son':
      case 'My Brother':
        navigation.navigate('NameDob', { gender: 'Male', profileFor: mappedProfileFor, googleData });
        break;

      case 'My Daughter':
      case 'My Sister':
        navigation.navigate('NameDob', { gender: 'Female', profileFor: mappedProfileFor, googleData });
        break;

      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Upload Your Data" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileImageSection />

        {/* Heading */}
        <Text style={styles.titleText}>This Profile is for</Text>

        {/* Options */}
        <ProfileOptionsCard onSelect={handleProfileSelect} />

        {/* Conditional Continuation */}
        {selectedProfileFor &&
          (SELECTION_DATA.selectprofilefor.includes(selectedProfileFor) ? (
            <GenderSelection
              profileFor={PROFILE_FOR_MAPPING[selectedProfileFor] || selectedProfileFor}
              googleData={googleData}
            />
          ) : (
            <CustomButton
              title="Next"
              paddingVertical={15}
              borderRadius={25}
              marginTop={35}
              onPress={handleNext}
            />
          ))}

        {/* Bottom Info Note */}
        <ProfileInfoNote />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgcolor,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.RobotoBold,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'left',
  },
});

export default UploadPhoto;
