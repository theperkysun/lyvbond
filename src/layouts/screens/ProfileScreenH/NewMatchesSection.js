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

// ⭐ IMPORT REAL DATA FROM GLOBAL userData.js FILE
import { getNewMatchesData } from "../../../layouts/components/CommonComponents/userData/userData";

// Load data
const newMatches = getNewMatchesData();

export default function NewMatchesSection() {
  const navigation = useNavigation();

  // 👉 SEPARATE FUNCTION for Connect Button
  const handleConnectPress = (user) => {
    console.log("Connect Now:", user.name);
    alert(`Connection Request Sent to ${user.name}`);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>
          New Matches ({newMatches.length})
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate("NewMatchesScreen")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        horizontal
        data={newMatches}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 18 }}
        renderItem={({ item }) => (

          // ⭐ CARD PRESS → Go to UserDetailsScreen
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() =>
              navigation.navigate("UserDetailsScreen", { user: item })
            }
          >

            {/* ---------- IMAGE SECTION ---------- */}
            <View style={styles.imageWrapper}>
              <Image
                source={item.images?.[0]}
                style={styles.profileImage}
              />

              {/* VIP / CROWN BADGE */}
              {item.isVip ? (
                <Image
                  source={item.vipBadge}
                  style={styles.badge}
                  resizeMode="contain"
                />
              ) : item.normalBadge ? (
                <Image
                  source={item.normalBadge}
                  style={styles.badge}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            {/* ---------- TEXT SECTION ---------- */}
            <View style={styles.detailsWrapper}>
              <Text style={styles.name}>{item.name}</Text>

              {/* Age + Height */}
              <Text style={styles.subline}>
                {item.age} yrs, {item.height}
              </Text>

              {/* Religion + Location */}
              <Text style={styles.subline}>
                {item.religion}, {item.location}
              </Text>
            </View>

            {/* ---------- CONNECT BUTTON (NO NAVIGATION) ---------- */}
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={() => handleConnectPress(item)}
            >
              <Ionicons name="heart" size={16} color="#FFF" />
              <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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

  /* ---------- CARD ---------- */
  card: {
    width: 200,
    height: 310,
    backgroundColor: "#fff",
    marginLeft: 16,
    borderRadius: 20,
    // Modern Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },

  /* ---------- IMAGE SECTION ---------- */
  imageWrapper: {
    width: "100%",
    height: 180,
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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

  /* ---------- DETAILS SECTION ---------- */
  detailsWrapper: {
    paddingHorizontal: 14,
    paddingTop: 12,
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontFamily: FONTS.RobotoBold,
    color: "#000",
  },

  subline: {
    color: "#666",
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONTS.RobotoRegular,
  },

  /* ---------- CONNECT BUTTON ---------- */
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
