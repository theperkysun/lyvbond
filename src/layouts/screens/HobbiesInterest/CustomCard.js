import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../../utlis/comon';

const ITEMS_TO_SHOW = 6;

const CustomCard = ({ title, data, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? data : data.slice(0, ITEMS_TO_SHOW);

  return (
    <View style={styles.card}>
      {/* TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* OPTIONS */}
      <View style={styles.itemsContainer}>
        {visibleItems.map((item, index) => {
          const isSelected = selected.includes(item.name);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelect(item.name)}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={18}
                color={isSelected ? COLORS.white : COLORS.primary}
                style={{ marginRight: 6 }}
              />

              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? COLORS.white : COLORS.black },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* VIEW MORE / LESS */}
      {data.length > ITEMS_TO_SHOW && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.viewMoreContainer}
        >
          <Text style={styles.viewMoreText}>
            {expanded ? 'View Less' : 'View More'}
          </Text>

          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 22,
    padding: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },

  title: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: FONTS.RobotoBold,
    marginBottom: 12,
  },

  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.bordercolor,
    backgroundColor: COLORS.bgcolor,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },

  pillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  pillText: {
    fontSize: 14,
    fontFamily: FONTS.RobotoMedium,
  },

  viewMoreContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewMoreText: {
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 15,
    marginRight: 5,
  },
});
