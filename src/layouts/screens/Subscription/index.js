import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderSub from './HeaderSub';
import PremiumPlans from './PremiumPlans';
import AssistedPlans from './AssistedPlans';

import MoneyBackCard from './MoneyBackCard';
import FAQSection from './FAQSection';
import FooterHelp from './FooterHelp';

import { COLORS } from '../../../utlis/comon';
import LinearGradient from 'react-native-linear-gradient';

import { useAuth } from '../../../context/AuthContext';
import SubscriptionService from '../../../services/SubscriptionService';
import { useFocusEffect } from '@react-navigation/native';

export default function SubscriptionScreen({ navigation }) {
  const { userInfo, fetchCurrentUser } = useAuth();
  const currentPlanId = userInfo?.subscriptionPlan?._id || null;
  const purchasedPlansIds = userInfo?.activeSubscriptions?.map(s => s._id) || (userInfo?.subscriptionPlan ? [userInfo.subscriptionPlan._id] : []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCurrentUser();
    }, [fetchCurrentUser])
  );
  const [activeTab, setActiveTab] = useState('premium');
  const [premiumPlans, setPremiumPlans] = useState([]);
  const [assistedPlans, setAssistedPlans] = useState([]); // Placeholder for now
  const [loading, setLoading] = useState(true);

  const [vipBg, setVipBg] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await SubscriptionService.getPlans();
        if (res.success && Array.isArray(res.data)) {
          // 1. Map Premium Plans
          const mappedPremium = res.data
            .filter(plan => plan.group === 'premium')
            .map(plan => ({
              key: plan._id,
              title: plan.displayName,
              duration: `${Math.round(plan.durationDays / 30)} Months`,
              price: `₹ ${plan.price.amount}`,
              perMonth: plan.pricePerMonthText || `₹ ${Math.round(plan.price.amount / (plan.durationDays / 30))} / mo`,
              isBestValue: plan.badges && plan.badges.includes("BEST_VALUE"),
              features: [
                { text: plan.entitlements.chat.unlimitedMessages ? "Unlimited Messages" : "Limited Messages", disabled: !plan.entitlements.chat.unlimitedMessages },
                { text: `View up to ${plan.entitlements.contact.viewContactLimitTotal} Contacts`, disabled: false },
                { text: plan.entitlements.contact.unlimitedForAcceptedMatches ? "Unlimited for Accepted Matches" : "Standard Contact Views", disabled: !plan.entitlements.contact.unlimitedForAcceptedMatches },
                { text: plan.entitlements.profile.standoutBadge ? "Standout Profile Badge" : "Standout Profile", disabled: !plan.entitlements.profile.standoutBadge },
                { text: plan.entitlements.inbound.allowMatchesToContactDirectly ? "Let Matches Contact Directly" : "Direct Contact", disabled: !plan.entitlements.inbound.allowMatchesToContactDirectly },
              ]
            }));
          setPremiumPlans(mappedPremium);

          // 2. Map Assisted Plans
          const mappedAssisted = res.data
            .filter(plan => plan.group === 'assisted')
            .map(plan => ({
              title: plan.displayName,
              price: `₹ ${plan.price.amount}`,
              features: [
                { text: "Dedicated Relationship Manager" },
                { text: "Handpicked Matches" },
                { text: "Guaranteed Introductions" },
                { text: `View up to ${plan.entitlements.contact.viewContactLimitTotal} Contacts` }
              ]
            }));
          setAssistedPlans(mappedAssisted);
        }
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /* Fallback banner logic */
  const bannerSource = activeTab === 'premium'
    ? require('../../../assets/images/primium_ico_banner.png')
    : require('../../../assets/images/assisted_ico_banner.png');

  const themeColor = activeTab === 'premium' ? COLORS.primary : '#E6E6FA';

  return (
    <SafeAreaView style={styles.safe}>

      {/* FIXED HEADER */}
      <View style={[styles.headerFixed, { backgroundColor: themeColor }]}>
        <HeaderSub color={activeTab === 'premium' ? '#fff' : '#000'} />
      </View>

      {/* EVERYTHING BELOW SCROLLS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >

        {/* COLORED TOP + BANNER + TABS */}
        <View style={[styles.topSection, { backgroundColor: themeColor }]}>

          <Image source={bannerSource} style={styles.banner} resizeMode="cover" />

          {/* TABS */}
          <View style={styles.tabWrapper}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  styles.tabLeft,
                  activeTab === 'premium' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('premium')}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'premium' && styles.tabLabelActive,
                  ]}
                >
                  Premium
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  styles.tabRight,
                  activeTab === 'assisted' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('assisted')}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'assisted' && styles.tabLabelActive,
                  ]}
                >
                  Assisted
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* BODY CONTENT BELOW */}
        <LinearGradient
          colors={[themeColor, themeColor + '80', '#FFFFFF']}
          locations={[0, 0.4, 1]}
        >

          <View style={styles.body}>
            {/* Plans */}
            {activeTab === 'premium' ? (
              <PremiumPlans plansData={premiumPlans} navigation={navigation} purchasedPlansIds={purchasedPlansIds} currentPlanId={currentPlanId} />
            ) : (
              <AssistedPlans
                plansData={assistedPlans}
                logo={null}
              />
            )}

            {/* Text */}
            <Text style={styles.headingLine}>
              The safest, smartest & most secure matchmaking service in India
            </Text>

            {/* Money Back */}
            <MoneyBackCard />

            {/* FAQ */}
            <FAQSection />

            {/* Footer */}
            <FooterHelp />
          </View>

        </LinearGradient>

      </ScrollView>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* FIXED HEADER */
  headerFixed: {
    width: '100%',
    zIndex: 20,
  },

  topSection: {
    width: '100%',
    paddingBottom: 20,
    paddingTop: 0,  // makes room for fixed header
  },

  banner: {
    width: '100%',
    height: 165,
  },

  tabWrapper: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: -20,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 15,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  tabRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },

  tabButtonActive: {
    backgroundColor: '#FFF',
    elevation: 3,
  },

  tabLabel: {
    fontSize: 15,
    color: '#EEE',
    fontWeight: '600',
  },

  tabLabelActive: {
    color: '#000',
    fontWeight: '700',
  },

  body: {
    paddingTop: 10,
    paddingBottom: 40,
  },

  headingLine: {
    paddingHorizontal: 20,
    paddingTop: 20,
    fontSize: 17,
    color: '#444',
    textAlign: 'center',
  },
});
