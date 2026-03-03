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

// ⭐ IMPORT NEW MATCHES DATA FROM GLOBAL userData.js
import { getNewMatchesData } from "../../../layouts/components/CommonComponents/userData/userData";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Load data here
const newMatches = getNewMatchesData();

export default function NewMatchesScreen({ navigation }) {
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
          <Text style={styles.title}>New Matches</Text>
          <Text style={styles.count}>({newMatches.length})</Text>
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
        data={newMatches}
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
  container: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
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

  cardContainer: {
    width: "100%",
  },
});
