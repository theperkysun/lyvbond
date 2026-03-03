import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

const ProfileInfoNote = () => {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoIconWrapper}>
        <Icon name="information-circle" size={18} color={COLORS.primary || '#E94057'} />
      </View>
      <Text style={styles.infoText}>
        LyvBond is built for genuine match-seekers. Any falsification, commercial
        use or marriage bureaus is strictly prohibited & may be reported to law enforcement.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F1',
    borderRadius: 10,
    padding: 14,
    borderColor: '#FFE3D9',
    borderWidth: 1,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  infoIconWrapper: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 15,
    color: '#6B6B6B',
    flex: 1,
    lineHeight: 18,
  },
});

export default ProfileInfoNote;
