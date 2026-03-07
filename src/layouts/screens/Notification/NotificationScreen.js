import React, { useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../../components/CommonComponents/Header";
import { COLORS, FONTS } from "../../../utlis/comon";
import { useNotification } from "../../../context/NotificationContext";
import { getNewMatchesData, getRecentVisitorsData, getPremiumMatchesData } from "../../components/CommonComponents/userData/userData";

import { useFocusEffect } from "@react-navigation/native";

export default function NotificationScreen({ navigation }) {
  const { notifications, isLoading, markAsSeen, markAllAsRead, refreshNotifications } = useNotification();

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  // Helper to find user data for navigation
  const getUserById = (userId) => {
    const allUsers = [
      ...getNewMatchesData(),
      ...getRecentVisitorsData(),
      ...getPremiumMatchesData()
    ];
    return allUsers.find(u => u.id === userId);
  };

  // Group Today / Earlier
  const sections = useMemo(() => {
    return [
      {
        title: "TODAY",
        data: notifications.filter((n) =>
          n.time.includes("m") ||
          n.time.includes("h") ||
          n.time === "Just now"
        ),
      },
      {
        title: "EARLIER",
        data: notifications.filter((n) => n.time.includes("d")),
      },
    ].filter((sec) => sec.data.length > 0);
  }, [notifications]);

  // Convert titleParts → nested text
  const renderTitle = (parts) => (
    <Text style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {parts.map((p, index) => (
        <Text
          key={index}
          style={p.bold ? styles.titleBold : styles.titleNormal}
        >
          {p.text}
        </Text>
      ))}
    </Text>
  );

  const handleNotificationPress = (item) => {
    markAsSeen(item.id);

    const type = item.type;
    const data = item.data || {};

    if (type === "CONNECTION_REQUEST") {
      // 1. Connection Request -> Redirect to Inbox (Tab)
      navigation.navigate("Home", {
        screen: "inbox",
        params: {
          screen: "InboxIndex",
          params: { tab: "Received" }
        }
      });
    }
    else if (
      type === "CHAT_MESSAGE" ||
      type === "MESSAGE" ||
      type === "MEET_REQUEST" ||
      type === "MEET_RESPONSE" ||
      type === "GHOSTING_ALERT" ||
      type === "CALL_INCOMING"
    ) {
      // 2. Chat Message / Meet Requests / Ghosting -> Redirect to specific ChatView (Root Stack screen, hides bottom bar)
      const targetUserId = data.callerId || data.userId || data.senderId || data.responderId || data.otherUserId;
      if (targetUserId || data.conversationId) {
        navigation.navigate("ChatView", {
          chatId: data.conversationId,
          userId: targetUserId,
          name: data.callerName || data.name || data.senderName || data.otherUserName || "Chat",
          image: data.profileImage || data.otherUserImage || item.images?.[0],
          otherUserGender: data.otherUserGender,
          isGhostingAlert: type === "GHOSTING_ALERT"
        });
      } else {
        navigation.navigate("Home", { screen: "Message" }); // Fallback to Chat List Tab
      }
    }
    else if (
      type === "CONNECTION_ACCEPTED" ||
      type === "accepted_request" ||
      type === "connect"
    ) {
      // 3. Accepted connection -> Start Chatting (Root Stack screen, hides bottom bar)
      if (data.userId) {
        navigation.navigate("ChatView", {
          userId: data.userId,
          name: data.name,
          image: item.images?.[0]
        });
      }
    }
    else if (type === "viewed_profile" && data.userId) {
      // 4. Viewed Profile -> Keep in Root Stack (typically hides bottom bar)
      const user = getUserById(data.userId);
      if (user) {
        navigation.navigate("UserDetailsScreen", { user });
      }
    }
    else if (
      type === "PROMOTIONAL" ||
      type === "MATCHES_NEAR_YOU" ||
      type === "NEARBY_MATCH" ||
      type === "MATCH" ||
      type === "daily_match"
    ) {
      // 5. Promotional / Matches -> Home Tab
      navigation.navigate("Home", {
        screen: "HomeScreen",
        params: { tab: "matches" }
      });
    }
  };

  // ------------------------------------------------------
  // RENDER CARD
  // ------------------------------------------------------
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.seen ? styles.unseenCard : styles.seenCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Image section */}
        <View>
          {item.images?.length > 1 ? (
            <View style={styles.multiImgWrap}>
              <Image source={item.images[0]} style={styles.img1} />
              <Image source={item.images[1]} style={styles.img2} />
            </View>
          ) : item.images?.length === 1 ? (
            <Image
              source={typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0]}
              style={styles.singleImg}
            />
          ) : (
            <View style={styles.iconBubble}>
              <Icon name="notifications-outline" size={20} color={COLORS.primary} />
            </View>
          )}

          {/* Unread dot overlay on image or icon */}
          {!item.seen && <View style={styles.unreadDot} />}
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          {renderTitle(item.titleParts)}

          {item.message && (
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
          )}

          {item.type === "horoscope" && (
            <TouchableOpacity style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Time */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header
        title="Notifications"
        onBackPress={() => navigation.goBack()}
        rightText={notifications.some(n => !n.seen) ? "Clear All" : null}
        onRightPress={markAllAsRead}
      />

      {isLoading && notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptySubtitle}>Fetching notifications...</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>We'll notify you when something important happens.</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refreshNotifications}
          >
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTag}>{section.title}</Text>
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

// ------------------------------------------------------
// STYLES — CLEAN ALIGNMENT, BEAUTIFUL UI
// ------------------------------------------------------
const styles = StyleSheet.create({
  sectionTag: {
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
    color: "#777",
    fontFamily: FONTS.RobotoMedium,
  },

  card: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  unseenCard: {
    backgroundColor: "#F0F7FF", // very subtle blue for unread
  },

  seenCard: {
    backgroundColor: "#FFF",
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  singleImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  multiImgWrap: {
    width: 55,
    height: 48,
  },

  img1: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "absolute",
    left: 0,
  },

  img2: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "absolute",
    left: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },

  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
  },

  textWrap: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },

  titleNormal: {
    fontSize: 14,
    color: "#111",
    fontFamily: FONTS.RobotoRegular,
  },

  titleBold: {
    fontSize: 14,
    color: "#111",
    fontFamily: FONTS.RobotoBold,
  },

  message: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },

  readMoreBtn: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    backgroundColor: "#E0F0FF",
    borderRadius: 8,
  },

  readMoreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
  },

  time: {
    fontSize: 12,
    color: "#777",
    marginLeft: 10,
    marginTop: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    color: "#333",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.RobotoRegular,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },
  refreshBtn: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.RobotoBold,
  },
});
