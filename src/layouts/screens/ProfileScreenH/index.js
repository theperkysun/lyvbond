import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import HeaderHome from '../../components/CommonComponents/HeaderHome';
import ProfileTopSection from './ProfileTopSection';
import VipCard from './VipCard';
import CompleteProfileSection from './CompleteProfileSection';
import PremiumMatchesSection from './PremiumMatchesSection';
import NewMatchesSection from './NewMatchesSection';
import RecentVisitorsSection from './RecentVisitorsSection';
import FooterSection from './FooterSection';
import { useAuth } from '../../../context/AuthContext';


export default function ProfileScreenH() {
  const { userInfo } = useAuth();
  const isInvited = userInfo?.isInvitedUser === true;

  return (
    <View style={styles.container}>
      <HeaderHome />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileTopSection />
        <VipCard />
        {/* <LiveMeetingCard />
        <CompleteProfileSection /> */}
        {!isInvited && <PremiumMatchesSection />}
        {!isInvited && <NewMatchesSection />}
        {!isInvited && <RecentVisitorsSection />}
        <FooterSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
