import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function CompleteProfileSection({ onAstroPress }) {
  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.heading}>Complete your Profile</Text>

      {/* Subtitle */}
      <Text style={styles.subText}>
        Completed Profiles get 2x more Connects and responses
      </Text>

      {/* Add Astro Details */}
      <TouchableOpacity style={styles.row} onPress={onAstroPress}>
        <Ionicons name="star-outline" size={22} color="#333" />

        <Text style={styles.rowText}>Add Astro details</Text>

        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    marginHorizontal: 18,
    marginTop: 20,
    paddingBottom: 12,
    borderBottomColor: '#ececec',
    borderBottomWidth: 1,
  },

  heading: {
    fontSize: 18,
    fontFamily: FONTS.RobotoMedium,
    color: '#000',
  },

  subText: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },

  row: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#eaeaea',
    borderBottomWidth: 1,
  },

  rowText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#000',
    fontFamily: FONTS.RobotoMedium,
  },
});
