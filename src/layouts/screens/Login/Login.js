import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  Animated,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel-v4';
import { COLORS, FONTS } from '../../../utlis/comon';
import CustomButton from '../../components/CommonComponents/CustomButton';

const { width: screenWidth } = Dimensions.get('window');

const data = [
  {
    title: 'Algorithm',
    text: 'Users going through a vetting process to ensure you never match with bots.',
    image: 'https://picsum.photos/400/300?random=1',
  },
  {
    title: 'Matches',
    text: 'We match you with people that have a large array of similar interests',
    image: 'https://picsum.photos/400/300?random=2',
  },
  {
    title: 'Premium',
    text: 'Sign up today and enjoy the first month of premium benefits on us.',
    image: 'https://picsum.photos/400/300?random=3',
  },
];
//
const Login = () => {
  const [entries] = useState(data);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // animate OUT (zoom out + fade out)
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // switch text AFTER out animation
      setDisplayIndex(activeSlide);

      // reset values
      scaleAnim.setValue(1.2);
      fadeAnim.setValue(0);

      // animate IN (zoom in + fade in)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [activeSlide]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        containerCustomStyle={{ height: '50%' }}
        data={entries}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth * 0.6}
        layout="default"
        autoplay={true}
        // loop
        inactiveSlideScale={0.8}
        onSnapToItem={index => setActiveSlide(index)}
      />

      <View style={{ height: '50%', paddingHorizontal: 40 }}>
        <Animated.View
          style={{
            alignItems: 'center',
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontFamily: FONTS.RobotoSemiBold,
              color: '#E94057',
              paddingTop: 45,
              paddingBottom: 20,
            }}
          >
            {entries[displayIndex].title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: FONTS.RobotoMedium,
              color: '#323755',
              textAlign: 'center',
              paddingBottom: 20,
            }}
          >
            {entries[displayIndex].text}
          </Text>
        </Animated.View>

        {/* Pagination */}
        <Pagination
          dotsLength={entries.length}
          activeDotIndex={activeSlide}
          containerStyle={{ paddingVertical: 8 }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'red',
          }}
          inactiveDotStyle={{ backgroundColor: '#ccc' }}
          inactiveDotOpacity={0.6}
          inactiveDotScale={0.8}
        />

        <CustomButton
          title={'Create an account'}
          borderRadius={20}
          marginTop={30}
          paddingVertical={15}
        />

        <View style={styles.signIncontainer}>
          <Text style={{ color: COLORS.grey, fontFamily: FONTS.RobotoMedium }}>
            Already have an account ?
          </Text>
          <Text
            style={{
              color: COLORS.primary,
              fontFamily: FONTS.RobotoMedium,
              marginLeft: 5,
              textDecorationLine: 'underline',
            }}
          >
            Sign In
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  card: {
    borderRadius: 50,
    height: '100%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#fff',
    elevation: 15,
    shadowColor: COLORS.primaryShadow,
    margin: 1,
  },
  signIncontainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default Login;
