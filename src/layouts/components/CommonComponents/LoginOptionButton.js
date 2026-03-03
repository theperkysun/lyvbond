import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

// create a component
const LoginOptionButton = ({ title, iconName, iconColor, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonContainer} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.bordercolor,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    backgroundColor: COLORS.white,
  },
  iconContainer: {
    position: 'absolute',
    left: 25,
  },
  buttonText: {
    fontFamily: FONTS.RobotoMedium,
    fontSize: 16,
    color: COLORS.black,
  },
});

export default LoginOptionButton;
