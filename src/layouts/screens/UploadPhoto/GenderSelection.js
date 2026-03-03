import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utlis/comon';
import { SELECTION_DATA } from "../../components/CommonComponents/selectionboxdata";
import CustomButton from '../../components/CommonComponents/CustomButton';
const GenderSelection = ({ profileFor, googleData }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  const navigation = useNavigation();

  const handleNext = () => {
    if (!selectedGender) {
      Alert.alert('Missing Field', 'Please select a gender before continuing.');
      return;
    }
    navigation.navigate('NameDob', { gender: selectedGender, profileFor, googleData });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Gender</Text>
      <View style={styles.optionContainer}>
        {SELECTION_DATA.gender.map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.option,
              selectedGender === gender && styles.optionSelected,
            ]}
            onPress={() => setSelectedGender(gender)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === gender && styles.optionTextSelected,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <CustomButton
        title="Next"
        paddingVertical={15}
        borderRadius={25}
        marginTop={35}
        onPress={handleNext}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    fontFamily: FONTS.RobotoBold,
    marginBottom: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    borderColor: COLORS.bordercolor,
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: COLORS.bgcolor,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.grey,
    fontFamily: FONTS.RobotoMedium,
  },
  optionTextSelected: {
    color: COLORS.selecttxtcolor,
  },
});

export default GenderSelection;
