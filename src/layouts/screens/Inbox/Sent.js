import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Alert, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import InboxService from "../../../services/InboxService";
import ChatService from "../../../services/ChatService";
import { useAuth } from "../../../context/AuthContext";
import { COLORS, FONTS } from "../../../utlis/comon";
import { useNavigation } from "@react-navigation/native";
import PremiumUpgradePopup from "../../components/Popups/PremiumUpgradePopup";

export default function Sent() {
  const navigation = useNavigation();
  const { userInfo, fetchCurrentUser } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuId, setMenuId] = useState(null);

  // Premium Popup State
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [selectedUserForPremium, setSelectedUserForPremium] = useState(null);

  const isPremium = userInfo?.subscriptionType === 'premium';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await InboxService.getSent();
      if (res.success) setList(res.data);
    } catch (e) {
      console.log(e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  const handleRemind = async (item) => {
    try {
      if (!item.actions || !item.actions.canRemind) return alert("Already reminded today or not allowed.");
      await InboxService.remindRequest(item._id); // item._id is the Request ID
      alert("Reminder Sent!");
      fetchData(); // Refresh UI to update button state
    } catch (e) {
      alert("Failed to send reminder");
    }
  };

  const toggleMenu = (id) => {
    setMenuId(menuId === id ? null : id);
  };

  const handleCancelRequest = async () => {
    try {
      if (!menuId) return;
      await InboxService.cancelRequest(menuId);
      Alert.alert("Success", "Request Cancelled");
      fetchData(); // Refresh list
    } catch (e) {
      Alert.alert("Error", "Failed to cancel request");
    } finally {
      setMenuId(null);
    }
  };

  const handleBlurAction = (user) => {
    // Alert.alert("Premium Feature", "Upgrade to Premium to view contact details and unlock calling/whatsapp.");
    setSelectedUserForPremium(user);
    setShowPremiumPopup(true);
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
      }
    } catch (e) { console.error("Chat error", e); }
  };

  const handleCall = (user) => {
    if (!isPremium) return handleBlurAction(user);
    if (!user || (!user.phoneNumber && !user.phone)) {
      Alert.alert("Error", "Phone number not available");
      return;
    }
    Linking.openURL(`tel:${user.phoneNumber || user.phone}`).catch(() => Alert.alert("Error", "Could not dial"));
  };

  const handleWhatsApp = (user) => {
    if (!isPremium) return handleBlurAction(user);
    if (!user || (!user.phoneNumber && !user.phone)) {
      Alert.alert("Error", "Phone number not available");
      return;
    }
    const phone = (user.phoneNumber || user.phone).replace(/[^\d]/g, '');
    const text = `Hi ${user.name}, I found you on LyvBond.`;
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`).catch(() => Alert.alert("Error", "Could not open WhatsApp"));
  };


  if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
  return (
    <View style={styles.container}>

      {/* 🔹 Top Title + Filter */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>All Requests <Text style={{ color: COLORS.primary }}>({list.length})</Text></Text>
        <TouchableOpacity onPress={fetchData}>
          <Ionicons name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 🔥 SENT REQUEST LIST */}
      <FlatList
        data={list}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const user = item.toUserId;
          if (!user) return null;

          let age = "N/A";
          if (user.dob && user.dob.year) {
            age = new Date().getFullYear() - parseInt(user.dob.year);
          }
          const height = user.preferences?.height || "N/A";
          const occupation = user.education?.profession || user.education?.workType || "N/A";

          return (
            <TouchableWithoutFeedback onPress={() => setMenuId(null)}>
              <TouchableWithoutFeedback onPress={() => setMenuId(null)}>
                <View style={styles.card}>

                  {/* 1. Main Profile Area (Clickable) */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("UserDetailsScreen", { userId: user._id })}
                  >
                    <View style={styles.cardContent}>
                      <Image source={{ uri: user.profileImage || 'https://via.placeholder.com/150' }} style={styles.profile} />

                      <View style={styles.infoCol}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{user.name || user.firstName}</Text>
                        </View>
                        <Text style={styles.details}>{age} yrs, {height} • {occupation}</Text>

                        {/* Status Badge */}
                        <View style={styles.statusBadge}>
                          <Ionicons name="time-outline" size={14} color="#F57C00" />
                          <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                      </View>

                      {/* Date + 3-dot menu */}
                      <View style={styles.rightActions}>
                        <TouchableOpacity onPress={(e) => {
                          e.stopPropagation();
                          toggleMenu(item._id);
                        }} style={{ padding: 4, marginTop: 4 }}>
                          <Ionicons name="ellipsis-vertical" size={20} color="#888" />
                        </TouchableOpacity>

                        {/* MENU POPUP */}
                        {menuId === item._id && (
                          <View style={styles.menuPopup}>
                            <TouchableOpacity onPress={(e) => {
                              e.stopPropagation();
                              handleCancelRequest();
                            }} style={{ padding: 5 }}>
                              <Text style={styles.menuText}>Cancel Request</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>


                  {/* STATUS & ACTIONS DIVIDER */}
                  <View style={styles.divider} />


                  {/* ACTION BUTTONS (Outside Main Touchable) */}
                  <View style={styles.actions}>

                    <TouchableOpacity style={styles.actionItem} onPress={() => handleRemind(item)}>
                      <View style={[styles.iconCircle, { backgroundColor: item.actions?.canRemind ? '#FFEBEE' : '#EEE' }]}>
                        <Ionicons name="notifications-outline" size={18} color="#D32F2F" />
                      </View>
                      <Text style={styles.actionLabel}>{item.actions?.canRemind ? "Remind" : "Reminded"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionItem, !isPremium && { opacity: 0.5 }]}
                      onPress={() => {
                        console.log("Sent Chat Clicked");
                        isPremium ? handleChat(user) : handleBlurAction(user);
                      }}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1976D2" />
                      </View>
                      <Text style={styles.actionLabel}>Chat</Text>
                    </TouchableOpacity>

                    {/* WhatsApp */}
                    <TouchableOpacity
                      style={[styles.actionItem, !isPremium && { opacity: 0.5 }]}
                      onPress={() => {
                        console.log("Sent WhatsApp Clicked");
                        handleWhatsApp(user);
                      }}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: '#E0F2F1' }]}>
                        <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                      </View>
                      <Text style={styles.actionLabel}>WhatsApp</Text>
                    </TouchableOpacity>

                    {/* Call */}
                    <TouchableOpacity
                      style={[styles.actionItem, !isPremium && { opacity: 0.5 }]}
                      onPress={() => {
                        console.log("Sent Call Clicked");
                        handleCall(user);
                      }}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: '#F3E5F5' }]}>
                        <Ionicons name="call-outline" size={18} color="#9C27B0" />
                      </View>
                      <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>

                  </View>

                </View>
              </TouchableWithoutFeedback>
            </TouchableWithoutFeedback>
          )
        }}
      />

      <PremiumUpgradePopup
        visible={showPremiumPopup}
        onClose={() => setShowPremiumPopup(false)}
        user={selectedUserForPremium}
        onViewPlans={() => {
          setShowPremiumPopup(false);
          navigation.navigate('SubscriptionScreen');
        }}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA"
  },

  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 15
  },

  title: {
    fontSize: 16, fontFamily: FONTS.RobotoBold, color: "#333"
  },

  /* CARD */
  card: {
    backgroundColor: "#fff", marginBottom: 16, borderRadius: 20, padding: 16,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8
  },

  cardContent: { flexDirection: 'row', marginBottom: 10 },

  profile: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },

  infoCol: { flex: 1, marginLeft: 14, justifyContent: 'center' },

  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, color: '#222', fontFamily: FONTS.RobotoBold },

  details: { fontSize: 13, color: '#555', fontFamily: FONTS.RobotoMedium, marginTop: 2 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 6,
    backgroundColor: '#FFF3E0', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8
  },
  statusText: { fontSize: 11, color: '#E65100', fontWeight: 'bold', marginLeft: 4 },

  rightActions: { alignItems: 'flex-end', minWidth: 60 },
  date: { fontSize: 11, color: '#888' },


  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },

  actions: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, paddingHorizontal: 10 },

  actionItem: { alignItems: "center", width: 70 },

  iconCircle: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4
  },

  actionLabel: { fontSize: 12, color: "#555", fontFamily: FONTS.RobotoMedium },

  /* MENU POPUP STYLES */
  menuPopup: {
    position: "absolute", right: 0, top: 25,
    backgroundColor: "#fff", padding: 10, borderRadius: 8,
    elevation: 6, zIndex: 999, minWidth: 140
  },
  menuText: { fontSize: 13, color: "#FF5252", fontFamily: FONTS.RobotoBold },

  upgradeTip: {
    backgroundColor: '#FAFAFA', padding: 8, borderRadius: 8, alignItems: 'center'
  },
  upgradeText: { fontSize: 12, color: '#888', fontStyle: 'italic' }

});
