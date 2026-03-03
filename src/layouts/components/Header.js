//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS } from '../../utlis/comon';
import Icon from 'react-native-vector-icons/MaterialIcons';
// create a component
const Header = ({ title, subTitle, icon, rightButton, onBack }) => {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={onBack ? onBack : () => console.log('Back button pressed')}
        style={styles.iconButton}
      >
        <Icon name="arrow-back-ios" size={25} color="#E94057" />
      </TouchableOpacity>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            color: '#000',
            fontSize: 24,
            fontFamily: 'Roboto-Medium',
          }}
        >
          {title}
        </Text>
        {subTitle ? (
          <Text
            style={{
              color: 'grey',
              fontSize: 14,
              fontFamily: FONTS.RobotoRegular,
            }}
          >
            {subTitle}
          </Text>
        ) : undefined}
      </View>
      {icon ? (
        <TouchableOpacity style={styles.iconButton}>
          {icon ? <Icon name="tune" size={25} color="#E94057" /> : undefined}
        </TouchableOpacity>
      ) : undefined}
      {rightButton ? (
        <TouchableOpacity>
          <Text
            style={{
              color: '#E94057',
              fontFamily: FONTS.RobotoMedium,
              fontSize: 16,
            }}
          >
            {rightButton}
          </Text>
        </TouchableOpacity>
      ) : undefined}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  iconButton: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    alignSelf: 'center',
    borderRadius: 10,
    borderColor: '#E8E6EA',
  },
});

//make this component available to the app
export default Header;
