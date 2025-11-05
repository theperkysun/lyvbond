import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FONTS } from '../../../utlis/comon';
import Header from '../../components/Header';
import ProfileCard from '../../components/HomScreenComponents/ProfileCard';
const DATA = [
  {
    name: 'Shizuka',
    place: 'Kolkata',
    url: require('../../../assets/images/photomain5.jpeg'),
  },
  {
    name: 'Shizuka',
    place: 'Kolkata',
    url: require('../../../assets/images/photomain4.jpeg'),
  },
  {
    name: 'Shizuka',
    place: 'Kolkata',
    url: require('../../../assets/images/photomain3.jpeg'),
  },
  {
    name: 'Shizuka',
    place: 'Kolkata',
    url: require('../../../assets/images/photomain.png'),
  },
  {
    name: ' Jessica Parker, 23',
    place: 'Kolkata',
    url: require('../../../assets/images/photoMain2.jpeg'),
  },
];
const HomeScreen = () => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [hearts, setHearts] = useState([]);
  const [cardIndex, setCardIndex] = useState(false);
  const swiperRef = useRef(null);
  // Star shake loop
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(loop, 2000);
      });
    };

    loop();
  }, [shakeAnim]);
  console.log('cardIndex', cardIndex);

  // Animate heart flying up
  const handleHeartPress = () => {
    const id = Date.now();
    const translateY = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(1);

    setHearts(prev => [...prev, { id, translateY, opacity, scale }]);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -400,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 2,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // remove after animation
      setHearts(prev => prev.filter(h => h.id !== id));
    });
  };
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create a continuous pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3, // scale up
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // scale back to original
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim]);
  return (
    <>
      <View style={{ flex: 1 }}>
        <Header
          title={'Discover'}
          subTitle={'Chicago, II'}
          icon={'tune'}
          // rightButton={'Spin'}
        />

        {/* Swiper */}
        <View>
          <View style={styles.container}>
            <Swiper
              containerStyle={{ marginTop: 0 }}
              cards={DATA}
              stackSize={2} // show current + next card
              stackSeparation={-30} // vertical offset between cards
              stackScale={0.95} // scale the next card
              renderCard={card => {
                return <ProfileCard card={card} />;
              }}
              infinite={false}
              previousCardDefaultPositionY={2}
              onSwipedAll={() => {
                console.log('onSwipedAll');
              }}
              cardIndex={0}
              backgroundColor={'#fff'}
              onSwiped={cardIndex => {
                console.log('cardIndex', cardIndex);
                console.log(' DATA.length', DATA.length - 2);
                if (cardIndex == DATA.length - 2) {
                  console.log('llllll');
                  setCardIndex(true);
                }

                if (cardIndex === DATA.length - 1) {
                  // Wait a tick to ensure ref is ready
                  setTimeout(() => {
                    if (swiperRef.current) {
                      swiperRef.current.jumpToCardIndex(DATA.length - 2);
                    }
                  }, 0);
                }
              }}
              onSwiping={(x, y) => {
                if (swiperRef.current) {
                  const currentIndex = swiperRef.current.state.cardIndex;
                  if (currentIndex === DATA.length - 1) {
                    swiperRef.current.jumpToCardIndex(DATA.length - 1); // lock last card
                  }
                }
              }}
              disableTopSwipe={cardIndex}
              disableBottomSwipe={cardIndex}
              disableLeftSwipe={cardIndex}
              disableRightSwipe={cardIndex}
            />
          </View>
        </View>
      </View>

      {/* Floating hearts */}
      {hearts.map(h => (
        <Animated.View
          key={h.id}
          style={{
            position: 'absolute',
            bottom: 120,
            alignSelf: 'center',
            zIndex: 999,
            transform: [{ translateY: h.translateY }, { scale: h.scale }],
            opacity: h.opacity,
          }}
        >
          <Icon name="favorite" size={40} color="#E94057" />
        </Animated.View>
      ))}

      {/* Bottom Buttons */}
      <View style={styles.bottomWrapper}>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.smallButton}>
            <Icon name="close" size={40} color={'#F27121'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHeartPress} style={styles.bigButton}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Icon name="favorite" size={60} color={'#fff'} />
            </Animated.View>
          </TouchableOpacity>

          {/* Shaking star button */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity
              onPress={() => console.log('hiii')}
              style={styles.smallButton}
            >
              <Icon name="star" size={30} color={'#8A2387'} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    marginTop: -10,
  },
  card: {
    borderRadius: 100,
  },

  bottomWrapper: {
    position: 'absolute',
    bottom: 30,
    zIndex: 999,
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#fff',
    height: 67,
    width: 67,
    borderRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#f56c7c',
  },
  bigButton: {
    backgroundColor: '#E94057',
    height: 90,
    width: 90,
    borderRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#f56c7c',
  },
});

export default HomeScreen;
