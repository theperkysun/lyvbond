import React, { useState, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';

const LongTextInput = ({
  label,
  value,
  onChangeText,
  height = 180,
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

  const animatedLabelStyle = {
    top: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -10],
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
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedBorder, { height }]}>
        {/* Label */}
        <Animated.Text style={[styles.label, animatedLabelStyle]}>
          {label}
        </Animated.Text>

        {/* Big Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline={true}
          textAlignVertical="top"
          style={styles.textArea}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  box: {
    borderWidth: 1.8,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 28,
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
    paddingHorizontal: 5,
    fontFamily: FONTS.RobotoMedium,
  },
  textArea: {
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
    color: COLORS.black,
    flex: 1,
    lineHeight: 22,
    marginTop: Platform.OS === 'ios' ? 10 : 5,
  },
});

export default LongTextInput;
