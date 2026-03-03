import React, { useRef, useState, useEffect } from "react";
import { View, Text, Animated, TouchableOpacity, StyleSheet } from "react-native";
import Swiper from "react-native-deck-swiper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MatchesProfileCard from "../../components/HomScreenComponents/MatchesProfileCard";
import MatchService from "../../../services/MatchService";

export default function MyMatchesBody() {
  const navigation = useNavigation();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const swiperRef = useRef(null);

  const [hearts, setHearts] = useState([]);
  const [cardIndex, setCardIndex] = useState(false);

  const [dailyUsers, setDailyUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Calculate Age
  const calculateAge = (dob) => {
    if (!dob || !dob.year) return "";
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(dob.year);
  };

  // Mapper
  const mapUserToCard = (user) => {
    let locationString = "Not Specified";
    if (user.location) {
      const { city, state, country } = user.location;
      locationString = [city, state, country].filter(Boolean).join(", ");
    }

    let formattedImages = [];
    if (Array.isArray(user.images) && user.images.length > 0) {
      formattedImages = user.images.map(img => typeof img === 'string' ? { uri: img } : img);
    } else if (user.profileImage) {
      formattedImages = [{ uri: user.profileImage }];
    }

    return {
      ...user,
      id: user._id,
      userId: user._id,
      name: user.name || user.firstName || "User",
      age: calculateAge(user.dob),
      img: user.profileImage ? { uri: user.profileImage } : null,
      url: user.profileImage,
      images: formattedImages,
      height: user.partnerPreferences?.heightRange || user.preferences?.height || user.partnerPreferences?.height || "N/A",
      location: locationString,
      work: user.education?.profession || user.education?.workType || "N/A",
      religion: user.partnerPreferences?.religion?.[0] || user.religiousInfo?.religion || "N/A",
    };
  };

  // Fetch Logic
  const fetchMatches = async () => {
    try {
      // Use SAME daily matches API as requested
      const data = await MatchService.getDailyMatches();
      if (data && data.matches) {
        setDailyUsers(data.matches.map(mapUserToCard));
      }
    } catch (error) {
      console.log("My Matches fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMatches();
    }, [])
  );

  const DATA = dailyUsers.length > 0 ? dailyUsers : [];

  // ⭐ SHAKING ANIMATION (Star button)
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start(() => setTimeout(loop, 2000));
    };
    loop();
  }, []);

  // ❤️ FLOATING HEARTS ANIMATION
  const handleHeartPress = () => {
    const id = Date.now();
    const translateY = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(1);

    setHearts(prev => [...prev, { id, translateY, opacity, scale }]);

    Animated.parallel([
      Animated.timing(translateY, { toValue: -400, duration: 1500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 2, duration: 1500, useNativeDriver: true }),
    ]).start(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    });
  };

  // ❤️ BIG HEART PULSE ANIMATION
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // --- BUTTON HANDLERS ---
  const handleLike = () => {
    swiperRef.current.swipeRight();
  };

  const handleDislike = () => {
    swiperRef.current.swipeLeft();
  };

  const handleSuperLike = () => {
    swiperRef.current.swipeTop();
  };

  if (!loading && DATA.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="person-off" size={80} color="#ccc" />
        <Text style={{ marginTop: 20, fontSize: 18, color: '#888' }}>No user present near you</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      {/* SWIPER AREA */}
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          containerStyle={{ marginTop: 0 }}
          cards={DATA}
          stackSize={2} // show current + next card
          stackSeparation={-30} // vertical offset between cards
          stackScale={0.95} // scale the next card
          renderCard={(card) => (
            <MatchesProfileCard
              card={card}
              onPress={() => navigation.navigate("UserDetailsScreen", { user: card })}
              showConnectButton={false}
              showOnlineStatus={false}
            />
          )}
          infinite={false}
          previousCardDefaultPositionY={2}
          onSwipedAll={() => {
            console.log('onSwipedAll');
          }}
          cardIndex={0}
          backgroundColor={'transparent'}
          onSwiped={index => {
            console.log('cardIndex', index);
            if (index === DATA.length - 2) {
              setCardIndex(true);
            }
            if (index === DATA.length - 1) {
              // Wait a tick to ensure ref is ready
              setTimeout(() => {
                if (swiperRef.current) {
                  swiperRef.current.jumpToCardIndex(DATA.length - 2);
                }
              }, 0);
            }
          }}
          onSwipedLeft={(index) => {
            console.log('Disliked');
            const user = DATA[index];
            if (user) {
              MatchService.swipeUser(user._id, 'dislike');
            }
          }}
          onSwipedRight={(index) => {
            console.log('Liked');
            handleHeartPress();
            const user = DATA[index];
            if (user) {
              MatchService.swipeUser(user._id, 'like');
            }
          }}
          onSwipedTop={(index) => {
            console.log('Super Liked');
            const user = DATA[index];
            if (user) {
              MatchService.swipeUser(user._id, 'superlike');
            }
          }}
          overlayLabels={{
            left: {
              element: <Icon name="close" size={80} color="red" />,
              style: {
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              element: <Icon name="favorite" size={80} color="green" />,
              style: {
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
            top: {
              element: <Icon name="star" size={80} color="#8A2387" />,
              style: {
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 30,
                },
              },
            },
          }}
          disableTopSwipe={cardIndex}
          disableBottomSwipe={cardIndex}
          disableLeftSwipe={cardIndex}
          disableRightSwipe={cardIndex}
        />
      </View>

      {/* FLOATING HEARTS */}
      {hearts.map(h => (
        <Animated.View
          key={h.id}
          style={{
            position: "absolute",
            bottom: 120,
            alignSelf: "center",
            transform: [{ translateY: h.translateY }, { scale: h.scale }],
            opacity: h.opacity,
            zIndex: 999,
          }}
        >
          <Icon name="favorite" size={40} color="#E94057" />
        </Animated.View>
      ))}

      {/* BOTTOM BUTTONS (EXACT ORIGINAL DESIGN) */}
      <View style={styles.bottomWrapper}>
        <View style={styles.bottomRow}>

          {/* ❌ DISLIKE BUTTON (orange border shadow exact like old design) */}
          <TouchableOpacity style={styles.smallButton} onPress={handleDislike}>
            <Icon name="close" size={40} color={"#F27121"} />
          </TouchableOpacity>

          {/* ❤️ LIKE BUTTON (big red pulsing) */}
          <TouchableOpacity onPress={handleLike} style={styles.bigButton}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Icon name="favorite" size={60} color={"#fff"} />
            </Animated.View>
          </TouchableOpacity>

          {/* ⭐ STAR BUTTON (shaking) */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity style={styles.smallButton} onPress={handleSuperLike}>
              <Icon name="star" size={30} color={"#8A2387"} />
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  swiperContainer: {
    flex: 1,
    marginTop: -10,
    overflow: 'visible',
    zIndex: 1,
  },

  bottomWrapper: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    zIndex: 999,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    alignItems: "center",
  },

  smallButton: {
    backgroundColor: "#fff",
    height: 67,
    width: 67,
    borderRadius: 300,
    alignItems: "center",
    justifyContent: "center",

    // ⭐ EXACT SAME SHADOW AS OLD CODE
    elevation: 5,
    shadowColor: "#f56c7c",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  bigButton: {
    backgroundColor: "#E94057",
    height: 90,
    width: 90,
    borderRadius: 300,
    alignItems: "center",
    justifyContent: "center",

    // ⭐ EXACT SAME SHADOW AS OLD BIG BUTTON
    elevation: 8,
    shadowColor: "#f56c7c",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
