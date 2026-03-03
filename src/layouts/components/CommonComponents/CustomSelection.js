import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

const CustomSelection = ({ title, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardActive]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View style={[styles.radio, selected && styles.radioActive]}>
          {selected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>

        <Text style={[styles.label, selected && styles.labelActive]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomSelection;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.6,
    borderColor: COLORS.bordercolor,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    elevation: 1,
  },

  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE7EB',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  radioActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  label: {
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
    color: COLORS.black,
  },

  labelActive: {
    color: COLORS.primary,
  },
});
