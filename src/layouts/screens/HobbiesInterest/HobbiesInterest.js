import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import CustomCard from './CustomCard';
import { COLORS, FONTS } from '../../../utlis/comon';

const HobbiesInterest = ({ navigation, route }) => {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (item) => {
    setSelected((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else {
        if (prev.length >= 5) {
          Alert.alert("Limit Reached", "You can only select up to 5 hobbies.");
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  const canContinue = selected.length >= 5;

  // CATEGORY DATA
  const creative = [
    { name: 'Writing', icon: 'pencil' },
    { name: 'Cooking', icon: 'silverware-fork-knife' },
    { name: 'Singing', icon: 'microphone' },
    { name: 'Photography', icon: 'camera' },
    { name: 'Playing instruments', icon: 'guitar-acoustic' },
    { name: 'Painting', icon: 'brush' },
    { name: 'DIY Crafts', icon: 'scissors-cutting' },
    { name: 'Calligraphy', icon: 'pen' },
    { name: 'Acting', icon: 'drama-masks' },
    { name: 'Dance', icon: 'dance-ballroom' },
    { name: 'Designing', icon: 'palette' },
  ];

  const fun = [
    { name: 'Movies', icon: 'filmstrip' },
    { name: 'Music', icon: 'music' },
    { name: 'Travelling', icon: 'airplane' },
    { name: 'Reading', icon: 'book-open' },
    { name: 'Sports', icon: 'basketball' },
    { name: 'Social media', icon: 'account-group' },
    { name: 'Gaming', icon: 'gamepad-variant' },
    { name: 'Nightlife', icon: 'glass-cocktail' },
    { name: 'Shopping', icon: 'shopping' },
    { name: 'Comedy', icon: 'emoticon-happy' },
  ];

  const fitness = [
    { name: 'Running', icon: 'run' },
    { name: 'Cycling', icon: 'bike' },
    { name: 'Yoga', icon: 'yoga' },
    { name: 'Meditation', icon: 'meditation' },
    { name: 'Walking', icon: 'walk' },
    { name: 'Workout', icon: 'weight-lifter' },
    { name: 'Trekking', icon: 'hiking' },
    { name: 'Gym', icon: 'dumbbell' },
  ];

  const others = [
    { name: 'Pets', icon: 'dog' },
    { name: 'Foodie', icon: 'food' },
    { name: 'Vegan', icon: 'leaf' },
    { name: 'News & Politics', icon: 'newspaper' },
    { name: 'Social Service', icon: 'handshake' },
    { name: 'Entrepreneurship', icon: 'briefcase' },
    { name: 'Home Decor', icon: 'sofa' },
    { name: 'Technology', icon: 'laptop' },
    { name: 'Crypto', icon: 'bitcoin' },
    { name: 'Cars', icon: 'car' },
    { name: 'Fashion', icon: 'tshirt-crew' },
  ];

  return (
    <View style={styles.container}>

      {/* Header with center logo */}
      <Header
        title=""
        logo={require('../../../assets/images/LyvBondLogo.png')}
        rightText="Skip →"
        onRightPress={() => navigation.navigate('FamilyDetailsScreen1', {
          ...route.params,
          hobbies: selected // Pass whatever is selected, or empty
        })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.mainTitle}>
          Now let's add{'\n'}your hobbies & interests
        </Text>

        <Text style={styles.subTitle}>
          This will help find better Matches
        </Text>

        {/* CARDS */}
        <CustomCard title="Creative" data={creative} selected={selected} onSelect={toggleSelect} />
        <CustomCard title="Fun" data={fun} selected={selected} onSelect={toggleSelect} />
        <CustomCard title="Fitness" data={fitness} selected={selected} onSelect={toggleSelect} />
        <CustomCard title="Other Interests" data={others} selected={selected} onSelect={toggleSelect} />

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <CustomButton
          title={`Save & continue (${selected.length}/5)`}
          paddingVertical={15}
          borderRadius={25}
          disabled={!canContinue}
          backgroundColor={canContinue ? COLORS.primary : '#d3d3d3'}
          onPress={() => navigation.navigate('FamilyDetailsScreen1', {
            ...route.params,
            hobbies: selected
          })}
        />
      </View>

    </View>
  );
};

export default HobbiesInterest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgcolor,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 20,
  },

  mainTitle: {
    fontSize: 26,
    fontFamily: FONTS.RobotoBold,
    textAlign: 'center',
    color: COLORS.black,
    marginTop: 10,
  },

  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.grey,
    marginBottom: 25,
  },

  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
  },
});
