import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../utlis/comon';

const CustomSelectionButton = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgcolor,
    borderWidth: 1,
    borderColor: COLORS.bordercolor,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 12,
  },
});

export default CustomSelectionButton;
