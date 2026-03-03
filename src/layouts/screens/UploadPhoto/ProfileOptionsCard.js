import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../utlis/comon';
import CustomSelectionButton from '../../components/CommonComponents/CustomSelectionButton'; // ⬅ new import

const options = [
  { label: 'Myself', icon: 'person' },
  { label: 'My Son', icon: 'man' },
  { label: 'My Daughter', icon: 'woman' },
  { label: 'My Brother', icon: 'male' },
  { label: 'My Sister', icon: 'female' },
  { label: 'My Friend', icon: 'people' },
  { label: 'My Relative', icon: 'people-circle' },
];

const ProfileOptionsCard = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (label) => {
    setSelected(label);
    onSelect(label);
  };

  return (
    <View style={styles.optionContainer}>
      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.8}
          onPress={() => handleSelect(item.label)}
        >
          <CustomSelectionButton
            style={[
              styles.option,
              selected === item.label && styles.optionSelected,
            ]}
          >
            <Icon
              name={item.icon}
              size={18}
              color={
                selected === item.label ? COLORS.white : COLORS.primary
              }
              style={{ marginRight: 8 }}
            />

            <Text
              style={[
                styles.optionText,
                selected === item.label && styles.optionTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </CustomSelectionButton>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },

  // These styles overwrite CustomSelectionButton as needed
  option: {
    // NOTHING changed — same as before
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.grey,
  },
  optionTextSelected: {
    color: COLORS.selecttxtcolor,
  },
});

export default ProfileOptionsCard;
