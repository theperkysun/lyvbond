import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({ onMenuPress, onNotifyPress }) {
  return (
    <View style={styles.safeArea}>

      <View style={styles.container}>

        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>

        <Image
          source={require('../../../assets/images/LyvBondLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={onNotifyPress}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 0.7,
    borderBottomColor: '#e4e4e4',
  },
  logo: {
    width: 130,
    height: 35,
  },
});
