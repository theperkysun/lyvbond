import React, { useState, useCallback, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import HeaderHome from "../../components/CommonComponents/HeaderHome";
import ChatOnlineRow from "./ChatOnlineRow";
import ChatList from "./ChatList";
import CallsList from "./CallsList";
import { COLORS, FONTS } from "../../../utlis/comon";
import ChatService from "../../../services/ChatService";
import SocketService from "../../../services/SocketService";

export default function IndexChat() {

  const [tab, setTab] = useState("ALL"); // ALL | UNREAD | LIVE | CALL
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logic - Wrapped in useCallback to be stable
  const fetchChats = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await ChatService.getConversations();
      setConversations(data);
    } catch (e) {
      console.log("Error loading chats", e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Fetch when screen comes into focus (Navigating back)
  useFocusEffect(
    useCallback(() => {
      console.log("IndexChat focused, fetching...");
      fetchChats(false);
    }, [fetchChats])
  );

  // REAL-TIME UPDATES
  useEffect(() => {
    const reloadData = (data) => {
      console.log("Chat List: Realtime Event", data);
      fetchChats(true); // updates in background without full spinner
    };

    // Listen for incoming messages
    SocketService.on("message:receive", reloadData);

    // Listen for my sent messages
    SocketService.on("message:sent", reloadData);

    // Listen for read updates (double ticks)
    SocketService.on("conversation:read:update", reloadData);

    return () => {
      SocketService.off("message:receive", reloadData);
      SocketService.off("message:sent", reloadData);
      SocketService.off("conversation:read:update", reloadData);
    };
  }, [fetchChats]);


  const unreadData = conversations.filter(c => c.unread > 0);
  const unreadCount = unreadData.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>

      {/* Header */}
      <HeaderHome title="Chats" />

      {/* ---------------- MODERN SEGMENTED TABS ---------------- */}
      <View style={styles.tabContainer}>

        <TouchableOpacity
          onPress={() => setTab("ALL")}
          style={[styles.tabSegment, tab === "ALL" && styles.activeSegment]}
        >
          <Text style={[styles.tabText, tab === "ALL" && styles.activeTabText]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("UNREAD")}
          style={[styles.tabSegment, tab === "UNREAD" && styles.activeSegment]}
        >
          <Text style={[styles.tabText, tab === "UNREAD" && styles.activeTabText]}>Unread</Text>
          {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("CALL")}
          style={[styles.tabSegment, tab === "CALL" && styles.activeSegment]}
        >
          <Text style={[styles.tabText, tab === "CALL" && styles.activeTabText]}>Calls</Text>
        </TouchableOpacity>

      </View>

      {/* ================== CONTENT ================== */}
      <View style={{ flex: 1 }}>
        {tab === "ALL" && (
          <>
            <View style={{ paddingVertical: 10 }}>
              <ChatOnlineRow />
            </View>
            <ChatList data={conversations} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchChats} />} />
          </>
        )}
        {tab === "UNREAD" && (<ChatList data={unreadData} />)}
        {tab === "CALL" && (<CallsList />)}
      </View>

    </View>
  );
}


// ======================== STYLES ========================

const styles = StyleSheet.create({

  tabContainer: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
    borderRadius: 12, padding: 4, elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5
  },

  tabSegment: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 10, borderRadius: 10
  },

  activeSegment: { backgroundColor: '#F0F2F5' },

  tabText: { fontSize: 14, color: '#666', fontFamily: FONTS.RobotoMedium },
  activeTabText: { color: '#222', fontFamily: FONTS.RobotoBold },

  badge: {
    backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, marginLeft: 6
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' }

});
