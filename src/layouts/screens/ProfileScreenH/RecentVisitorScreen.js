import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import AdvancedProfileCard from "../../../layouts/components/CommonComponents/AdvancedProfileCard";
import { COLORS, FONTS } from "../../../utlis/comon";

// ⭐ IMPORT DATA FROM userData.js
import { getRecentVisitorsData } from "../../../layouts/components/CommonComponents/userData/userData";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ❤️ GET DATA FROM FUNCTION
const recentVisitors = getRecentVisitorsData();

export default function RecentVisitorScreen({ navigation }) {
  const CARD_HEIGHT = SCREEN_HEIGHT * 0.88;

  const renderItem = ({ item }) => (
    <View style={[styles.cardContainer, { height: CARD_HEIGHT }]}>
      <AdvancedProfileCard
        card={item}
        onPress={() =>
          navigation.navigate("UserDetailsScreen", { user: item })
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Recent Visitors</Text>
          <Text style={styles.count}>({recentVisitors.length})</Text>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('FilterScreen')}
        >
          <Icon name="filter-list" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <FlatList
        data={recentVisitors}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
  },

  titleContainer: { flexDirection: "row", alignItems: "baseline" },

  title: {
    fontSize: 22,
    fontFamily: FONTS.RobotoMedium,
    color: "#000",
    marginRight: 5,
  },

  count: {
    fontSize: 18,
    fontFamily: FONTS.RobotoMedium,
    color: "#000",
  },

  filterButton: { padding: 5 },

  cardContainer: { width: "100%" },
});
