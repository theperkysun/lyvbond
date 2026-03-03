//  src/layouts/screens/Chats/CallHistoryScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatUsers } from "./chatData"; // Keep chatUsers for user detail fallback if needed
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';
import { COLORS, FONTS } from "../../../utlis/comon";

export default function CallHistoryScreen({ route, navigation }) {

  const { userId } = route.params;
  const user = chatUsers.find(u => u.id === userId) || { name: "Unknown", image: { uri: "https://via.placeholder.com/150" } }; // Fallback

  const { userToken } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/calls/history`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        // Filter calls related to THIS user
        const userCalls = res.data.filter(c => c.userId === userId);
        setHistory(userCalls);
      } catch (e) {
        console.error("CallHistoryScreen fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    if (userToken) fetchHistory();
  }, [userToken, userId]);

  /* ================== CALL ROW ================== */
  const row = ({ item }) => {
    const isIncoming = item.direction === 'incoming';
    const isMissed = (item.status === 'missed' || item.status === 'rejected') && isIncoming;

    // Format Date/Time
    const dateObj = new Date(item.startTime);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Duration
    const formatDuration = (sec) => {
      if (!sec) return "";
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}m ${s}s`;
    }

    return (
      <View style={styles.row}>

        <Ionicons
          name={item.type === "video" ? "videocam" : "call"}
          size={22}
          color={isMissed ? "#ff4a4a" : "#10c16d"}
        />

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.subText}>
            {isMissed ? "Missed Call" : (isIncoming ? "Incoming Call" : "Outgoing Call")}
          </Text>

          <Text style={styles.timeText}>
            {dateStr} • {timeStr}
            {!isMissed && item.duration > 0 ? ` • ${formatDuration(item.duration)}` : ""}
          </Text>
        </View>

      </View>
    )
  };

  const [menu, setMenu] = useState(false);


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>


        {/* ==================== HEADER ==================== */}
        <View style={styles.header}>

          {/* BACK BUTTON */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>

          {/* DP + NAME (LEFT ALIGNED TOGETHER) */}
          <View style={styles.userRow}>
            <View style={styles.dpWrap}>
              <Image source={user?.image} style={styles.dp} />
            </View>
            <Text style={styles.nameText} numberOfLines={1}>{user?.name}</Text>
          </View>

          {/* RIGHT MENU */}
          <View style={styles.rightRow}>
            <TouchableOpacity><Ionicons name="call" size={24} color="#10c16d" /></TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: 20 }}>
              <Ionicons name="videocam" size={24} color="#10c16d" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={22} color="#000" />
            </TouchableOpacity>
          </View>

        </View>



        {/* ==================== CALL HISTORY LIST ==================== */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#10c16d" />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(i, index) => index.toString()}
            renderItem={row}
            contentContainerStyle={{ paddingVertical: 10 }}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}><Text style={{ color: '#999' }}>No call history</Text></View>
            }
          />
        )}


        {/* ==================== THREE-DOT POPUP ==================== */}
        <Modal transparent visible={menu} animationType="fade">
          <Pressable style={styles.modalBg} onPress={() => setMenu(false)} />

          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Block Member</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Report This Profile</Text></TouchableOpacity>
          </View>

        </Modal>


      </View>
    </SafeAreaView>
  );
}


/* ======================= STYLES ======================= */
const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white },


  /* ========= HEADER FIXED & LEFT ALIGNED ========= */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#e7e7e7"
  },

  /* DP + Name group (beside back button) */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10          // ← space after back icon
  },

  dpWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden"
  },

  dp: { width: "100%", height: "100%", resizeMode: "cover" },

  nameText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginLeft: 10,
    flexShrink: 1
  },

  rightRow: { flexDirection: "row", alignItems: "center" },

  /* ========= CALL ROW ========= */
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  subText: { fontSize: 14, fontWeight: "600", color: "#111" },
  timeText: { fontSize: 12, color: "#666", marginTop: 2 },


  /* ========= POPUP ========= */
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  menuBox: {
    backgroundColor: COLORS.white,
    position: "absolute",
    right: 10,
    top: 60,
    borderRadius: 8,
    elevation: 6,
    paddingVertical: 5,
    width: 170
  },
  menuItem: { padding: 12 },
  menuText: { fontSize: 15, color: "#111" }
});
