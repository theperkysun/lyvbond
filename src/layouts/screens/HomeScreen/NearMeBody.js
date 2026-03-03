import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Animated, TouchableOpacity, StyleSheet, TextInput, Text, Modal, Switch, ActivityIndicator, Alert, Platform, PermissionsAndroid } from "react-native";
import Swiper from "react-native-deck-swiper";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MatchesProfileCard from "../../components/HomScreenComponents/MatchesProfileCard";
import Slider from '@react-native-community/slider';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { BASE_URL } from "../../../config/apiConfig";
import { COLORS, FONTS } from "../../../utlis/comon";

export default function NearMeBody() {
  const navigation = useNavigation();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const swiperRef = useRef(null);

  // State Initialization
  const [hearts, setHearts] = useState([]);
  const [cardIndex, setCardIndex] = useState(false);
  const [location, setLocation] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Logic
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [range, setRange] = useState(5); // Default 5km
  const [includeGlobal, setIncludeGlobal] = useState(false);

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
      if (typeof user.location === 'string') {
        locationString = user.location;
      } else {
        const { city, state, country } = user.location;
        locationString = [city, state, country].filter(Boolean).join(", ");
      }
    }

    let allImages = [];
    if (user.profileImage) {
      allImages.push(user.profileImage);
    }
    if (Array.isArray(user.images)) {
      user.images.forEach(img => {
        const imgUrl = typeof img === 'object' ? img.uri : img;
        if (imgUrl && !allImages.includes(imgUrl)) {
          allImages.push(imgUrl);
        }
      });
    }

    let formattedImages = allImages.map(img => ({ uri: img }));

    return {
      id: user._id,
      userId: user._id,
      name: user.name || user.firstName || "User",
      age: calculateAge(user.dob),
      img: user.profileImage ? { uri: user.profileImage } : null,
      url: user.profileImage, // For gallery array
      images: formattedImages,
      height: user.partnerPreferences?.heightRange || user.preferences?.height || user.partnerPreferences?.height || "N/A",
      // Pass complete user object, but override mapped fields
      ...user,
      location: locationString,
      work: user.education?.profession || user.education?.workType || "N/A",
      religion: user.partnerPreferences?.religion?.[0] || user.religiousInfo?.religion || "N/A",
    };
  };

  // Temporary state for the modal (prevents auto-refresh while adjusting)
  const [modalRange, setModalRange] = useState(5);
  const [modalIncludeGlobal, setModalIncludeGlobal] = useState(false);

  // --- FETCH DATA ---
  const fetchNearbyMatches = async (currentRange, isGlobal) => {
    setLoading(true);
    let coords = null;

    // 1. Get Location & Update DB
    try {
      const getPosition = () => new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
        );
      });

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          coords = await getPosition();
        }
      } else {
        Geolocation.requestAuthorization();
        coords = await getPosition();
      }

      if (coords) {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Update Location in DB
          await axios.post(`${BASE_URL}/user/location`, {
            latitude: coords.latitude,
            longitude: coords.longitude
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
      }
    } catch (locErr) {
      console.log("Location fetch error:", locErr);
      // Proceed even if location fetch fails (will show modal if needed)
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const params = {
        range: currentRange,
        includeGlobal: isGlobal
      };

      // Add dynamic coords if available
      if (coords) {
        params.lat = coords.latitude;
        params.lon = coords.longitude;
      }

      const response = await axios.get(`${BASE_URL}/user/matches/nearby`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const mappedData = response.data.data.map(mapUserToCard);
        setData(mappedData);

        // "default first time user it will show of 5 KM distance if within that range no user present then a popup will open"
        if (response.data.data.length === 0 && currentRange === 5 && !isGlobal) {
          setModalRange(currentRange);
          setModalIncludeGlobal(isGlobal);
          setShowFilterModal(true);
        }
      }
    } catch (error) {
      console.log("Error fetching nearby matches:", error);
      if (error.response && error.response.status === 400) {
        // Likely location missing or bad params
        const msg = error.response.data.message || "Please update your location.";
        Alert.alert("Location Not Found", msg, [
          { text: "Cancel", style: "cancel" },
          { text: "Open Filter", onPress: openFilters }
        ]);
      } else {
        Alert.alert("Error", "Failed to fetch nearby matches.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch on Focus
  useFocusEffect(
    useCallback(() => {
      fetchNearbyMatches(range, includeGlobal);
    }, [range, includeGlobal])
  );

  // Filtered Data based on Search Bar
  const filteredData = React.useMemo(() => {
    if (!location) return data;
    return data.filter(item =>
      item.location && item.location.toLowerCase().includes(location.toLowerCase())
    );
  }, [data, location]);

  // SHAKING ANIMATION (Star button)
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

  // BIG HEART PULSE ANIMATION
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // FLOATING HEARTS ANIMATION
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

  const openFilters = () => {
    setModalRange(range);
    setModalIncludeGlobal(includeGlobal);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    setRange(modalRange);
    setIncludeGlobal(modalIncludeGlobal);
    // fetchNearbyMatches will be triggered automatically by useFocusEffect when range/includeGlobal changes
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      {/* LOCATION SEARCH BAR & FILTER ICON */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="location-sharp" size={20} color="#E94057" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search Location..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity onPress={openFilters}>
            <Ionicons name="options-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ERROR / EMPTY STATE */}
      {filteredData.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="person-off" size={80} color="#ccc" />
          <Text style={{ marginTop: 20, fontSize: 18, color: '#888', textAlign: 'center', paddingHorizontal: 20 }}>
            {data.length === 0
              ? (includeGlobal ? "No users found nearby." : "No users in this range.")
              : `No users found matching "${location}"`}
          </Text>
          <TouchableOpacity style={styles.changeRangeBtn} onPress={openFilters}>
            <Text style={styles.changeRangeText}>Change Range</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* SWIPER AREA */
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            containerStyle={{ marginTop: 0 }}
            cards={filteredData}
            stackSize={2}
            stackSeparation={-30}
            stackScale={0.95}
            cardVerticalMargin={0}
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
            backgroundColor={'transparent'}
            onSwipedLeft={(index) => {
              const user = filteredData[index];
              if (user) {
                MatchService.swipeUser(user._id, 'dislike');
              }
            }}
            onSwipedRight={(index) => {
              handleHeartPress();
              const user = filteredData[index];
              if (user) {
                MatchService.swipeUser(user._id, 'like');
              }
            }}
            onSwipedTop={(index) => {
              const user = filteredData[index];
              if (user) {
                MatchService.swipeUser(user._id, 'superlike');
              }
            }}
            overlayLabels={{
              left: {
                element: <Icon name="close" size={80} color="red" />,
                style: { wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 } },
              },
              right: {
                element: <Icon name="favorite" size={80} color="green" />,
                style: { wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 } },
              },
            }}
          />
        </View>
      )}

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

      {/* BOTTOM BUTTONS - Only show if data exists */}
      {filteredData.length > 0 && (
        <View style={styles.bottomWrapper}>
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.smallButton} onPress={handleDislike}>
              <Icon name="close" size={40} color={"#F27121"} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLike} style={styles.bigButton}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Icon name="favorite" size={60} color={"#fff"} />
              </Animated.View>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TouchableOpacity style={styles.smallButton} onPress={handleSuperLike}>
                <Icon name="star" size={30} color={"#8A2387"} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}

      {/* FILTER MODAL */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Discovery Settings</Text>

            {/* Range Slider */}
            <Text style={styles.label}>Maximum Distance: {modalRange} km</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={200}
              step={1}
              value={modalRange}
              onValueChange={setModalRange}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#000000"
              thumbTintColor={COLORS.primary}
              disabled={modalIncludeGlobal} // Disable if global is on? "if the user turn on that toggle then it will not follw the silder" -> Yes.
            />

            {/* Global Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Show People further away</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.primaryShadow }}
                thumbColor={modalIncludeGlobal ? COLORS.primary : "#f4f3f4"}
                onValueChange={(val) => {
                  setModalIncludeGlobal(val);
                  // If turned on, maybe visually disable slider or set text
                }}
                value={modalIncludeGlobal}
              />
            </View>
            <Text style={styles.helperText}>
              {modalIncludeGlobal ? "Searching globally (nearest first)" : "Searching within designated range"}
            </Text>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFilterModal(false)}>
              <Text style={[styles.applyButtonText, { color: '#666' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  swiperContainer: {
    flex: 1,
    marginTop: 40,
    overflow: 'visible',
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 2,
    zIndex: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 10,
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
    elevation: 8,
    shadowColor: "#f56c7c",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
    fontFamily: FONTS.RobotoMedium
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center'
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  cancelButton: {
    paddingVertical: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.RobotoBold,
  },
  changeRangeBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 20
  },
  changeRangeText: {
    color: '#fff',
    fontFamily: FONTS.RobotoBold
  }
});
