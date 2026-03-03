import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  PanResponder,
  Animated,
  Easing
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { COLORS, FONTS } from "../../../utlis/comon";
import { userProfileData as ME } from "../../components/CommonComponents/profileUserData";
import AstroPopup from "../Astro Pop up/AstroPopup";
import PremiumUpgradePopup from "../../components/Popups/PremiumUpgradePopup";
import { useAuth } from "../../../context/AuthContext";

const { width, height } = Dimensions.get("window");

// Ref: MatchesProfileCard.js styles for consistency
const MATCHES_STYLES = {
  promotedWrapper: {
    position: 'absolute', top: 18, left: 16, zIndex: 12,
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12
  },
  topRight: { position: 'absolute', top: 14, right: 14, alignItems: 'flex-end', zIndex: 12 },
  vipBadge: { width: 60, height: 60, resizeMode: 'contain' },
  nonVipBadge: { width: 34, height: 34, resizeMode: 'contain' },
  photoCountBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)', marginTop: 10,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  menuBtn: {
    position: 'absolute', top: 120, right: 14, zIndex: 12,
    backgroundColor: 'rgba(0,0,0,0.55)', padding: 8, borderRadius: 20
  }
};

// Modern Hobby Map
const hobbyIconMap = {
  cooking: "chef-hat",
  travel: "airplane",
  reading: "book-open-page-variant",
  music: "music-note",
  sketch: "palette",
  fitness: "dumbbell",
  photography: "camera",
  cycling: "bike",
  trekking: "hiking",
  dance: "dance-ballroom",
  pottery: "flower",
  volunteer: "hand-heart",
  mentoring: "account-group",
  hiking: "hiking",
  coffee: "coffee",
  gardening: "flower-tulip",
  theatre: "drama-masks",
  running: "run",
  default: "star-shooting",
};

import UserService from "../../../services/UserService";
// ... imports

