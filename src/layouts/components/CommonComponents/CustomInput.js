import React, { useState, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
  inputStyle,
  RightAccessory, // New Prop
  onFocus, // Added prop
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

  // Animated styles (only dynamic parts)
  const animatedLabelStyle = {
    top: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 12],
    }),
    color: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.grey, COLORS.primary],
    }),
  };

  const animatedBorder = {
    borderColor: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.bordercolor, COLORS.primary],
    }),
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.inputWrapper, animatedBorder]}>
        {/* Label */}
        <Animated.Text style={[styles.label, animatedLabelStyle]}>
          {label || placeholder}
        </Animated.Text>

        {/* Input field */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.input,
            inputStyle,
            RightAccessory ? { paddingRight: 40 } : {} // Add padding for icon
          ]}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={() => {
            setIsFocused(true);
            if (onFocus) onFocus();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          selectionColor={COLORS.primary}
        />

        {/* Right Accessory (Icon) */}
        {RightAccessory && (
          <View style={styles.rightAccessoryContainer}>
            {RightAccessory}
          </View>
        )}

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  inputWrapper: {
    borderWidth: 1.8,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: COLORS.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    position: 'absolute',
    left: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    fontFamily: FONTS.RobotoMedium,
  },
  input: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: FONTS.RobotoMedium,
    marginTop: Platform.OS === 'ios' ? 10 : 12,
  },
  rightAccessoryContainer: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomInput;
