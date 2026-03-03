import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS } from '../../../utlis/comon';

const PreferenceCard = ({ title, items, iconColor, onItemPress, children }) => {
  return (
    <View style={styles.cardContainer}>

      {/* SECTION TITLE WITH DECORATION */}
      <View style={styles.headerRow}>
        <View style={[styles.decorBar, { backgroundColor: iconColor }]} />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.cardContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.row,
              index === items.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
              index === 0 && { paddingTop: 0 }
            ]}
            activeOpacity={0.7}
            onPress={() => onItemPress && onItemPress(item)}
          >

            {/* LEFT GRADIENT ICON */}
            <LinearGradient
              colors={[iconColor, iconColor + '80']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={COLORS.white}
              />
            </LinearGradient>

            {/* LABEL + VALUE */}
            <View style={styles.textContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value} numberOfLines={1}>{item.value}</Text>
            </View>

            {/* RIGHT ARROW */}
            <View style={styles.arrowContainer}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#bbb"
              />
            </View>

          </TouchableOpacity>
        ))}

        {/* RENDER CUSTOM CHILDREN IF ANY */}
        {children}
      </View>
    </View>
  );
};

export default PreferenceCard;

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 25,
    marginHorizontal: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 4,
  },
  decorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.RobotoBold,
    color: '#333',
    letterSpacing: 0.5,
  },

  cardContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  textContainer: {
    flex: 1,
    paddingRight: 10
  },

  label: {
    fontSize: 12,
    color: '#999',
    fontFamily: FONTS.RobotoMedium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  value: {
    fontSize: 16,
    fontFamily: FONTS.RobotoBold,
    color: '#333',
  },

  arrowContainer: {
    backgroundColor: '#f9f9f9',
    padding: 6,
    borderRadius: 10,
  }
});
