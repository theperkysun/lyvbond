import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../../../utlis/comon";
import ChatService from "../../../services/ChatService";

export default function ChatOnlineRow() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadOnline = async () => {
      try {
        const users = await ChatService.getOnlineUsers();
        // Filter only true online users or use isOnline flag
        if (users) {
          const online = users.filter(u => u.isOnline);
          setOnlineUsers(online);
        }
      } catch (e) {
        console.log("Error loading online users", e);
      }
    };
    loadOnline();
  }, []);

  if (onlineUsers.length === 0) return null;

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10, paddingLeft: 16 }}
      data={onlineUsers}
      keyExtractor={i => i.matchId || i._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ChatView", {
            chatId: item.conversationId || item._id, // Ideally passing userId and letting chat view resolve conversation
            userId: item._id,
            name: item.name,
            image: { uri: item.profileImage },
            online: item.isOnline
          })}
        >
          <View style={styles.wrap}>

            {/* WRAPPER allows dot to float outside DP cleanly */}
            <View style={styles.avatarWrapper}>

              {/* PERFECT CIRCLE image */}
              <View style={styles.dpCircle}>
                <Image source={{ uri: item.profileImage }} style={styles.dp} />
              </View>

              {/* FIXED ONLINE DOT — 50% inside 50% outside */}
              <View style={styles.liveDot} />
            </View>

            {/* Name */}
            <Text numberOfLines={1} style={styles.name}>{item.name?.split(' ')[0]}</Text>

          </View>
        </TouchableOpacity>
      )}
    />
  );
}


/* ==================== STYLES ==================== */

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: 18 },

  /* Outer wrapper — DP stays rounded, dot sits outside safely */
  avatarWrapper: {
    width: 64, height: 64,
    justifyContent: "center", alignItems: "center",
    position: "relative",
    // Ring effect optional
    // borderRadius: 32, borderWidth: 1.5, borderColor: COLORS.primary
  },

  /* Clean clipped circular DP */
  dpCircle: {
    width: 58, height: 58,
    borderRadius: 29,
    overflow: "hidden"
  },

  dp: { width: "100%", height: "100%", resizeMode: "cover" },

  /* Floating Online Dot (balanced position) */
  liveDot: {
    width: 16, height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success || "#04d66e",
    position: "absolute",
    bottom: 2, right: 2,
    borderWidth: 2.5, borderColor: "#fff",
    elevation: 4
  },

  name: {
    fontSize: 12, width: 64, textAlign: "center",
    marginTop: 6, color: "#444", fontFamily: FONTS.RobotoMedium
  }
});
