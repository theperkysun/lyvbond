import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Image,
} from "react-native";

import { COLORS, FONTS } from "../../../utlis/comon";
import Header from "../../components/CommonComponents/Header";
import PreferenceCard from "./PreferenceCard";

import {
  AGE_RANGES,
  HEIGHT_RANGES,
  MARITAL_STATUS,
  RELIGIONS,
  COMMUNITIES,
  MOTHER_TONGUES,
  SUGGESTED_CITIES,
  COUNTRIES,
  STATES,
  CITIES,
  QUALIFICATIONS,
  WORKING_WITH,
  PROFESSIONS,
  INCOMES,
  PROFILE_MANAGED_BY,
  DIET,
} from "./data";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useAuth } from '../../../context/AuthContext';
import { Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const PreferencesOverview = ({
  navigation,
  route
}) => {
  const { userToken, setUserToken, setUserInfo } = useAuth();
  const fromMenu = route?.params?.fromMenu;

  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Fetch data if fromMenu (Edit Mode)
  // Changed to useEffect to run ONLY ONCE on mount. 
  // useFocusEffect was causing data to re-fetch and overwrite local changes when returning from child screens.
  useEffect(() => {
    if (fromMenu && userToken) {
      fetchPreferences();
    }
  }, [fromMenu, userToken]);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const user = response.data.user;
      if (user && user.partnerPreferences) {

        let prefs = { ...user.partnerPreferences };

        // SANITIZE: Handle Legacy Height Range (String -> Array)
        if (prefs.heightRange && typeof prefs.heightRange === 'string') {
          console.log("Legacy Height Range Detected:", prefs.heightRange);
          prefs.heightRange = parseHeightRange(prefs.heightRange);
        }

        // Merge existing preferences with state
        setData(prev => ({
          ...prev,
          ...prefs
        }));
      }
    } catch (error) {
      console.error("Fetch Preferences Error:", error);
    }
  };

  // Helper to parse "5'0" - 6'1"" back to [60, 73]
  const parseHeightRange = (str) => {
    try {
      if (!str.includes("-")) return [60, 72]; // Fallback default
      const parts = str.split("-").map(s => s.trim());

      const parsePart = (val) => {
        // Check if it has feet/inches format (e.g. 5'0")
        if (val.includes("'")) {
          const [ft, inch] = val.replace('"', '').split("'");
          return (parseInt(ft) * 12) + (parseInt(inch) || 0);
        }
        return parseInt(val); // Assume raw number if no '
      };

      return [parsePart(parts[0]), parsePart(parts[1])];

    } catch (e) {
      console.error("Error parsing height range:", e);
      return [60, 72]; // Fallback
    }
  };

  // -----------------------------
  // HELPER: Height Formatter
  // -----------------------------
  const formatHeight = (inches) => {
    const ft = Math.floor(inches / 12);
    const inch = inches % 12;
    return `${ft}'${inch}"`;
  };

  const calculateAge = (day, month, year) => {
    if (!day || !month || !year) return 25;
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getDynamicDefaults = () => {
    const p = route?.params || {};

    // Default dynamic logic for partner based on user's own data
    let defaultAgeRange = [25, 30];
    let defaultHeightRange = [60, 71];

    if (p.day && p.month && p.year) {
      const userAge = calculateAge(p.day, p.month, p.year);
      if (p.gender === 'Female') {
        defaultAgeRange = [userAge, Math.min(userAge + 5, 70)];
      } else if (p.gender === 'Male') {
        defaultAgeRange = [Math.max(18, userAge - 5), userAge];
      }
    }

    if (p.gender === 'Female') {
      defaultHeightRange = [65, 75]; // Prefer Taller
    } else if (p.gender === 'Male') {
      defaultHeightRange = [60, 68]; // Prefer Shorter
    }

    return {
      ageRange: defaultAgeRange,
      heightRange: defaultHeightRange,
      maritalStatus: p.maritalStatus ? [p.maritalStatus] : ["Open for all"],
      religion: p.religion ? [p.religion] : ["Open for all"],
      community: p.subcommunity || p.community ? [p.subcommunity || p.community] : ["Open for all"],
      motherTongue: p.motherTongue ? [p.motherTongue] : ["Open for all"],
      country: p.country ? [p.country] : ["India"],
      state: p.state ? [p.state] : ["Open for all"],
      city: p.city ? [p.city] : ["Open for all"],
      qualification: p.highestQualification || p.qualification ? [p.highestQualification || p.qualification] : ["Open for all"],
      workingWith: p.workingWith ? [p.workingWith] : ["Open for all"],
      profession: p.workingAs || p.professionArea ? [p.workingAs || p.professionArea] : ["Open for all"],
      income: p.annualIncome ? [p.annualIncome] : ["Open for all"],
      profileManagedBy: ["Open for all"],
      diet: p.diet ? [p.diet] : ["Open for all"],
    };
  };

  // -----------------------------
  // CURRENT USER SELECTED VALUES
  // -----------------------------
  // Initialize with ARRAYS for multi-select and Ranges for sliders
  const [data, setData] = useState(getDynamicDefaults());

  const [suggestedCities, setSuggestedCities] = useState(SUGGESTED_CITIES);

  const handleUpdate = async () => {
    if (fromMenu) {
      setLoading(true);
      try {
        // Send only partnerPreferences to update
        const payload = {
          partnerPreferences: data
        };

        await axios.patch(`${BASE_URL}/user/update`, payload, {
          headers: { Authorization: `Bearer ${userToken}` }
        });

        Alert.alert("Success", "Partner Preferences Updated Successfully", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } catch (error) {
        console.error("Update Error:", error);
        Alert.alert("Error", "Failed to update preferences.");
      } finally {
        setLoading(false);
      }
    }
  };

  // -----------------------------
  // NAVIGATION HANDLER
  // -----------------------------
  const handleNavigation = (title, key, list) => {
    // 1. AGE RANGE SLIDER
    if (key === 'ageRange') {
      navigation.navigate('RangeSelectionScreen', {
        title,
        range: data[key],
        min: 18,
        max: 70,
        type: 'age',
        onSelect: (val) => setData((prev) => ({ ...prev, [key]: val })),
      });
      return;
    }

    // 2. HEIGHT RANGE SLIDER
    if (key === 'heightRange') {
      navigation.navigate('RangeSelectionScreen', {
        title,
        range: data[key],
        min: 48, // 4'0"
        max: 84, // 7'0"
        type: 'height',
        onSelect: (val) => setData((prev) => ({ ...prev, [key]: val })),
      });
      return;
    }

    // 3. MULTI-SELECT LIST (SearchOptionScreen)
    // Make sure we pass an array to selectedOptions
    const currentSelection = Array.isArray(data[key]) ? data[key] : [data[key]];

    navigation.navigate('SearchOptionScreen', {
      title,
      options: list,
      selectedOptions: currentSelection,
      onSelect: (val) => setData((prev) => ({ ...prev, [key]: val })),
    });
  };

  const handleCitySuggestion = (city) => {
    setData((prev) => {
      const currentCities = Array.isArray(prev.city) ? prev.city : [];
      // Avoid duplicates
      if (!currentCities.includes(city)) {
        return { ...prev, city: [...currentCities, city] };
      }
      return prev;
    });
    setSuggestedCities((prev) => prev.filter(c => c !== city));
  };

  // -----------------------------
  // DISPLAY FORMATTER
  // -----------------------------
  const getDisplayValue = (key, value) => {
    if (key === 'ageRange') {
      return `${value[0]} - ${value[1]} yrs`;
    }
    if (key === 'heightRange') {
      return `${formatHeight(value[0])} - ${formatHeight(value[1])}`;
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value;
  };

  // --------------------------------------
  // BASIC DETAILS ITEMS
  // --------------------------------------
  const basicDetailsItems = [
    {
      icon: "calendar-range", // More specific for age range
      label: "Age Range",
      value: getDisplayValue('ageRange', data.ageRange),
      onPress: () => handleNavigation("Age Range", "ageRange", null),
    },
    {
      icon: "arrow-up-down", // Clean arrow for height
      label: "Height Range",
      value: getDisplayValue('heightRange', data.heightRange),
      onPress: () => handleNavigation("Height Range", "heightRange", null),
    },
    {
      icon: "ring", // Wedding ring for marital status
      label: "Marital Status",
      value: getDisplayValue('maritalStatus', data.maritalStatus),
      onPress: () => handleNavigation("Marital Status", "maritalStatus", MARITAL_STATUS),
    },
  ];

  // --------------------------------------
  // COMMUNITY ITEMS
  // --------------------------------------
  const communityItems = [
    {
      icon: "hands-pray", // Universal faith icon
      label: "Religion",
      value: getDisplayValue('religion', data.religion),
      onPress: () => handleNavigation("Religion", "religion", RELIGIONS),
    },
    {
      icon: "account-group-outline", // Group outline is cleaner
      label: "Community",
      value: getDisplayValue('community', data.community),
      onPress: () => handleNavigation("Community", "community", COMMUNITIES),
    },
    {
      icon: "translate", // Standard language icon
      label: "Mother Tongue",
      value: getDisplayValue('motherTongue', data.motherTongue),
      onPress: () => handleNavigation("Mother Tongue", "motherTongue", MOTHER_TONGUES),
    },
  ];

  // --------------------------------------
  // LOCATION ITEMS
  // --------------------------------------
  const locationItems = [
    {
      icon: "earth",
      label: "Country living in",
      value: getDisplayValue('country', data.country),
      onPress: () => handleNavigation("Country", "country", COUNTRIES),
    },
    {
      icon: "map-outline", // Map instead of generic marker
      label: "State living in",
      value: getDisplayValue('state', data.state),
      onPress: () => handleNavigation("State", "state", STATES),
    },
    {
      icon: "city-variant-outline", // Building outline
      label: "City / District",
      value: getDisplayValue('city', data.city),
      onPress: () => handleNavigation("City", "city", CITIES),
    },
  ];

  // --------------------------------------
  // EDUCATION & CAREER ITEMS
  // --------------------------------------
  const educationItems = [
    {
      icon: "school-outline",
      label: "Qualification",
      value: getDisplayValue('qualification', data.qualification),
      onPress: () => handleNavigation("Qualification", "qualification", QUALIFICATIONS),
    },
    {
      icon: "office-building-outline", // Specific for 'working with'
      label: "Working With",
      value: getDisplayValue('workingWith', data.workingWith),
      onPress: () => handleNavigation("Working With", "workingWith", WORKING_WITH),
    },
    {
      icon: "briefcase-outline",
      label: "Profession",
      value: getDisplayValue('profession', data.profession),
      onPress: () => handleNavigation("Profession", "profession", PROFESSIONS),
    },
    {
      icon: "wallet-outline", // Wallet implies income
      label: "Annual Income",
      value: getDisplayValue('income', data.income),
      onPress: () => handleNavigation("Annual Income", "income", INCOMES),
    },
  ];

  // --------------------------------------
  // OTHER DETAILS ITEMS
  // --------------------------------------
  const otherItems = [
    {
      icon: "account-cog-outline", // Managed settings
      label: "Profile Managed by",
      value: getDisplayValue('profileManagedBy', data.profileManagedBy),
      onPress: () => handleNavigation("Profile Managed By", "profileManagedBy", PROFILE_MANAGED_BY),
    },
    {
      icon: "silverware-fork-knife", // Clear food icon
      label: "Diet",
      value: getDisplayValue('diet', data.diet),
      onPress: () => handleNavigation("Diet", "diet", DIET),
    },
  ];

  // --------------------------------------------------
  // SUCCESS ANIMATION & API INTEGRATION
  // --------------------------------------------------
  const [buttonVisible, setButtonVisible] = useState(true);
  const [tickVisible, setTickVisible] = useState(false);

  const tickTranslate = useRef(new Animated.Value(200)).current;
  const tickRotate = useRef(new Animated.Value(0)).current;
  const tickScale = useRef(new Animated.Value(0.3)).current;
  const tickOpacity = useRef(new Animated.Value(0)).current;

  // Api integration begin
  const startSuccessAnimation = async () => {
    // FINAL PAYLOAD GENERATION
    const finalPayload = {
      ...route.params, // All accumulated data from previous screens
      partnerPreferences: data, // Current screen data
      isProfileCompleted: true // Trigger Welcome Email on backend
    };

    // 1. Correct mapping for phone -> phoneNumber
    if (finalPayload.phone) {
      finalPayload.phoneNumber = finalPayload.phone;
      delete finalPayload.phone;
    }

    // 2. heightRange is now sent as [Number, Number] to match backend schema change and handleUpdate consistency.
    // Logic removed to prevent converting to "5'0" - 5'11"" string.

    console.log("---------------------------------------------------");
    console.log("FINAL APP REGISTRATION PAYLOAD (COMPLETE FLOW):");
    console.log(JSON.stringify(finalPayload, null, 2));
    console.log("---------------------------------------------------");

    // Check if IP is correct for your environment
    // BASE_URL imported from config


    try {
      const formData = new FormData();

      // CONSTRUCT DOB OBJECT (Fix for Age Calculation Issue)
      // The backend expects 'dob' as an object { day, month, year } to calculate age correctly.
      // Sign-up flow passes them as separate fields (day, month, year).
      if (finalPayload.day && finalPayload.month && finalPayload.year) {
        finalPayload.dob = {
          day: finalPayload.day,
          month: finalPayload.month,
          year: finalPayload.year
        };
        // Remove individual fields to keep payload clean (optional but good practice)
        delete finalPayload.day;
        delete finalPayload.month;
        delete finalPayload.year;
      }

      Object.keys(finalPayload).forEach(key => {
        if (key === 'partnerPreferences' || key === 'hobbies' || key === 'profileImage' || key === 'images') return; // Handled separately

        let value = finalPayload[key];
        // If value is object (like location, but our route params are flat? CreateProfileStep/index.js spreads ...data. Data is {state, city...}. So it is FLAT.)
        // However, if any field IS an object/array, stringify it just in case, or axios/formData might fail or toString it [object Object].
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        formData.append(key, value);
      });

      // Handle Complex Fields
      formData.append('partnerPreferences', JSON.stringify(finalPayload.partnerPreferences));

      if (finalPayload.hobbies) {
        formData.append('hobbies', JSON.stringify(finalPayload.hobbies));
      }

      // Handle Image
      if (finalPayload.profileImage) {
        // Ensure it's a file URI
        const uri = finalPayload.profileImage;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('profileImage', {
          uri: uri,
          name: filename,
          type: type,
        });
      }

      // Handle Secondary Images
      if (finalPayload.images && Array.isArray(finalPayload.images)) {
        finalPayload.images.forEach((uri, index) => {
          const filename = uri.split('/').pop() || `image_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          formData.append('images', {
            uri: uri,
            name: filename,
            type: type,
          });
        });
      }

      console.log("Sending FormData to:", `${BASE_URL}/user/update`);

      // API INTEGRATED: PATCH /user/update
      // PURPOSE: Complete the user profile (since user was created during OTP step).
      // We use the token passed from the OTP screen for authorization.
      const authToken = route.params?.token;

      if (!authToken) {
        throw new Error("Authentication token missing. Please try signing up again.");
      }

      const response = await axios.patch(`${BASE_URL}/user/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`
        },
      });

      console.log("Update API Response:", response.data);

      if (response.data.success) {
        // The update response might just return the user, or success status.
        // We construct the session from the existing token and updated user.

        const updatedUser = response.data.user;

        // 1. Set Auth Context State
        setUserToken(authToken);
        setUserInfo(updatedUser);

        // 2. Persist to AsyncStorage (Required for auto-login on restart)
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('userToken', authToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));

        // 3. Animation & Redirect
        // If successful, start animation
        setButtonVisible(false);
        setTickVisible(true);

        tickTranslate.setValue(200);
        tickRotate.setValue(0);
        tickScale.setValue(0.3);
        tickOpacity.setValue(0);

        Animated.parallel([
          Animated.timing(tickTranslate, {
            toValue: 0,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(tickRotate, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(tickOpacity, {
            toValue: 1,
            duration: 350,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.spring(tickScale, {
            toValue: 1,
            friction: 5,
            tension: 140,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Explicitly reset navigation to the main authenticated flow
          // The route name is 'Home' (BottomTabs), not DrawerNavigation.
          // Since this screen exists in both stacks, we must manually move the user to Home.
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        });
      } else {
        alert("Registration succeeded but no token returned. Please Login.");
        navigation.navigate("MainLoginScreen");
      }

    } catch (error) {
      console.error("API Integration Error:", error);
      if (error.response) {
        console.error("Error Data:", error.response.data);
        alert(`Registration Failed: ${error.response.data.message || "Server Error"}`);
      } else if (error.request) {
        alert("Network Error: No response from server. Check URL.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };
  // Api integration ended

  const rotateInterpolate = tickRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const tickAnimatedStyle = {
    transform: [
      { translateY: tickTranslate },
      { rotate: rotateInterpolate },
      { scale: tickScale },
    ],
    opacity: tickOpacity,
  };


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Header
        title=""
        logo={require("../../../assets/images/LyvBondLogo.png")}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.topText}>
          We have set these Preferences to show you the best Matches for your
          Profile.
        </Text>
        <Text style={styles.subText}>Tap on the field to edit</Text>

        <PreferenceCard
          title="Basic Details"
          items={basicDetailsItems}
          iconColor={COLORS.primary}
          onItemPress={(item) => item.onPress()}
        />

        <PreferenceCard
          title="Community"
          items={communityItems}
          iconColor="#F28B21"
          onItemPress={(item) => item.onPress()}
        />

        {!showMore ? (
          <TouchableOpacity style={styles.moreBtn} onPress={() => setShowMore(true)}>
            <Text style={styles.moreText}>More</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#444" />
          </TouchableOpacity>
        ) : (
          <>
            <PreferenceCard
              title="Location"
              items={locationItems}
              iconColor="#2196F3"
              onItemPress={(item) => item.onPress()}
            >
              {/* Suggested Cities Removed */}
            </PreferenceCard>

            <PreferenceCard
              title="Education & Career"
              items={educationItems}
              iconColor="#9C27B0"
              onItemPress={(item) => item.onPress()}
            />

            <PreferenceCard
              title="Other Details"
              items={otherItems}
              iconColor="#4CAF50"
              onItemPress={(item) => item.onPress()}
            />
          </>
        )}

        {/* CONFIRM BUTTON */}
        {/* CONFIRM / UPDATE BUTTON */}
        {buttonVisible && (
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={fromMenu ? handleUpdate : startSuccessAnimation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.confirmText}>
                {fromMenu ? "Update Preferences" : "Confirm & Continue"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* SUCCESS ANIMATION POPUP */}
      {tickVisible && (
        <View pointerEvents="none" style={styles.tickOverlay}>
          <Animated.View style={[styles.tickBox, tickAnimatedStyle]}>
            <Image
              source={require("../../../assets/images/tickmark.png")}
              style={styles.tickImage}
              resizeMode="contain"
            />
            <Text style={styles.successText}>Signup Successful</Text>
          </Animated.View>
        </View>
      )}

      {/* MODAL REMOVED - using Navigation Screens */}
    </View>
  );
};

export default PreferencesOverview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgcolor,
  },

  topText: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.black,
    marginTop: 15,
    marginBottom: 4,
    fontFamily: FONTS.RobotoMedium,
  },

  subText: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 20,
    fontFamily: FONTS.RobotoRegular,
  },

  suggestionContainer: {
    padding: 0,
    marginTop: 15,
    marginBottom: 5,
  },
  suggestionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontFamily: FONTS.RobotoMedium,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.RobotoMedium,
  },

  moreBtn: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 6,
    alignItems: "center",
  },

  moreText: {
    fontSize: 17,
    color: COLORS.black,
    marginRight: 4,
  },

  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    width: "90%",
    alignSelf: "center",
  },

  confirmText: {
    fontSize: 18,
    color: COLORS.white,
    textAlign: "center",
    fontFamily: FONTS.RobotoBold,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "60%",
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    marginBottom: 16,
  },

  optionRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  optionText: {
    fontSize: 17,
    color: COLORS.black,
  },

  closeBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },

  closeText: {
    fontSize: 17,
    color: COLORS.primary,
  },

  // SUCCESS ANIMATION
  tickOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 110,
    alignItems: "center",
  },

  tickBox: {
    alignItems: "center",
  },

  tickImage: {
    width: 90,
    height: 90,
  },

  successText: {
    marginTop: 10,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 17,
    color: COLORS.black,
  },
});
