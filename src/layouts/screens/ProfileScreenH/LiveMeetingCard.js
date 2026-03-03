import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function LiveMeetingCard({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      {/* TOP IMAGE BACKGROUND */}
      <ImageBackground
        source={require('../../../assets/images/live_card_bg.png')}
        style={styles.banner}
        imageStyle={{ borderRadius: 12 }}
      />

      {/* WHITE SECTION BELOW */}
      <View style={styles.cardContent}>
        
        {/* DATE + TITLE + TIME */}
        <View style={styles.row}>
          {/* Date Box */}
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>18</Text>
            <Text style={styles.dateMonth}>NOV</Text>
          </View>

          {/* Event Info */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>Hindi Singles</Text>

            {/* Time Row */}
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={16} color="#4a4a4a" />
              <Text style={styles.timeText}>7:59 pm – 9:00 pm</Text>
            </View>

            {/* Add to Calendar */}
            <Text style={styles.addCalendar}>Add to Calendar</Text>
          </View>
        </View>

        {/* CONFIRMED USERS + CTA */}
        <View style={styles.confirmRow}>
          <View style={styles.avatarRow}>
            <Image
              source={require('../../../assets/images/profileimage.png')}
              style={styles.avatar}
            />
            <Image
              source={require('../../../assets/images/profileimage.png')}
              style={[styles.avatar, { marginLeft: -12 }]}
            />
            <Image
              source={require('../../../assets/images/profileimage.png')}
              style={[styles.avatar, { marginLeft: -12 }]}
            />
          </View>

          {/* CTA Button */}
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>Yes, I'll Be There!</Text>
            </TouchableOpacity>

            <Text style={styles.daysLeft}>5 Days Left!</Text>
          </View>
        </View>

        {/* BOTTOM OPTIONS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.bottomOption}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#525252" />
            <Text style={styles.bottomText}>View more events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomOption}>
            <Ionicons name="time-outline" size={18} color="#525252" />
            <Text style={styles.bottomText}>Event History</Text>
          </TouchableOpacity>
        </View>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 18,
    marginTop: 18,
    height: 250,
    borderRadius: 12,
  },

  cardContent: {
    marginHorizontal: 18,
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: -12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateBox: {
    width: 55,
    height: 60,
    backgroundColor: '#FFEFCC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateDay: {
    fontSize: 20,
    fontFamily: FONTS.RobotoMedium,
    color: '#000',
  },

  dateMonth: {
    fontSize: 12,
    color: '#888',
    marginTop: -3,
  },

  title: {
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
    color: '#000',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4a4a4a',
  },

  addCalendar: {
    marginTop: 4,
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.RobotoMedium,
  },

  confirmRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  ctaButton: {
    backgroundColor: '#FF4D6D',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  ctaText: {
    color: COLORS.white,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 13,
  },

  daysLeft: {
    color: '#ff6e7c',
    marginTop: 4,
    fontSize: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  bottomOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bottomText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#525252',
    fontFamily: FONTS.RobotoMedium,
  },
});
