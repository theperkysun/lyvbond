import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FONTS } from '../../../utlis/comon';

const ProfileCard = ({ card }) => {
  return (
    <View style={styles.card}>
      <Image source={card.url} style={styles.image} />

      {/* Bottom Blur with Name + Place */}
      <View style={styles.bottomInfo}>
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={20}
          reducedTransparencyFallbackColor="red"
        >
          <Text style={styles.nameText}>
            {card.name},{'\n'}
            <Text style={styles.placeText}>{card.place}</Text>
          </Text>
        </BlurView>
      </View>

      {/* Top Left Location Tag */}
      <View style={styles.topLeftWrapper}>
        <View style={styles.locationTag}>
          <Icon color={'#fff'} name="location-on" size={20} />
          <Text style={styles.locationText}>1 KM</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 100,
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: 25,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    right: 0,
    height: 80,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  placeText: {
    color: '#fff',
    fontSize: 14,
    paddingTop: 22,
  },
  topLeftWrapper: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 0,
    height: 80,
    overflow: 'hidden',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5E5E60',
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: '25%',
    justifyContent: 'center',
    opacity: 0.6,
    borderRadius: 10,
  },
  locationText: {
    color: '#fff',
    fontFamily: FONTS.RobotoMedium,
  },
});

export default ProfileCard;
