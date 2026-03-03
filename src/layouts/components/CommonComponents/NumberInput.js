import React, { useState, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';

const NumberInput = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedFocus = useState(new Animated.Value(value ? 1 : 0))[0];

  useEffect(() => {
    Animated.timing(animatedFocus, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  // Floating label animation
  const labelStyle = {
    position: 'absolute',
    left: 18,
    top: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [22, -8],
    }),
    fontSize: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 13],
    }),
    color: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.grey, COLORS.primary],
    }),
    backgroundColor: COLORS.white,
    paddingHorizontal: 5,
    fontFamily: FONTS.RobotoMedium,
  };

  // Border color animation
  const borderColor = animatedFocus.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.bordercolor, COLORS.primary],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <Animated.Text style={labelStyle}>
          {label}
        </Animated.Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          selectionColor={COLORS.primary}
          style={[styles.input, inputStyle]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  inputWrapper: {
    borderWidth: 1.8,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    height: 65,
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: COLORS.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    fontSize: 17,
    color: COLORS.black,
    fontFamily: FONTS.RobotoMedium,
    marginTop: Platform.OS === 'ios' ? 12 : 10,
  },
});

export default NumberInput;
