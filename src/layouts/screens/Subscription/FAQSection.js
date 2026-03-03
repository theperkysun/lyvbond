import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

// if (Platform.OS === 'android') {
//   if (UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
//   }
// }

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      q: 'What are some of the benefits of Premium plans?',
      a: 'Premium members get better visibility, priority matches, and direct contact options.',
    },
    {
      id: 2,
      q: 'What offers and discounts can I avail?',
      a: 'New users may get special discounts. Offers vary by season.',
    },
    {
      id: 3,
      q: 'What payment options do you offer?',
      a: 'We support UPI, credit/debit cards, EMI, and wallets.',
    },
    {
      id: 4,
      q: 'How can I be safe on LyvBond?',
      a: 'Always verify profiles and never share personal financial details.',
    },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>Frequently Asked Questions</Text>

      {faqs.map((item) => {
        const isOpen = open === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, isOpen && styles.activeCard]}
            onPress={() => toggle(item.id)}
            activeOpacity={0.9}
          >
            <View style={styles.row}>
              <Text style={[styles.q, isOpen && styles.activeQ]}>{item.q}</Text>
              <View style={[styles.iconWrap, isOpen && styles.activeIconWrap]}>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isOpen ? '#fff' : '#666'}
                />
              </View>
            </View>

            {isOpen && (
              <View style={styles.answerWrap}>
                <View style={styles.divider} />
                <Text style={styles.answer}>{item.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: COLORS.primary,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  q: {
    fontSize: 15,
    fontFamily: FONTS.RobotoMedium,
    color: '#333',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  activeQ: {
    color: COLORS.primary,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrap: {
    backgroundColor: COLORS.primary,
  },
  answerWrap: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 10,
    marginTop: 5,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    fontFamily: FONTS.RobotoRegular,
    lineHeight: 20,
  },
});
