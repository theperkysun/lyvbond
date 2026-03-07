import React from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { chatUsers } from "./chatData";
import { COLORS, FONTS } from "../../../utlis/comon";

export default function ChatList({ data = [], refreshControl }) {

  const navigation = useNavigation();

  // Format Date Helper
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  };

  const row = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("ChatView", {
        chatId: item.otherUserId || item.id, // For API it's otherUserId or conversationId? 
        // Wait, ChatView uses chatId as conversation ID or User ID?
        // Backend conversation controller returns `id: conv._id` and `otherUserId`.
        // If 1-to-1, we usually chat by User ID or Conversation ID.
        // ChatView logic: `socket.emit("message:send", { conversationId: chat.id ... })`.
        // So passed `chatId` should be the Conversation ID (`item.id` from backend).
        // But ChatView also does `getNewMatchesData().find(u => u.id === chatId)`.
        // There is a mix of `userId` and `conversationId` usage.
        // Let's pass `chatId` as Conversation ID, and also pass `userId` as `otherUserId`.
        chatId: item.id, // Conversation ID
        userId: item.otherUserId, // The other user's ID
        name: item.name,
        image: item.image,
        online: item.online,
        lastSeen: item.lastSeen,
        isFamilyGroup: item.isFamilyGroup
      })}
      style={styles.card}
    >
      {/* AVATAR */}
      <View style={styles.avatarWrapper}>
        <Image source={item.image} style={styles.dp} />
        {item.online && <View style={styles.dot} />}
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.time}>{formatTime(item.time)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.msg, item.unread > 0 && styles.msgUnread]} numberOfLines={1}>
            {item.lastMsg}
          </Text>

          {item.unread > 0 && (
            <View style={styles.unreadBox}>
              <Text style={styles.unreadTxt}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>

    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={i => i.id.toString()}
      renderItem={row}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text style={{ color: '#999', fontFamily: FONTS.RobotoRegular }}>No conversations yet</Text>
        </View>
      }
    />
  );
}


const styles = StyleSheet.create({

  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.white,
    marginBottom: 12, borderRadius: 16,
    padding: 14,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { height: 2, width: 0 }
  },

  avatarWrapper: { width: 56, height: 56 },
  dp: { width: "100%", height: "100%", borderRadius: 28, backgroundColor: '#f0f0f0' },

  dot: {
    position: "absolute", width: 14, height: 14, backgroundColor: COLORS.success || "#05d66f",
    borderRadius: 7, borderWidth: 2, borderColor: COLORS.white,
    right: 0, bottom: 2
  },

  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  name: { fontSize: 16, fontFamily: FONTS.RobotoBold, color: "#222", flex: 1 },
  time: { fontSize: 11, fontFamily: FONTS.RobotoRegular, color: "#888" },

  msg: { fontSize: 13, fontFamily: FONTS.RobotoRegular, color: "#666", flex: 1, marginRight: 8 },
  msgUnread: { fontFamily: FONTS.RobotoMedium, color: "#222" },

  unreadBox: {
    backgroundColor: COLORS.primary, minWidth: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: 'center', paddingHorizontal: 5
  },
  unreadTxt: { color: COLORS.white, fontSize: 10, fontFamily: FONTS.RobotoBold },

});
