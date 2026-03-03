import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS, FONTS } from "../../../utlis/comon";
import { useNavigation } from "@react-navigation/native";

// ⭐ IMPORT GLOBAL DATA FROM userData.js
import { getPremiumMatchesData } from "../../../layouts/components/CommonComponents/userData/userData";

export default function PremiumMatchesSection() {
  const navigation = useNavigation();

  // Load premium matches data from userData.js
  const profiles = getPremiumMatchesData();

  // 👉 SEPARATE FUNCTION FOR CONNECT BUTTON
  const handleConnectPress = (user) => {
    console.log("CONNECT NOW CLICKED:", user.name);
    alert(`Connection Request Sent to ${user.name}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Premium Matches ({profiles.length})</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("PremiumMatchesScreen")}
        >
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        horizontal
        data={profiles}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 18 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("UserDetailsScreen", { user: item })
            }
          >
            {/* IMAGE */}
            <View style={styles.imageWrapper}>
              <Image source={item.images?.[0]} style={styles.profileImage} />

              {/* VIP / CROWN BADGE */}
              {item.isVip ? (
                <Image
                  source={item.vipBadge}
                  style={styles.badge}
                  resizeMode="contain"
                />
              ) : (
                item.normalBadge && (
                  <Image
                    source={item.normalBadge}
                    style={styles.badge}
                    resizeMode="contain"
                  />
                )
              )}
            </View>

            {/* DETAILS */}
            <View style={styles.detailsWrapper}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.subline}>
                {item.age} yrs, {item.height}
              </Text>

              <Text style={styles.subline}>
                {item.religion}, {item.location}
              </Text>
            </View>

            {/* CONNECT BUTTON */}
            <TouchableOpacity
              style={styles.connectBtn}
              activeOpacity={0.7}
              onPress={() => handleConnectPress(item)}
            >
              <Ionicons
                name="heart" // Changed icon to heart for "Connect"
                size={16}
                color="#FFF"
              />
              <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ===================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { marginTop: 25 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  heading: {
    fontSize: 18,
    fontFamily: FONTS.RobotoMedium,
    color: "#000",
  },

  seeAll: {
    fontSize: 15,
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
  },

  card: {
    width: 200, // Widened
    height: 310,
    backgroundColor: "#fff",
    marginLeft: 16, // Adjusted spacing
    borderRadius: 20,
    // Modern Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20, // Space for shadow
  },

  imageWrapper: {
    width: "100%",
    height: 180, // Taller image
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Ensure image doesn't bleed
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  badge: {
    width: 24,
    height: 24,
    position: "absolute",
    top: 10,
    right: 10,
  },

  detailsWrapper: {
    paddingHorizontal: 14,
    paddingTop: 12,
    flex: 1,
  },

  name: {
    fontSize: 17, // Larger font
    fontFamily: FONTS.RobotoBold,
    color: "#000",
  },

  subline: {
    color: "#666",
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONTS.RobotoRegular,
  },

  connectBtn: {
    marginHorizontal: 14,
    marginBottom: 14,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: COLORS.primary, // Filled Button
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  connectText: {
    color: "#FFF",
    marginLeft: 6,
    fontFamily: FONTS.RobotoBold,
    fontSize: 13,
  },
});
