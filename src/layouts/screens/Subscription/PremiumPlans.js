import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PremiumPlans({ plansData, navigation, currentPlanId, purchasedPlansIds = [] }) {
  const plans = (plansData && plansData.length > 0) ? plansData.map(p => {
    const numPrice = p.price ? parseInt(p.price.replace(/[^\d]/g, ''), 10) : 0;
    return {
      ...p,
      numericPrice: isNaN(numPrice) ? 0 : numPrice,
      permonth: p.perMonth,
      best: p.isBestValue
    };
  }) : [];

  const purchasedPlansData = plans.filter(pl => purchasedPlansIds.includes(pl.key) || pl.key === currentPlanId);
  const maxPurchasedPrice = purchasedPlansData.length > 0
    ? Math.max(...purchasedPlansData.map(pl => pl.numericPrice))
    : -1;

  if (plans.length === 0) {
    return (
      <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Plans...</Text>
      </View>
    );
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const CARD_HEIGHT = 460; // Increased height to provide buffer for shadows and spacing

  // Scroll to specific index
  const scrollToIndex = (index) => {
    if (index >= 0 && index < plans.length) {
      setActiveIndex(index);
      scrollRef.current?.scrollTo({ y: index * CARD_HEIGHT, animated: true });
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / CARD_HEIGHT);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: CARD_HEIGHT }}>

        {/* VERTICAL SCROLL VIEW - LEFT SIDE */}
        <View style={{ flex: 1, height: CARD_HEIGHT, overflow: 'hidden' }}>
          <ScrollView
            ref={scrollRef}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            snapToInterval={CARD_HEIGHT}
            snapToAlignment="center"
            disableIntervalMomentum={true} // Forces stop at next interval
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            onScrollEndDrag={(e) => {
              // Fallback: Ensure we update index if interactions end without momentum (rare with disableIntervalMomentum)
              handleScroll(e);
            }}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {plans.map((p, index) => (
              <View key={p.key} style={[styles.cardContainer, { height: CARD_HEIGHT }]}>
                <View style={[styles.card, p.best && styles.bestValueCard]}>

                  {/* BEST VALUE BADGE */}
                  {p.best && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>BEST VALUE</Text>
                    </View>
                  )}

                  {/* HEADER ROW */}
                  <View style={styles.headerRow}>
                    <View>
                      <Text style={[styles.planTitle, p.best && styles.textWhite]}>{p.title}</Text>
                      <Text style={[styles.planDuration, p.best && styles.textWhiteOpacity]}>{p.duration}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.priceText, p.best && styles.textWhite]}>{p.price}</Text>
                      <Text style={[styles.pricePerMonth, p.best && styles.textWhiteOpacity]}>{p.permonth}</Text>
                    </View>
                  </View>

                  {/* DIVIDER */}
                  <View style={[styles.divider, p.best && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />

                  {/* FEATURES */}
                  <View style={styles.features}>
                    {p.features.slice(0, 4).map((f, i) => ( // Limit features to fit or use internal scroll if many
                      <Feature key={i} text={f.text} disabled={f.disabled} isBest={p.best} />
                    ))}
                  </View>

                  {/* BUTTON */}
                  {purchasedPlansIds.includes(p.key) || currentPlanId === p.key ? (
                    <View style={styles.currentPlanContainer}>
                      <Ionicons name="checkmark-circle" size={32} color={p.best ? "#fff" : COLORS.primary} />
                      <Text style={[styles.currentPlanText, p.best && styles.textWhite]}>Current Plan</Text>
                    </View>
                  ) : p.numericPrice > maxPurchasedPrice ? (
                    <TouchableOpacity
                      style={[styles.continueBtn, p.best ? styles.btnWhite : styles.btnPrimary]}
                      onPress={() => navigation.navigate('PaymentScreen', { plan: p })}
                    >
                      <Text style={[styles.continueText, p.best ? styles.textPrimary : styles.textWhite]}>
                        {maxPurchasedPrice >= 0 ? "Upgrade Now" : "Select Plan"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ height: 50 }} /> // Placeholder to maintain card height for hidden buttons
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* SIDE BUTTONS - RIGHT SIDE */}
        <View style={styles.sideControls}>
          <TouchableOpacity
            style={[styles.controlBtn, activeIndex === 0 && styles.disabledBtn]}
            onPress={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
          >
            <Ionicons name="chevron-up" size={24} color={activeIndex === 0 ? "#ccc" : "#000"} />
          </TouchableOpacity>

          <View style={styles.dotsContainer}>
            {plans.map((_, i) => (
              <View key={i} style={[styles.dot, activeIndex === i ? styles.activeDot : styles.inactiveDot]} />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.controlBtn, activeIndex === plans.length - 1 && styles.disabledBtn]}
            onPress={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === plans.length - 1}
          >
            <Ionicons name="chevron-down" size={24} color={activeIndex === plans.length - 1 ? "#ccc" : "#000"} />
          </TouchableOpacity>
        </View>

      </View >
    </View >
  );
}

function Feature({ text, disabled, isBest }) {
  const iconColor = disabled ? (isBest ? 'rgba(255,255,255,0.3)' : '#ccc') : (isBest ? '#fff' : COLORS.primary);
  const textColor = disabled ? (isBest ? 'rgba(255,255,255,0.5)' : '#aaa') : (isBest ? '#fff' : '#333');

  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={18} color={iconColor} />
      <Text style={[styles.featureText, { color: textColor, textDecorationLine: disabled ? 'line-through' : 'none' }]}>
        {text}
      </Text>
    </View>
  );
}



const styles = StyleSheet.create({

  container: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 8 // Reduced padding to give card more width
  },

  cardContainer: {
    justifyContent: 'center',
    paddingVertical: 30, // LARGE Vertical padding to create gap between cards and prevent shadow clipping
  },

  card: {
    flex: 1, // Fill container height (minus padding)
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginRight: 8, // Minimal right margin
    elevation: 6, // Increased elevation for pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  /* SIDE CONTROLS - Modern Floating Bar */
  sideControls: {
    width: 30, // Reduced width
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    height: '100%',
    alignSelf: 'center',
    marginLeft: 4,
  },

  controlBtn: {
    width: 32, // Reduced size
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 10,
    marginTop: 10,
  },

  disabledBtn: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
    elevation: 1
  },

  dotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Increased gap for distinct steps
    flex: 1, // Allow it to take available space
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },

  activeDot: {
    backgroundColor: COLORS.primary,
    height: 24, // Long pill shape for active
    width: 8,
    borderRadius: 4,
  },

  inactiveDot: {
    backgroundColor: '#D1D1D6'
  },

  bestValueCard: {
    backgroundColor: COLORS.primary, // Or use a gradient if you can refactor to LinearGradient component
    borderColor: COLORS.primary,
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    transform: [{ scale: 1.02 }] // Slightly larger
  },

  bestBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#FFD700', // Gold
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 2
  },

  bestBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15
  },

  planTitle: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    color: '#000',
    marginBottom: 4
  },

  planDuration: {
    fontSize: 13,
    fontFamily: FONTS.RobotoMedium,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  priceText: {
    fontSize: 24,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.primary,
  },

  pricePerMonth: {
    fontSize: 12,
    color: '#888',
    fontFamily: FONTS.RobotoRegular
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 15,
    width: '100%'
  },

  features: {
    marginBottom: 20,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Tighter spacing
  },

  featureText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: FONTS.RobotoRegular,
    flex: 1,
  },

  continueBtn: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },

  btnPrimary: {
    backgroundColor: COLORS.primary,
  },

  btnWhite: {
    backgroundColor: '#fff',
  },

  continueText: {
    fontSize: 16,
    fontFamily: FONTS.RobotoBold,
  },

  textPrimary: {
    color: COLORS.primary,
  },

  textWhite: {
    color: '#fff',
  },

  textWhiteOpacity: {
    color: 'rgba(255,255,255,0.8)'
  },

  currentPlanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10
  },

  currentPlanText: {
    fontSize: 18,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.primary,
    marginLeft: 10
  }
});
