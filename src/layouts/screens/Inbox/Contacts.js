import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import InboxService from "../../../services/InboxService";
import ChatService from "../../../services/ChatService"; // Import ChatService
import { useAuth } from "../../../context/AuthContext"; // Import AuthContext
import { COLORS, FONTS } from "../../../utlis/comon";

export default function Contacts() {
  const navigation = useNavigation();
  const { userInfo, fetchCurrentUser } = useAuth(); // Get User Info & Fetcher
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check Subscription
  const isPremium = userInfo?.subscriptionType === 'premium';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await InboxService.getContacts();
      if (res.success) setList(res.data);
    } catch (e) {
      console.log(e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentUser(); // Refresh Profile for latest Subscription Status
  }, []);

  // Handlers
  const handleBlurAction = () => {
    Alert.alert("Premium Feature", "Upgrade to Premium to view contact details and unlock calling/whatsapp.");
  };

  const handleChat = async (user) => {
    try {
      const res = await ChatService.startConversation(user._id);
      const chatId = res.conversation?._id || res.conversationId;
      if (chatId) {
        navigation.navigate("ChatView", {
          chatId: chatId,
          userId: user._id,
          name: user.name,
          image: user.profileImage,
          online: false
        });
      } else {
        Alert.alert("Error", "Could not start chat");
      }
    } catch (e) { console.error("Chat Error", e); }
  };

  const handleCall = (user) => {
    if (!isPremium) return handleBlurAction();

    if (!user || (!user.phoneNumber && !user.phone)) {
      Alert.alert("Error", "Phone number not available");
      return;
    }
    const phone = user.phoneNumber || user.phone;
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert("Error", "Could not open dialer"));
  };

  const handleWhatsApp = (user) => {
    if (!isPremium) return handleBlurAction();

    if (!user || (!user.phoneNumber && !user.phone)) {
      Alert.alert("Error", "Phone number not available");
      return;
    }
    const phone = (user.phoneNumber || user.phone).replace(/[^\d]/g, '');
    const text = `Hi ${user.name}, I found you on LyvBond.`;
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`).catch(() => Alert.alert("Error", "Could not open WhatsApp"));
  };


  if (loading) return <View style={styles.centerEmpty}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      {list.length === 0 ? (
        <View style={styles.centerEmpty}>
          <MaterialCommunityIcons name="contacts" size={60} color="#ddd" />
          <Text style={{ color: '#aaa', marginTop: 10 }}>No contacts yet</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 }}
          refreshing={loading}
          onRefresh={fetchData}
          renderItem={({ item }) => {
            // New structure: item is the Access Object, item.targetUser is the User
            const user = item.targetUser || item;

            if (!user) return null;

            let age = "N/A";
            if (user.dob && user.dob.year) {
              age = new Date().getFullYear() - parseInt(user.dob.year);
            }
            const height = user.preferences?.height || "N/A";
            const cityState = user.location ? `${user.location.city || ''}, ${user.location.state || ''}` : '';

            return (
              <View style={styles.card}>

                <View style={styles.cardContent}>
                  <Image source={{ uri: user.profileImage || 'https://via.placeholder.com/150' }} style={styles.profile} />

                  <View style={styles.infoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{user.name || user.firstName}</Text>
                      <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
                    </View>

                    <Text style={styles.details}>{age} yrs, {height}</Text>
                    <Text style={styles.subDetail}>{cityState || "Location N/A"}</Text>
                  </View>

                  {/* Call Button (Blurred if Free) */}
                  <TouchableOpacity
                    style={[styles.callBtn, !isPremium && { opacity: 0.3, backgroundColor: '#aaa' }]}
                    onPress={() => handleCall(user)}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleChat(user)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
                    <Text style={[styles.actionLabel, { color: COLORS.primary }]}>LyvBond Chat</Text>
                  </TouchableOpacity>

                  <View style={styles.vertDivider} />

                  {/* WhatsApp (Blurred if Free) */}
                  <TouchableOpacity
                    style={[styles.actionBtn, !isPremium && { opacity: 0.3 }]}
                    onPress={() => handleWhatsApp(user)}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    <Text style={[styles.actionLabel, { color: '#25D366' }]}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>

              </View>
            )
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  centerEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    backgroundColor: "#fff", marginBottom: 16, borderRadius: 20, padding: 16,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8
  },

  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

  profile: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },

  infoCol: { flex: 1, marginLeft: 14, justifyContent: 'center' },

  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 17, color: '#222', fontFamily: FONTS.RobotoBold },
  details: { fontSize: 13, color: '#555', fontFamily: FONTS.RobotoMedium },
  subDetail: { fontSize: 12, color: '#888', marginTop: 2, fontFamily: FONTS.RobotoRegular },

  callBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 2
  },

  /* ACTIONS */
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 10 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { marginLeft: 8, fontSize: 13, fontFamily: FONTS.RobotoBold },

  vertDivider: { width: 1, height: 20, backgroundColor: '#eee' },

});
