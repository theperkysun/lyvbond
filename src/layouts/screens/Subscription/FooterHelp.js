import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function FooterHelp() {
  return (
    <View style={styles.footer}>

      {/* Help Section Card */}
      <View style={styles.helpCard}>
        <Ionicons name="headset-outline" size={32} color={COLORS.primary} style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Still Need Help?</Text>
        <Text style={styles.sub}>
          We are right here to help you. Give us a call anytime between 10am to 7pm.
        </Text>

        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.phone}>Connect Support</Text>
        </TouchableOpacity>
        <Text style={styles.phoneNum}>+91-0000000000</Text>
      </View>

      {/* Links */}
      <View style={styles.linkRow}>
        <TouchableOpacity>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <View style={styles.dot} />
        <TouchableOpacity>
          <Text style={styles.linkText}>Terms of Use</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyright}>© {new Date().getFullYear()} LyvBond. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  helpCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#eee'
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    marginBottom: 8,
    color: '#000',
  },
  sub: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONTS.RobotoRegular,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  callBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4
  },
  phone: {
    fontSize: 16,
    fontFamily: FONTS.RobotoBold,
    color: '#fff',
  },
  phoneNum: {
    fontSize: 14,
    fontFamily: FONTS.RobotoMedium,
    color: '#888'
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  linkText: {
    fontSize: 14,
    fontFamily: FONTS.RobotoMedium,
    color: '#555',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 15
  },
  copyright: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: FONTS.RobotoRegular
  }
});
