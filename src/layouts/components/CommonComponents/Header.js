import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../../utlis/comon';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = ({ title, logo, onBackPress, rightText, onRightPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* 1. Top SafeArea Filler (Square, Primary Color) */}
      <View style={{ height: insets.top, backgroundColor: COLORS.primary }} />

      {/* 2. Actual Header (Curved Bottom, Primary Color) */}
      <View style={styles.headerContainer}>

        {/* Left back button */}
        {onBackPress ? (
          <TouchableOpacity onPress={onBackPress} style={styles.left}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.left} />
        )}

        {/* CENTER LOGO OR TITLE */}
        <View style={styles.center}>
          {logo ? (
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.headerTitle}>{title}</Text>
          )}
        </View>

        {/* RIGHT SKIP */}
        {rightText ? (
          <TouchableOpacity onPress={onRightPress} style={styles.right}>
            <Text style={styles.rightText}>{rightText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.right} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // Important for curves to show
    zIndex: 100,
  },
  headerContainer: {
    height: 60,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20, // Curve
    borderBottomRightRadius: 20, // Curve
    paddingBottom: 8,
    //elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  left: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  center: {
    flex: 1,
    alignItems: 'center',
  },

  right: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.RobotoMedium,
  },

  rightText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.RobotoMedium,
  },

  logo: {
    width: 120,
    height: 35,
  },
});

export default Header;
