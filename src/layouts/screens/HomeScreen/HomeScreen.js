import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";

import HeaderHome from "../../components/CommonComponents/HeaderHome";

// BODY FILES
import DailyBody from "./DailyBody";
import MyMatchesBody from "./MyMatchesBody";
import NearMeBody from "./NearMeBody";
import Ourrecomendation from "./Ourrecomendation";
import { COLORS, FONTS } from "../../../utlis/comon";

// USER DATA
import {
  getNewMatchesData,
  getPremiumMatchesData,
  getRecentVisitorsData
} from "../../components/CommonComponents/userData/userData";

import { useFocusEffect } from '@react-navigation/native';

import MatchService from "../../../services/MatchService"; // Import Service

export default function HomeScreen({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("daily");
  const [dailyCount, setDailyCount] = useState(0);
  const [nearCount, setNearCount] = useState(0); // Dynamic Near Me Count
  const [matchesCount, setMatchesCount] = useState(0);

  // Handle incoming tab navigation request
  React.useEffect(() => {
    if (route.params?.tab) {
      setSelectedTab(route.params.tab);
    }
  }, [route.params?.tab]);

  // Fetch Counts
  const fetchCounts = async () => {
    try {
      // Daily Matches
      const dailyData = await MatchService.getDailyMatches();
      if (dailyData && dailyData.count !== undefined) {
        setDailyCount(dailyData.count);
        setMatchesCount(dailyData.count); // Since MyMatchesBody uses the same data source currently
      }

      // Near Me Matches (Default 5km)
      const nearData = await MatchService.getNearMeMatches(5);
      if (nearData && nearData.success && Array.isArray(nearData.data)) {
        setNearCount(nearData.data.length);
      }
    } catch (error) {
      console.log("Error fetching counts:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCounts();
    }, [])
  );


  const COUNTS = {
    daily: dailyCount,
    matches: matchesCount,
    near: nearCount, // Use State
  };

  // Render body for each tab
  const renderBody = () => {
    switch (selectedTab) {
      case "daily": return <DailyBody />;
      case "matches": return <MyMatchesBody />;
      case "recomendation": return <Ourrecomendation />;
      case "near": return <NearMeBody />;
      default: return null;
    }
  };

  return (
    <View style={styles.mainContainer}>

      {/* HEADER HEIGHT FIX REMOVED */},

      <HeaderHome title="Matches" />

      {/* -------- TOP TABS -------- */}
      <View style={styles.tabContainer}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >

          {/* Search → NAVIGATE TO SEARCH SCREEN */}
          <TouchableOpacity
            style={[styles.tabBtn, styles.tabInactive]}
            onPress={() => navigation.navigate("SearchScreen")}
          >
            <Text style={styles.icon}>🔍</Text>
            <Text style={styles.tabText}>Search</Text>
          </TouchableOpacity>

          {/* Daily */}
          <TabButton
            label="Daily"
            count={COUNTS.daily}
            active={selectedTab === "daily"}
            onPress={() => setSelectedTab("daily")}
          />

          {/* Daily */}
          <TabButton
            label="Our Recomendation"
            count={COUNTS.daily}
            active={selectedTab === "recomendation"}
            onPress={() => setSelectedTab("recomendation")}
          />

          {/* My Matches */}
          <TabButton
            label="My Matches"
            count={COUNTS.matches}
            active={selectedTab === "matches"}
            onPress={() => setSelectedTab("matches")}
          />

          {/* Near Me */}
          <TabButton
            label="Near Me"
            count={COUNTS.near}
            active={selectedTab === "near"}
            onPress={() => setSelectedTab("near")}
          />

        </ScrollView>
      </View>

      {/* BODY AREA */}
      <View style={{ flex: 1 }}>
        {renderBody()}
      </View>

    </View>
  );
}


// ------------------ TAB BUTTON ------------------

const TabButton = ({ label, count, active, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active ? styles.tabActive : styles.tabInactive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>

      {count !== undefined && (
        <Text style={[styles.count, active && styles.tabTextActive]}>
          {" "}({count})
        </Text>
      )}
    </TouchableOpacity>
  );
};


// ------------------ STYLES ------------------

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  tabContainer: {
    height: 55,
    justifyContent: "center",
    paddingLeft: 10,
  },

  tabScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 14,
    gap: 10,
  },

  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
  },

  tabInactive: {
    backgroundColor: COLORS.white,
    borderColor: "#d0d0d0",
  },

  tabActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },

  tabText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },

  tabTextActive: {
    color: COLORS.white,
  },

  icon: {
    fontSize: 15,
    marginRight: 4,
  },

  count: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
});

