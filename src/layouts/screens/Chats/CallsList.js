// 📌 src/layouts/screens/Chats/CallsList.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CallService from "../../../services/CallService";
import { useAuth } from '../../../context/AuthContext'; // Re-adding necessary imports
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS } from "../../../utlis/comon";

export default function CallsList() {
  const navigation = useNavigation();
  const { userToken } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    console.log("Chat/CallsList: Fetching calls...");
    try {
      const data = await CallService.getCallHistory();
      console.log("Chat/CallsList: Loaded", data?.length);
      setCalls(data);
    } catch (error) {
      console.error("Error fetching calls", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) fetchCalls();
  }, [userToken]);

  // ... (keep helper functions same)

  // ... (inside row function)

  if (loading && calls.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const onCallPress = (item) => {
    const screen = item.type === 'video' ? "VideoCallScreen" : "AudioCallScreen";
    navigation.navigate(screen, {
      isCaller: true,
      userId: item.userId,
      name: item.name,
      profileImage: item.image
    });
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const row = ({ item }) => {
    const isIncoming = item.direction === 'incoming';
    // Only incoming unanswered calls are "Missed". Outgoing are just "Outgoing".
    const isMissed = (item.status === 'missed' || item.status === 'rejected') && isIncoming;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("UserDetailsScreen", { user: { id: item.userId } })}
      >
        <View style={styles.dpContainer}>
          <Image
            source={item.image ? { uri: item.image } : { uri: "https://via.placeholder.com/150" }}
            style={styles.dp}
          />
          <View style={styles.iconBadge}>
            <Ionicons
              name={item.type === "video" ? "videocam" : "call"}
              size={12}
              color="#fff"
            />
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={styles.topRow}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{formatTime(item.startTime)}</Text>
          </View>

          <View style={styles.subRow}>
            {isMissed ? (
              <MaterialCommunityIcons name="phone-missed" size={14} color="#FF5252" style={{ marginRight: 4 }} />
            ) : (
              <MaterialCommunityIcons
                name={isIncoming ? "phone-incoming" : "phone-outgoing"}
                size={14}
                color={isIncoming ? "#2196F3" : "#10c16d"}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[styles.sub, isMissed && { color: '#FF5252' }]}>
              {isMissed ? "Missed call" : (isIncoming ? "Incoming" : "Outgoing")} • {formatDate(item.startTime)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.callBtn} onPress={() => onCallPress(item)}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>

      </TouchableOpacity>
    )
  };

  return (
    <FlatList
      data={calls}
      keyExtractor={(i) => i.id}
      renderItem={row}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={fetchCalls}
      ListEmptyComponent={
        !loading && <View style={{ padding: 20, alignItems: 'center' }}><Text style={{ color: '#888' }}>No recent calls</Text></View>
      }
    />
  );
}


/*************** UI ***************/
const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: '#fff',
    marginBottom: 12, borderRadius: 16,
    padding: 12,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { height: 2, width: 0 }
  },

  dpContainer: { width: 52, height: 52 },
  dp: { width: "100%", height: "100%", borderRadius: 26, backgroundColor: '#f0f0f0' },

  iconBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.primary, width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff'
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },

  name: { fontSize: 16, fontFamily: FONTS.RobotoBold, color: '#222' },
  time: { fontSize: 11, color: '#999', fontFamily: FONTS.RobotoRegular },

  subRow: { flexDirection: 'row', alignItems: 'center' },
  sub: { fontSize: 12, color: "#888", fontFamily: FONTS.RobotoMedium },

  callBtn: {
    padding: 10, backgroundColor: '#F0F2F5', borderRadius: 20, marginLeft: 10
  }

});
