import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../../utlis/comon';

export default function HeaderSub({ color = '#fff' }) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  return (
    <View style={styles.header}>
      {/* SHOW BACK BUTTON ONLY IF WE CAN GO BACK */}
      {canGoBack ? (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={color} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 30 }} />
      )}
      <Text style={[styles.title, { color }]} >
        Upgrade to Premium
      </Text>
      {/* SPACER TO BALANCE TITLE CENTERING */}
      <View style={{ width: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20, // Extra padding for the curve
  },

  backBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontFamily: FONTS.RobotoMedium,
  },
});