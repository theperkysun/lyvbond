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
import CustomDropdown from '../../components/CommonComponents/CustomDropdown';
import { COLORS, FONTS } from '../../../utlis/comon';

const FamilyDetailsScreen1 = ({ navigation, route }) => {
  const [mother, setMother] = useState("");
  const [father, setFather] = useState("");
  const [sisters, setSisters] = useState("");
  const [brothers, setBrothers] = useState("");

  const canContinue =
    mother !== "" || father !== "" || sisters !== "" || brothers !== "";

  return (
    <View style={styles.container}>
      {/* UPDATED HEADER WITH SKIP BUTTON */}
      <Header
        title=""
        onBackPress={() => navigation.goBack()}
        rightText="Skip →"
        onRightPress={() => navigation.navigate("FamilyDetailsScreen2", {
          ...route.params,
          motherDetails: mother,
          fatherDetails: father,
          sistersCount: sisters,
          brothersCount: brothers,
        })}
      />

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

        {/* DROPDOWNS */}
        <CustomDropdown
          label="Mother's details"
          value={mother}
          onSelect={setMother}
          options={[
            "Homemaker",
            "Working Professional",
            "Business",
            "Retired",
            "Passed Away",
          ]}
        />

        <CustomDropdown
          label="Father’s details"
          value={father}
          onSelect={setFather}
          options={[
            "Working Professional",
            "Business",
            "Retired",
            "Passed Away",
          ]}
        />

        <CustomDropdown
          label="No. of Sisters"
          value={sisters}
          onSelect={setSisters}
          options={["0", "1", "2", "3+", "Prefer not to say"]}
        />

        <CustomDropdown
          label="No. of Brothers"
          value={brothers}
          onSelect={setBrothers}
          options={["0", "1", "2", "3+", "Prefer not to say"]}
        />

        {/* CONTINUE BUTTON */}
        <CustomButton
          title="Continue"
          paddingVertical={15}
          borderRadius={25}
          marginTop={40}
          disabled={!canContinue}
          backgroundColor={canContinue ? COLORS.primary : '#D3D3D3'}
          onPress={() => navigation.navigate("FamilyDetailsScreen2", {
            ...route.params,
            motherDetails: mother,
            fatherDetails: father,
            sistersCount: sisters,
            brothersCount: brothers,
          })}
        />

      </ScrollView>
    </View>
  );
};

export default FamilyDetailsScreen1;

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
});
