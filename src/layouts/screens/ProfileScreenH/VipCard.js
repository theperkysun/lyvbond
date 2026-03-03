import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';

export default function VipCard() {
  const navigation = useNavigation();
  const { userInfo } = useAuth();

  const isPremium = userInfo?.subscriptionType && userInfo?.subscriptionType !== "Free";
  const planName = userInfo?.subscriptionType || "Free Plan";
  const expiryDate = userInfo?.subscriptionEnd ? new Date(userInfo.subscriptionEnd).toLocaleDateString() : null;


  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <ImageBackground
          source={require('../../../assets/images/vip_bg.png')}
          style={styles.card}
          imageStyle={{ borderRadius: 24 }}
        >
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SubscriptionScreen', { openTab: 'assisted' })}
          >
            <Text style={styles.btnText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  cardContainer: {
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#fff',
  },
  card: {
    height: 180, // More compact height
    borderRadius: 24,
    padding: 24,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: FONTS.RobotoMedium,
    color: '#000',
  },
  btn: {
    marginTop: 12,
    backgroundColor: '#fff', // White button on colorful BG
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: COLORS.primary, // Primary text
    fontFamily: FONTS.RobotoBold,
    fontSize: 14
  },
  premiumCard: {
    height: 120,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 5,
  },
  expiryText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
