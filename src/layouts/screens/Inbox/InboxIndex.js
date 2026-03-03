import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar } from "react-native";
import { COLORS, FONTS } from '../../../utlis/comon';
import { useFocusEffect } from "@react-navigation/native";
import InboxService from "../../../services/InboxService";

// Screens

// Screens
import Received from "./Received";
import Accepted from "./Accepted";
import Contacts from "./Contacts";
import Sent from "./Sent";
import HeaderHome from "../../components/CommonComponents/HeaderHome";


export default function InboxIndex({ navigation, route }) {

  const [activeTab, setActiveTab] = useState(route.params?.tab || "Received");
  const [acceptedCount, setAcceptedCount] = useState(0);

  // Sync tab if route params change
  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const fetchCounts = async () => {
    try {
      const [resHer, resMe] = await Promise.all([
        InboxService.getAccepted('her'),
        InboxService.getAccepted('me')
      ]);
      let total = 0;
      if (resHer.success) total += resHer.data.length;
      if (resMe.success) total += resMe.data.length;
      setAcceptedCount(total);
    } catch (e) {
      console.log('Error fetching counts:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCounts();
    }, [])
  );

  const renderBody = () => {
    switch (activeTab) {
      case "Received": return <Received navigation={navigation} />;
      case "Accepted": return <Accepted navigation={navigation} />;  // moves automatically into acceptedByMe on accept
      case "Contacts": return <Contacts navigation={navigation} />;
      case "Sent": return <Sent navigation={navigation} />;
      default: return null;
    }
  };

  return (
    <View style={styles.mainContainer}>

      {/* ------- HEADER WITH NOTCH SAFE SPACE REMOVED -------- */}
      <HeaderHome title="Inbox" />

      {/* ------- TOP CATEGORY TABS NAVIGATION -------- */}
      <View style={styles.tabContainer}>

        {/* 🔹 Full Width Gray Line Always Visible */}
        <View style={styles.grayLine} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>

          {[
            { key: "Received", label: "Received" },
            { key: "Accepted", label: `Accepted (${acceptedCount})` }, // 📌 DYNAMIC COUNT
            { key: "Contacts", label: "Contacts" },
            { key: "Sent", label: "Sent" }
          ].map((item, index) => {

            const isActive = activeTab === item.key;

            return (
              <View key={index} style={styles.tabButtonWrapper}>

                <TouchableOpacity onPress={() => setActiveTab(item.key)}>
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>

                {/* 🔵 Blue underline only under selected tab */}
                {isActive && <View style={styles.blueLine} />}
              </View>
            );
          })}

        </ScrollView>
      </View>

      {/* ---------- BODY AREA ---------- */}
      <View style={{ flex: 1 }}>
        {renderBody()}
      </View>

    </View>
  );
}



///////////////////  STYLES ///////////////////

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Lighter background for depth
  },

  tabContainer: {
    paddingTop: 10,
    backgroundColor: COLORS.white,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 // Subtle lift
  },

  // Removed grayLine

  tabScroll: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },

  tabButtonWrapper: {
    marginRight: 20,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  tabText: {
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
    color: "#888",
  },

  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.RobotoBold,
  },

  blueLine: {
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    width: "60%",
    position: "absolute",
    bottom: 0,
  }
});