export default function UserDetailsScreen({ route, navigation }) {
  const { user: initialUser, userId } = route.params || {};
  const { userInfo } = useAuth(); // Get logged-in user info
  // State initialized to null to allow mapper to handle data consistency
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);
  const [astroPopupVisible, setAstroPopupVisible] = useState(false);
  const [premiumPopupVisible, setPremiumPopupVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

  // Check if user has any active subscription (not free)
  const isPremium = (userInfo?.subscriptionType && userInfo.subscriptionType.toLowerCase() !== 'free') || userInfo?.isPremium === true;
  console.log("DEBUG PREMIUM CHECK - User:", userInfo?.name, "Type:", userInfo?.subscriptionType, "isPremium:", isPremium);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = useRef(null);

  // Helper to calculate age from DOB object {day, month, year}
  const calculateAge = (dob) => {
    if (!dob || !dob.year) return "";
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(dob.year);
  };

  // Mapper function to convert Backend User -> UI User Schema
  const mapBackendUserToUI = (backendUser) => {
    if (!backendUser) return null;

    // Map hobbies
    // Map hobbies - Check both root level and preferences object
    const rawHobbies = backendUser.hobbies || backendUser.preferences?.hobbies || [];
    const mappedHobbies = Array.isArray(rawHobbies)
      ? rawHobbies.map(h => ({
        label: h,
        iconKey: String(h).toLowerCase().split(' ')[0], // Use first word for icon matching
      }))
      : [];

    // Map Images (Schema has profileImage string, UI wants array)
    let allImages = [];
    if (backendUser.profileImage) {
      allImages.push(backendUser.profileImage);
    }
    if (Array.isArray(backendUser.images)) {
      backendUser.images.forEach(img => {
        const imgUrl = typeof img === 'object' ? img.uri : img;
        if (imgUrl && !allImages.includes(imgUrl)) {
          allImages.push(imgUrl);
        }
      });
    }

    let formattedImages = allImages.map(img => ({ uri: img }));

    // Construct Location String
    let locationString = "Not Specified";
    const loc = backendUser.location;
    if (loc) {
      if (typeof loc === 'string') {
        locationString = loc;
      } else if (typeof loc === 'object') {
        const parts = [loc.city, loc.state, loc.country].filter(Boolean);
        if (parts.length > 0) locationString = parts.join(", ");
      }
    }

    return {
      ...backendUser, // Spread first to prevent overwriting our explicit field mappings
      _id: backendUser._id,
      name: backendUser.name || backendUser.firstName || "User",
      age: calculateAge(backendUser.dob),
      height: backendUser.preferences?.height || "N/A",
      religion: backendUser.religion || backendUser.partnerPreferences?.religion?.[0] || "N/A",
      work: backendUser.education?.profession || "N/A",
      location: locationString || "Not Specified",
      online: backendUser.isOnline || false,
      lookingFor: backendUser.profileFor || "Relationship",

      // Images
      images: formattedImages,

      // Basic Details Section
      basicDetails: {
        dob: backendUser.dob
          ? (backendUser.dob.day ? `${backendUser.dob.day}/${backendUser.dob.month}/${backendUser.dob.year}` : `${backendUser.dob.month}/${backendUser.dob.year}`)
          : "N/A",
        maritalStatus: backendUser.preferences?.maritalStatus || "N/A",
        livesIn: locationString,
        hometown: backendUser.location?.grewUpIn || "N/A",
        religion: backendUser.religion || backendUser.partnerPreferences?.religion?.[0] || "N/A",
        motherTongue: backendUser.motherTongue || backendUser.partnerPreferences?.motherTongue?.[0] || "N/A",
        diet: backendUser.preferences?.diet || "N/A",
        managedBy: backendUser.profileFor || "Self",
        community: backendUser.location?.subcommunity || "N/A"
      },

      // Career Section
      careerEducation: {
        profession: backendUser.education?.profession || "N/A",
        company: backendUser.education?.organization || "N/A",
        college: backendUser.education?.college || "N/A",
        annualIncome: backendUser.education?.income || "N/A",
        workType: backendUser.education?.workType || "N/A",
      },

      // Family Section
      familyDetails: {
        fatherOccupation: backendUser.family?.fatherDetails || "N/A",
        familyLocation: locationString, // Use user's location as fallback/default
        familyStatus: backendUser.family?.financialStatus || "N/A",
      },

      // Contact Section
      contactDetails: {
        email: backendUser.email || "Hidden",
        phone: backendUser.phoneNumber || backendUser.phone || "Hidden",
      },

      hobbies: mappedHobbies,
      about: backendUser.about,
    };
  };

  React.useEffect(() => {
    const fetchFullProfile = async () => {
      const targetId = userId || (initialUser && initialUser._id);

      if (!targetId) {
        console.warn("No userId provided to UserDetailsScreen");
        if (initialUser) setUser(mapBackendUserToUI(initialUser)); // Try mapping initialUser too if present
        else setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await UserService.getUserDetails(targetId);
        if (res.success && res.data) {
          const mappedUser = mapBackendUserToUI(res.data);
          setUser(mappedUser);
        } else {
          Alert.alert("Error", "Could not fetch user details.");
          if (initialUser) setUser(mapBackendUserToUI(initialUser));
        }
      } catch (e) {
        console.error("Error fetching user details", e);
        Alert.alert("Error", "Network error while fetching profile.");
        if (initialUser) setUser(mapBackendUserToUI(initialUser));
      } finally {
        setLoading(false);
      }
    };
    fetchFullProfile();
  }, [userId]);

  const photosCount = Array.isArray(user?.images) ? user.images.length : 0;

  const formatLocation = (val) => {
    if (!val) return "Not Specified";
    if (typeof val === 'string') return val;
    // Fallback if object passed despite mapper
    if (typeof val === 'object') {
      const parts = [val.city, val.state].filter(Boolean);
      return parts.join(', ') || "Not Specified";
    }
    return val;
  };

  const formatValue = (val) => {
    if (Array.isArray(val)) return val.join(', ');
    return val;
  };

  const openGallery = (startIndex = 0) => {
    setGalleryIndex(startIndex);
    setGalleryVisible(true);
    setTimeout(() => {
      if (galleryRef.current && user.images?.length > startIndex) {
        galleryRef.current.scrollToIndex({ index: startIndex, animated: false });
      }
    }, 300);
  };

  const renderGalleryItem = ({ item }) => (
    <View style={styles.galleryImageWrapper}>
      <Image source={typeof item === 'object' && item.uri ? item : { uri: item }} style={{ width: width, height: height, resizeMode: 'contain', backgroundColor: '#000' }} />
    </View>
  );

  const parseHeight = (heightStr) => {
    if (!heightStr) return 0;
    // Extract feet and inches
    const match = heightStr.toString().match(/(\d+)\s*ft\s*(\d*)/); // e.g. "5 ft 8 in"
    if (match) {
      return parseInt(match[1]) * 12 + (parseInt(match[2]) || 0);
    }
    // Fallback for just number/cm if needed (assume inches if small number, cm if > 100?)
    // For now assuming the standard format used in app: "5 ft 8 in"
    return 0;
  };

  const getCompatibility = () => {
    if (!user || !user.partnerPreferences || !userInfo) return [];

    const pp = user.partnerPreferences;
    const my = userInfo; // Current User (You)

    const prefs = [];

    // Helper to check array inclusion or "Open for all"
    const isMatch = (prefArr, myValue) => {
      if (!prefArr || prefArr.length === 0) return true; // No pref = match
      if (prefArr.includes("Open for all") || prefArr.includes("Doesn't Matter")) return true;
      if (!myValue) return false;
      return prefArr.some(p => p.toLowerCase() === myValue.toLowerCase());
    };

    // 1. HEIGHT
    // 1. HEIGHT
    if (pp.heightRange) {
      let min = 0, max = 100;
      let displayValue = pp.heightRange;

      // Check if string "5'0" - 5'3"" format
      if (typeof pp.heightRange === 'string') {
        if (pp.heightRange.includes("-")) {
          const parts = pp.heightRange.split("-");
          // Helper internal to parse "5'3""
          const pIn = (s) => {
            const m = s.match(/(\d+)'(\d+)"/);
            if (m) return parseInt(m[1]) * 12 + parseInt(m[2]);
            return 0;
          };
          min = pIn(parts[0]);
          max = pIn(parts[1]);
        } else if (pp.heightRange.includes("Below")) {
          min = 0; max = 60;
        } else if (pp.heightRange.includes("above")) {
          min = 72; max = 100;
        }
      } else if (Array.isArray(pp.heightRange) && pp.heightRange.length > 0) {
        // Backward compatibility
        min = pp.heightRange[0];
        max = pp.heightRange[1];
        displayValue = `Approx. ${Math.floor(min / 12)}'${min % 12}" to ${Math.floor(max / 12)}'${max % 12}"`;
      }

      const myHeight = parseHeight(my.preferences?.height || my.height);
      const isHeightMatch = myHeight >= min && myHeight <= max;

      prefs.push({
        id: "height",
        label: "Height",
        value: displayValue,
        matched: isHeightMatch
      });
    } else {
      // Fallback
    }

    // 2. AGE
    if (pp.ageRange && pp.ageRange.length > 0) {
      const minAge = pp.ageRange[0];
      const maxAge = pp.ageRange[1];
      const myAge = calculateAge(my.dob); // Use existent helper
      prefs.push({
        id: "age",
        label: "Age",
        value: `${minAge} to ${maxAge}`,
        matched: (myAge >= minAge && myAge <= maxAge)
      });
    }

    // 3. CHILDREN (Derived from Marital Status / New Field)
    // If 'children' pref exists (we added it to schema)
    const childrenPref = pp.children || [];
    // My status: Logic -> if I am "Never Married", I likely have "No" children.
    // Ideally my profile should have 'children' field. For now inferring.
    const myChildren = (my.preferences?.maritalStatus === "Never Married" || my.preferences?.maritalStatus === "Single") ? "No" : "N/A";
    if (childrenPref.length > 0) {
      prefs.push({
        id: "children",
        label: "Children",
        value: childrenPref.join(", "),
        matched: isMatch(childrenPref, myChildren)
      });
    }

    // 4. WORKING WITH (Work Type)
    const workWithPref = pp.workingWith || [];
    const myWorkType = my.education?.workType || "N/A";
    if (workWithPref.length > 0) {
      prefs.push({
        id: "workingWith",
        label: "Working With",
        value: workWithPref.join(", "),
        matched: isMatch(workWithPref, myWorkType)
      });
    } else {
      // Show it anyway if user specifically asked, defaulting to "Any"
      prefs.push({ id: "workingWith", label: "Working With", value: "Open for all", matched: true });
    }

    // 5. WORKING AS (Specific Role)
    const rolePref = pp.workingAs || [];
    const myRole = my.education?.profession || "N/A";
    if (rolePref.length > 0) {
      prefs.push({
        id: "workingAs",
        label: "Working As",
        value: rolePref.join(", "),
        matched: isMatch(rolePref, myRole)
      });
    }

    // 6. PROFESSION AREA (General Field)
    // Note: User profile doesn't strictly have a 'professionArea' field saved currently in education, 
    // but partner prefs might have it. We skip matching or infer it if possible. 
    // For now, we display it but maybe force match or leave unmatched if we can't verify.
    const areaPref = pp.profession || [];
    if (areaPref.length > 0) {
      prefs.push({
        id: "professionArea",
        label: "Profession Area",
        value: areaPref.join(", "),
        matched: true // Cannot verify against user profile easily yet, defaulting to true or needs 'my.education.professionArea'
      });
    }

    // 7. PROFILE MANAGED BY
    const managedByPref = pp.profileManagedBy || [];
    const myManager = my.profileFor || "Self";
    if (managedByPref.length > 0) {
      prefs.push({
        id: "managedBy",
        label: "Profile Managed By",
        value: managedByPref.join(", "),
        matched: isMatch(managedByPref, myManager)
      });
    } else {
      prefs.push({ id: "managedBy", label: "Profile Managed By", value: "Open for all", matched: true });
    }

    // 7. Religion (Standard)
    const relPref = pp.religion || [];
    const myRel = my.religion || my.basicDetails?.religion;
    if (relPref.length > 0) {
      prefs.push({
        id: "religion",
        label: "Religion",
        value: relPref.join(", "),
        matched: isMatch(relPref, myRel)
      });
    }

    return prefs;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#F0F2F5' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) return <View style={styles.center}><Text>No user data found.</Text></View>;

  const basicTopChips = [
    { label: formatValue(user.profileManagedBy?.[0] || user.basicDetails?.managedBy || "Self Managed"), icon: "account-cog" },
    { label: `${user.dob?.year ? (new Date().getFullYear() - user.dob.year) : 'N/A'} yrs`, icon: "cake-variant" },
    { label: user.preferences?.height || user.basicDetails?.height || "N/A", icon: "human-male-height" },
    { label: formatValue(user.family?.community?.[0] || user.basicDetails?.community || "N/A"), icon: "account-group" },
  ];


  // ------------- MATCH / COMMON DATA -------------
  // Use dynamic compatibility
  const dynamicPrefs = getCompatibility();

  // fallback if empty
  const matchPrefs = dynamicPrefs.length > 0 ? dynamicPrefs : [
    { id: "height", label: "Height", value: "5' 8\" - 6' 2\"", matched: true },
    { id: "age", label: "Age", value: "Open for all", matched: true },
    { id: "workingWith", label: "Working With", value: "Open for all", matched: true },
    { id: "children", label: "Children", value: "No", matched: true },
  ];

  /* 
  // Old Hardcoded
  const matchPrefs = user.matchPreferences || [
    { id: "height", label: "Height", value: "5' 8\" (172cm) to 6' 2\" (187cm)", matched: true },
    ...
  ]; 
  */

  const totalPrefs = matchPrefs.length;
  const matchedCount = matchPrefs.filter((p) => p.matched).length;

  const detailRow = (icon, title, value) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value || "Not Specified"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* PARALLAX HEADER IMAGE WITH UNIFORM OVERLAYS */}
        <View style={styles.headerContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.slider}>
            {user.images && user.images.length > 0 ? (
              user.images.map((img, i) => (
                <Image
                  key={i}
                  source={typeof img === 'string' ? { uri: img } : img}
                  style={styles.sliderImg}
                />
              ))
            ) : (
              <View style={[styles.sliderImg, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialIcons name="account-circle" size={100} color={COLORS.white} />
              </View>
            )}
          </ScrollView>

          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />

          {/* BACK BUTTON (Left) */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, left: 20, zIndex: 11 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={32} color={COLORS.white} />
          </TouchableOpacity>

          {/* --- RIGHT COLUMN ACTIONS [VIP, Photos, Menu] --- */}
          {/* MatchesProfileCard: Promoted Badge (Optional, kept for consistency) */}
          {/* <View style={MATCHES_STYLES.promotedWrapper}>
              <MaterialIcons name="info" size={14} color={COLORS.white} />
              <Text style={{color: COLORS.white, marginLeft: 6, fontSize: 12}}>Promoted</Text>
          </View> */}

          {/* MatchesProfileCard: VIP & Photo Count */}
          <View style={[MATCHES_STYLES.topRight, { top: 50 }]}>
            {/* VIP Badge */}
            {user.isVip
              ? (user.vipBadge && <Image source={user.vipBadge} style={MATCHES_STYLES.vipBadge} />)
              : (user.normalBadge && <Image source={user.normalBadge} style={MATCHES_STYLES.nonVipBadge} />)
            }

            {/* Photo Count Button */}
            <TouchableOpacity
              style={MATCHES_STYLES.photoCountBtn}
              activeOpacity={0.8}
              onPress={() => openGallery(0)}
            >
              <MaterialIcons name="photo-camera" size={16} color={COLORS.white} />
              <Text style={{ color: COLORS.white, marginLeft: 6, fontSize: 13, fontWeight: '600' }}>
                {photosCount}
              </Text>
            </TouchableOpacity>
          </View>

          {/* MatchesProfileCard: 3-Dot Menu */}
          <TouchableOpacity
            style={[MATCHES_STYLES.menuBtn, { top: 160 }]} // Adjusted top to be below photo button
            onPress={() => setMenuVisible(true)}
          >
            <MaterialIcons name="more-vert" size={22} color={COLORS.white} />
          </TouchableOpacity>


          {/* NAME & INFO OVERLAY (MatchesProfileCard Style) */}
          <View style={styles.nameOverlay}>
            <Text style={styles.userName}>{user.name}{user.age ? `, ${user.age}` : ''}</Text>

            <View style={styles.dividerLine} />

            <Text style={styles.userLocation}>
              {user.height} • {user.religion} • {user.work}
            </Text>
            <Text style={[styles.userLocation, { marginTop: 4 }]}>
              {formatLocation(user.location)}
            </Text>

            <View style={styles.tagsContainer}>
              {/* Online Tag */}
              <View style={styles.tagPill}>
                <View style={[styles.onlineDot, { backgroundColor: user.online ? '#00E676' : 'gray' }]} />
                <Text style={styles.tagText}>{user.online ? 'Online' : 'Offline'}</Text>
              </View>

              {/* Looking For */}
              {user.lookingFor && (
                <View style={styles.tagPill}>
                  <Ionicons name="heart" size={16} color={COLORS.primary} />
                  <Text style={styles.tagText}>{user.lookingFor}</Text>
                </View>
              )}

              {/* Astro */}
              <TouchableOpacity style={styles.tagPill} onPress={() => setAstroPopupVisible(true)}>
                <Ionicons name="planet" size={16} color="#FFEA00" />
                <Text style={styles.tagText}>Astro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MODERN BODY CONTENT */}
        <View style={styles.bodyContent}>

          {/* 1. KEY HIGHLIGHTS (Horizontal Chips) */}
          <View style={styles.highlightsRow}>
            {basicTopChips.map((chip, i) => (
              <View key={i} style={styles.highlightChip}>
                <MaterialCommunityIcons name={chip.icon} size={16} color="#555" />
                <Text style={styles.highlightText}>{chip.label}</Text>
              </View>
            ))}
          </View>

          {/* 2. ABOUT + VOICE INTRO (Futuristic Card) */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.aboutText}>{user.about || "Hey there! I'm using LyvBond to find my perfect match."}</Text>
          </View>

          {/* 3. BASIC DETAILS GRID */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.gridContainer}>
              {detailRow("calendar-clock", "Birth Date", (user.isContactLocked && !isPremium) ? "** / ** / ****" : formatValue(user.basicDetails?.dob || user.dob))}
              {detailRow("ring", "Marital Status", formatValue(user.basicDetails?.maritalStatus))}
              {detailRow("home-city", "Lives In", formatLocation(user.basicDetails?.livesIn || user.location))}
              {detailRow("baby-carriage", "Grew Up In", formatLocation(user.basicDetails?.hometown || user.grewUpIn))}
              {detailRow("hands-pray", "Religion", formatValue(user.basicDetails?.religion))}
              {detailRow("translate", "Mother Tongue", formatValue(user.basicDetails?.motherTongue))}
              {detailRow("food-apple", "Diet", formatValue(user.basicDetails?.diet))}
            </View>
          </View>

          {/* 3.1 CONTACT INFO */}
          {/* 3.1 CONTACT INFO - Updated with fallback and Unlock Logic */}
          {/* 3.1 CONTACT INFO - Updated Logic: Swipe Card Covers Everything */}
          {user.isContactLocked ? (
            !isPremium ? (
              <TouchableOpacity style={styles.swipeContainer} onPress={() => setPremiumPopupVisible(true)} activeOpacity={0.9}>
                <View style={styles.swipePaperCard}>
                  <View style={styles.docFold} />
                  <View style={styles.swipeContentContainer}>
                    <View style={styles.docLinesContainer}>
                      <View style={[styles.docLine, { width: '60%' }]} />
                      <View style={[styles.docLine, { width: '80%' }]} />
                    </View>
                    <View style={[styles.swipeInstruction, { transform: [{ scale: 1.1 }] }]}>
                      <MaterialCommunityIcons name="crown" size={28} color="#FFD700" style={{ marginRight: 8 }} />
                      <Text style={styles.swipeText}>UPGRADE TO UNLOCK CONTACT</Text>
                    </View>
                    <View style={styles.docLinesContainer}>
                      <View style={[styles.docLine, { width: '80%' }]} />
                      <View style={[styles.docLine, { width: '60%' }]} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <SwipeToUnlockContact
                onUnlock={async () => {
                  return new Promise(async (resolve, reject) => {
                    try {
                      const res = await UserService.unlockContact(user._id || user.userId);
                      if (res.status === 'unlocked' || res.status === 'already_unlocked') {
                        // Refresh profile
                        const updatedUser = await UserService.getUserDetails(user._id || user.userId);
                        if (updatedUser.success && updatedUser.data) {
                          setUser(mapBackendUserToUI(updatedUser.data));
                          resolve(true);
                        } else { reject(); }
                      } else {
                        if (res.code === 'QUOTA_EXCEEDED') Alert.alert("Limit Reached", res.message);
                        else if (res.code === 'NO_SUBSCRIPTION') setPremiumPopupVisible(true);
                        else Alert.alert("Unlock Failed", res.message || "Could not unlock");
                        reject();
                      }
                    } catch (e) {
                      console.error("Unlock Error", e);
                      Alert.alert("Error", "Failed to unlock.");
                      reject();
                    }
                  });
                }}
              />
            )
          ) : (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Contact Info</Text>
              <View style={styles.gridContainer}>
                {detailRow("email", "Email", user.contactDetails?.email || user.email)}
                {detailRow("phone", "Phone", user.contactDetails?.phone || user.phoneNumber || user.phone)}
              </View>
            </View>
          )}

          {/* 4. CAREER & EDUCATION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Career & Education</Text>
            <View style={styles.gridContainer}>
              {detailRow("briefcase-variant", "Profession", user.careerEducation?.profession)}
              {detailRow("domain", "Company", user.careerEducation?.company)}
              {detailRow("school", "College", user.careerEducation?.college)}
              {detailRow("cash-multiple", "Income", user.careerEducation?.annualIncome)}
            </View>
          </View>

          {/* 5. FAMILY DETAILS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Family Background</Text>
            <View style={styles.gridContainer}>
              {detailRow("human-male-female-child", "Parents", user.familyDetails?.fatherOccupation)}
              {detailRow("map-marker-radius", "Location", user.familyDetails?.familyLocation)}
              {detailRow("bank", "Status", user.familyDetails?.familyStatus)}
            </View>
          </View>

          {/* 6. HOBBIES (Modern Tags) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
            <View style={styles.tagsCloud}>
              {user.hobbies?.map((hobby, i) => (
                <View key={i} style={styles.hobbyTag}>
                  <MaterialCommunityIcons
                    name={hobbyIconMap[hobby.iconKey] || 'star'}
                    size={16}
                    color={COLORS.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.hobbyText}>{hobby.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 7. FUTURISTIC COMPATIBILITY ENGINE */}
          <View style={styles.matchCardOuter}>

            {/* Header with Circular Score */}
            <LinearGradient
              colors={[COLORS.chatthem, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.matchHeaderGradient}
            >
              <View style={styles.headerTopRow}>
                <Text style={styles.matchHeaderTitle}>Compatibility</Text>
                <View style={styles.scoreOrb}>
                  <Text style={styles.orbText}>{Math.round((matchedCount / totalPrefs) * 100)}%</Text>
                </View>
              </View>

              <View style={styles.matchAvatarsRow}>
                <Image
                  source={
                    userInfo?.profileImage
                      ? (typeof userInfo.profileImage === 'string' && userInfo.profileImage.startsWith('http')
                        ? { uri: userInfo.profileImage }
                        : require('../../../assets/images/profileimage.png')) // Fallback if local/invalid string
                      : require('../../../assets/images/profileimage.png')
                  }
                  style={styles.matchAvatarImg}
                />
                <View style={styles.connectLine}>
                  <LinearGradient colors={[COLORS.primary, '#FF4081']} style={styles.connectDot} />
                  <LinearGradient colors={[COLORS.primary, '#FF4081']} style={styles.connectDot} />
                  <LinearGradient colors={[COLORS.primary, '#FF4081']} style={styles.connectDot} />
                </View>
                {/* Fix: Check type of user image */}
                <Image
                  source={
                    user.images?.[0]
                      ? (typeof user.images[0] === 'string' ? { uri: user.images[0] } : user.images[0])
                      : { uri: 'https://via.placeholder.com/150' }
                  }
                  style={styles.matchAvatarImg}
                />
              </View>

              <Text style={styles.matchHeaderText}>
                {matchedCount} / {totalPrefs} Preferences Matched
              </Text>
            </LinearGradient>

            {/* A. COMMON TRAITS SECTION (You Both...) */}
            <View style={styles.commonSection}>
              <Text style={styles.commonTitle}>Common between you</Text>
              <View style={styles.commonChipsRow}>
                {matchPrefs.filter(p => p.matched).map((p, i) => (
                  <LinearGradient
                    key={`common-${i}`}
                    colors={['#E0F7FA', '#B2EBF2']}
                    style={styles.commonChip}
                  >
                    <Ionicons name="checkmark-done-circle" size={16} color="#0097A7" />
                    <Text style={styles.commonChipText}>{p.label}</Text>
                  </LinearGradient>
                ))}
                {/* Mock some hobbies for visual richness if needed */}
                <LinearGradient colors={['#F3E5F5', '#E1BEE7']} style={styles.commonChip}>
                  <Ionicons name="musical-notes" size={16} color="#9C27B0" />
                  <Text style={styles.commonChipText}>Music</Text>
                </LinearGradient>
                <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.commonChip}>
                  <Ionicons name="airplane" size={16} color="#EF6C00" />
                  <Text style={styles.commonChipText}>Travel</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* B. DETAILED PREFERENCES LIST */}
            <View style={styles.matchListContainer}>
              <Text style={styles.commonTitle}>Deep Dive</Text>
              {matchPrefs.map((p) => (
                <View key={p.id} style={styles.prefRow}>
                  {/* Status Icon Indicator Left */}
                  <View style={[styles.statusIndicator, { backgroundColor: p.matched ? '#4CAF50' : '#E53935' }]}>
                    <Ionicons
                      name={p.matched ? "checkmark" : "close"}
                      size={12}
                      color={COLORS.white}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.prefLabel}>{p.label}</Text>
                    <Text style={[styles.prefValue, { color: p.matched ? '#333' : '#999' }]}>
                      {p.value}
                    </Text>
                  </View>

                  {/* Right Side Pill for Match */}
                  {p.matched && (
                    <View style={styles.matchPillBadge}>
                      <Text style={styles.matchPillText}>MATCH</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>

      </ScrollView>

      {/* FLOAT BOTTOM BAR */}
      {/* FLOAT BOTTOM BAR */}
      {/* 
      <View style={styles.bottomFloatBar}>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => Alert.alert("Passed", "Profile skipped.")}>
          <Ionicons name="close" size={28} color="#FF5252" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.superLikeBtn} onPress={() => Alert.alert("Super Like!", "It's a match!")}>
          <LinearGradient colors={['#FF4081', '#F50057']} style={styles.superInner}>
            <Ionicons name="star" size={32} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={() => Alert.alert("Connect", "Request Sent!")}>
          <Ionicons name="heart" size={28} color="#00E676" />
        </TouchableOpacity>
      </View> 
      */}

      {/* MENU MODAL */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <TouchableOpacity style={styles.menuItem}>
              <IconText icon="share-variant" text="Share Profile" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <IconText icon="bookmark-outline" text="Add to Shortlist" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <IconText icon="block-helper" text="Block User" color="#FF5252" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <IconText icon="alert-octagon-outline" text="Report User" color="#FF5252" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <AstroPopup
        visible={astroPopupVisible}
        onClose={() => setAstroPopupVisible(false)}
        currentUser={userInfo}
        partnerUser={user}
        isLocked={user.isContactLocked && !isPremium}
      />

      <PremiumUpgradePopup
        visible={premiumPopupVisible}
        onClose={() => setPremiumPopupVisible(false)}
        onViewPlans={() => navigation.navigate("SubscriptionScreen")}
      />

      {/* GALLERY MODAL */}
      <Modal visible={galleryVisible} transparent animationType="slide" onRequestClose={() => setGalleryVisible(false)}>
        <SafeAreaView style={styles.galleryModalWrapper}>
          <View style={styles.galleryTopBar}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)} style={styles.galleryClose}>
              <MaterialIcons name="close" size={26} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.galleryCounter}>{galleryIndex + 1} / {user.images?.length || 0}</Text>
            <View style={{ width: 46 }} />
          </View>

          <FlatList
            ref={galleryRef}
            data={user.images || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, i) => ({ length: width, offset: i * width, index: i })}
            onMomentumScrollEnd={(ev) => {
              const idx = Math.round(ev.nativeEvent.contentOffset.x / width);
              setGalleryIndex(idx);
            }}
            renderItem={renderGalleryItem}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const IconText = ({ icon, text, color = '#333' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <MaterialCommunityIcons name={icon} size={22} color={color} style={{ marginRight: 15 }} />
    <Text style={{ fontSize: 16, color: color, fontFamily: FONTS.RobotoMedium }}>{text}</Text>
  </View>
);

// --- Swipe To Unlock Component ---
const SwipeToUnlockContact = ({ onUnlock }) => {
  const [unlocked, setUnlocked] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const SWIPE_THRESHOLD = 120;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if horizontal swipe is greater than vertical (scrolling)
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        // Optional: Any setup on touch start
      },
      onPanResponderMove: (evt, gestureState) => {
        if (unlocked) return;
        // Directly update the value without width constraint to ensure responsiveness
        slideAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (unlocked) return;
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: gestureState.dx > 0 ? width : -width, duration: 300, useNativeDriver: true
            }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true })
          ]).start(async () => {
            try {
              await onUnlock();
              setUnlocked(true);
            } catch (e) {
              reset();
            }
          });
        } else {
          reset();
        }
      }
    })
  ).current;

  const reset = () => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  if (unlocked) return null;

  return (
    <View
      style={styles.swipeContainer}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Underlay Message - Loader */}
      <View style={styles.swipeUnderlay}>
        <ActivityIndicator size="small" color="#E94057" />
      </View>

      {/* Foreground Document Card */}
      <Animated.View
        style={[
          styles.swipePaperCard,
          { transform: [{ translateX: slideAnim }], opacity: opacityAnim }
        ]}
        {...panResponder.panHandlers}
      >
        {/* 3D Edge Highlight (Simulated via border in styles, but maybe internal glow here) */}

        {/* Folded Corner */}
        <View style={styles.docFold} />

        {/* Content Container - Centered */}
        <View style={styles.swipeContentContainer}>

          {/* Mock Text Lines - Top */}
          <View style={styles.docLinesContainer}>
            <View style={[styles.docLine, { width: '60%' }]} />
            <View style={[styles.docLine, { width: '80%' }]} />
          </View>

          {/* Call to Action - CENTERED */}
          <View style={[styles.swipeInstruction, { transform: [{ scale: 1.1 }] }]}>
            <MaterialCommunityIcons name="gesture-swipe-horizontal" size={28} color="#E94057" style={{ marginRight: 8 }} />
            <Text style={styles.swipeText}>SWIPE TO UNLOCK CONTACT</Text>
            <MaterialCommunityIcons name="chevron-double-right" size={28} color="#E94057" style={{ marginLeft: 8 }} />
          </View>

          {/* Mock Text Lines - Bottom */}
          <View style={styles.docLinesContainer}>
            <View style={[styles.docLine, { width: '80%' }]} />
            <View style={[styles.docLine, { width: '60%' }]} />
          </View>

        </View>

      </Animated.View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  headerContainer: { height: height * 0.55, width: '100%', position: 'relative' },
  slider: { width: '100%', height: '100%' },
  sliderImg: { width: width, height: '100%', resizeMode: 'cover' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },

  topBar: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10
  },
  glassBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    // backdropFilter: 'blur(10px)' // Note: Standard RN doesn't support this yet without Expo Blur, but looks okay with rgba
  },

  nameOverlay: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
  },
  userName: {
    fontSize: 28, fontFamily: FONTS.RobotoBold, color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4
  },
  onlineDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 10, borderWidth: 1, borderColor: COLORS.white },
  userLocation: {
    fontSize: 15, color: '#eee', fontFamily: FONTS.RobotoMedium, marginTop: 2
  },
  tagsContainer: { flexDirection: 'row', marginTop: 12 },
  tagPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, marginRight: 8
  },
  dividerLine: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8, width: '100%'
  },
  tagText: { color: COLORS.white, fontSize: 12, fontFamily: FONTS.RobotoBold, marginLeft: 5 },

  // Body
  bodyContent: {
    marginTop: -20, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    backgroundColor: '#F0F2F5', paddingHorizontal: 20, paddingTop: 25
  },

  highlightsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  highlightChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05
  },
  highlightText: { marginLeft: 6, fontSize: 13, color: '#444', fontFamily: FONTS.RobotoMedium },

  sectionCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 15,
    elevation: 4, shadowColor: '#ccc', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.RobotoBold, color: '#222', marginBottom: 10 },
  aboutText: { fontSize: 14, color: '#555', lineHeight: 22, fontFamily: FONTS.RobotoRegular },

  // Audio Player Dummy
  audioPlayer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA',
    marginTop: 15, padding: 10, borderRadius: 15
  },
  playBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center'
  },

  duration: { fontSize: 12, color: '#666', fontFamily: FONTS.RobotoMedium },

  // Detail Grid
  gridContainer: { flexDirection: 'column' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: 15
  },
  infoTitle: { fontSize: 12, color: '#888' },
  infoValue: { fontSize: 15, color: '#333', fontFamily: FONTS.RobotoMedium },

  // Hobbies
  tagsCloud: { flexDirection: 'row', flexWrap: 'wrap' },
  hobbyTag: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '40',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8,
    backgroundColor: COLORS.primary + '05'
  },
  hobbyText: { fontSize: 13, color: COLORS.primary, fontFamily: FONTS.RobotoMedium },

  // Match Card
  matchCard: {
    borderRadius: 24, padding: 20, marginTop: 10, elevation: 8
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchTitle: { fontSize: 20, fontFamily: FONTS.RobotoBold, color: COLORS.white },
  scoreBadge: { backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { color: COLORS.primary, fontFamily: FONTS.RobotoBold, fontSize: 14 },

  matchAvatars: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 20
  },
  matchImg: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: COLORS.white
  },
  connectorLine: {
    height: 2, backgroundColor: 'rgba(255,255,255,0.3)', width: 60, alignItems: 'center', justifyContent: 'center'
  },
  heartPulse: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center'
  },
  matchDesc: { textAlign: 'center', color: '#eee', fontSize: 13, lineHeight: 20 },

  // Bottom Float Bar
  bottomFloatBar: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly',
    width: '80%', paddingVertical: 10
  },
  actionBtn: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.white,
    elevation: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15
  },
  rejectBtn: { marginRight: 20 },
  likeBtn: { marginLeft: 20 },
  superLikeBtn: {
    width: 70, height: 70, borderRadius: 35, elevation: 15, marginTop: -20
  },
  superInner: {
    flex: 1, borderRadius: 35, alignItems: 'center', justifyContent: 'center', width: '100%'
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },

  // Gallery Styles
  galleryModalWrapper: { flex: 1, backgroundColor: '#000' },
  galleryTopBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: Platform.OS === 'ios' ? 40 : 10
  },
  galleryClose: { padding: 8 },
  galleryCounter: { color: COLORS.white, fontSize: 16 },
  galleryImageWrapper: { width, height: height - 100, justifyContent: 'center' },
  galleryImage: {
    width,
    height: '100%',
    resizeMode: 'contain',
  },

  // Detailed Match Card Styles
  matchCardOuter: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    marginTop: 10,
    elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  matchHeaderGradient: {
    padding: 20, paddingTop: 25
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
  matchHeaderTitle: {
    color: COLORS.white, fontSize: 20, fontFamily: FONTS.RobotoBold
  },
  scoreOrb: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
  },
  orbText: { color: COLORS.primary, fontSize: 13, fontWeight: 'bold' },

  matchAvatarsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  matchAvatarImg: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: COLORS.white
  },
  connectLine: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, width: 60, justifyContent: 'space-between'
  },
  connectDot: { width: 8, height: 8, borderRadius: 4 },

  matchHeaderText: {
    color: COLORS.white, fontSize: 13, textAlign: 'center', fontFamily: FONTS.RobotoMedium
  },

  // Common Section
  commonSection: { padding: 20, paddingBottom: 10 },
  commonTitle: { fontSize: 16, fontFamily: FONTS.RobotoBold, color: '#333', marginBottom: 12 },
  commonChipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  commonChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, marginRight: 10, marginBottom: 10
  },
  commonChipText: { fontSize: 12, fontWeight: 'bold', color: '#555', marginLeft: 6 },

  matchListContainer: {
    padding: 20, paddingTop: 0
  },
  prefRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f7f7f7'
  },
  statusIndicator: {
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center'
  },
  prefLabel: { fontSize: 12, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  prefValue: { fontSize: 15, fontFamily: FONTS.RobotoMedium },

  matchPillBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
  },
  matchPillText: { fontSize: 10, fontWeight: 'bold', color: '#2E7D32' },

  // --- Swipe / Document Card Styles ---
  swipeContainer: {
    height: 200,
    width: '100%',
    borderRadius: 16,
    // overflow: 'hidden', // Removed to allow card to slide off-screen
    position: 'relative',
    backgroundColor: '#ffffff',
    marginVertical: 10,
    zIndex: 100 // Ensure it stays on top during animation
  },
  swipeUnderlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16 // Added since overflow is no longer hidden
  },
  swipeUnderlayText: {
    fontSize: 16, color: '#9E9E9E', fontWeight: 'bold', letterSpacing: 2
  },
  swipePaperCard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFC1CC', // primaryShadow
    borderRadius: 16,
    borderWidth: 1, borderColor: '#F48FB1',
    // 3D Effect
    borderBottomWidth: 6, borderBottomColor: '#D81B60', // Darker Pink
    borderRightWidth: 4, borderRightColor: '#D81B60',

    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#880E4F', shadowOpacity: 0.3, shadowOffset: { width: 2, height: 4 }
  },

  // Document Visuals
  docBody: {
    width: '100%', flex: 1,
    position: 'relative',
    alignItems: 'center', justifyContent: 'center'
  },
  docFold: {
    position: 'absolute', top: -1, right: -1,
    width: 0, height: 0,
    borderStyle: 'solid',
    borderRightWidth: 50, borderTopWidth: 50,
    borderRightColor: 'rgba(0,0,0,0.1)', // Shadow
    borderTopColor: '#D81B60',   // primary
    transform: [{ rotate: '90deg' }],
    zIndex: 20,
    borderTopLeftRadius: 16, // Matches container TR corner after 90deg rotation
    borderBottomRightRadius: 2, // Soften the fold tip
    borderBottomLeftRadius: 2,
    borderTopRightRadius: 2
  },
  swipeContentContainer: {
    alignItems: 'center', justifyContent: 'center', width: '100%', gap: 15
  },
  docLinesContainer: {
    width: '80%', alignItems: 'center', gap: 8
  },
  docLine: {
    height: 10, backgroundColor: COLORS.primary, borderRadius: 5, opacity: 0.3
  },
  swipeInstruction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginVertical: 10
  },
  swipeText: {
    fontSize: 14, color: COLORS.primary, fontFamily: FONTS.RobotoBold, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 10
  }
});
