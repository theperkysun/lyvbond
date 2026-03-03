import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
// create a component
const CustomButton = ({ title, paddingVertical, borderRadius, marginTop, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.primary,
        paddingVertical: paddingVertical,
        alignItems: 'center',
        borderRadius: borderRadius,
        marginTop: marginTop,
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.RobotoMedium,
          color: '#fff',
          fontSize: 18,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

export default CustomButton;
