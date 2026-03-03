import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TouchableWithoutFeedback, ActivityIndicator, Linking, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import InboxService from "../../../services/InboxService";
import ChatService from "../../../services/ChatService";
import { useAuth } from "../../../context/AuthContext";
import { COLORS, FONTS } from "../../../utlis/comon";
import PremiumUpgradePopup from "../../components/Popups/PremiumUpgradePopup";
import UserService from "../../../services/UserService";

export default function Accepted() {
  const navigation = useNavigation();
  const { userInfo, fetchCurrentUser } = useAuth();
  const [tab, setTab] = useState("her");

  const [listHer, setListHer] = useState([]);
  const [listMe, setListMe] = useState([]);
  const [loading, setLoading] = useState(true);

  // Premium Popup State
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [selectedUserForPremium, setSelectedUserForPremium] = useState(null);

  // Check Subscription
  const isPremium = userInfo?.subscriptionType === 'premium';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resHer, resMe] = await Promise.all([
        InboxService.getAccepted('her'), // Accepted by Her
        InboxService.getAccepted('me')   // Accepted by Me
      ]);

      if (resHer.success) setListHer(resHer.data);
      if (resMe.success) setListMe(resMe.data);
    } catch (e) {
      console.log("Error fetching accepted:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  const activeList = tab === "her" ? listHer : listMe;

  const [menuId, setMenuId] = useState(null);

  const toggleMenu = (id) => {
    setMenuId(menuId === id ? null : id);
  };

  const handleCancelRequest = () => {
    setMenuId(null);
    alert("Request Cancelled"); // TODO: Add API
  };

  const handleBlurAction = (user) => {
    // Alert.alert("Premium Feature", "Upgrade to Premium to view contact details and unlock calling/whatsapp.");
    setSelectedUserForPremium(user);
    setShowPremiumPopup(true);
  };

  const handleChat = async (item) => {
    try {
      const res = await ChatService.startConversation(item._id);

      const chatId = res.conversation?._id || res.conversationId;

      if (chatId) {
        navigation.navigate("ChatView", {
          chatId: chatId,
          userId: item._id,
          name: item.name,
          image: item.profileImage,
          online: false
        });
      } else {
        console.log("Could not start chat", res);
      }
    } catch (e) {
      console.error("Handle Chat Error", e);
    }
  };



  const handleUnlockAndProceed = async (user, actionType) => {
    if (!user.isContactLocked) return true;

    try {
      const res = await UserService.unlockContact(user._id, 'accepted');
      if (res.status === 'unlocked' || res.status === 'already_unlocked') {
        // Create a local update to list to reflect unlock (optional but good)
        const updateList = (list) => list.map(u => {
          const target = tab === "her" ? u.toUserId : u.fromUserId;
          if (target._id === user._id) {
            // Mutate the target user object to set unlocked
            // Note: This is a shallow mutation of the item in state, simpler than deep clone for now
            if (tab === "her") u.toUserId.isContactLocked = false;
            else u.fromUserId.isContactLocked = false;
            // Also update phone if returned
            if (res.fields && res.fields.includes('phoneReveal')) {
              // We might need to refetch to get the actual number if backend didn't return it in 'res' 
              // (unlockContact returns { status, message, fields }, not the user object)
              // For now, prompt user to refresh or try action again? 
              // Ideally invalidating query or refetching. 
              // But we can return true to proceed, assuming 'phone' might be needed? 
              // Wait, if it was null, we don't have it.
              // We need to fetch the number.
            }
          }
          return u;
        });

        // We need to fetch the contact info now because it was null!
        // The unlock call just acknowledged the view.
        // So we should probably refresh the list or fetch specific user details.
        fetchData(); // Simplest approach: Refetch list to get phone numbers
        Alert.alert("Success", "Contact unlocked! Please tap again.");
        return false;
      } else {
        Alert.alert("Unlock Failed", res.message || "Limit reached");
        return false;
      }
    } catch (e) {
      console.error("Unlock Error", e);
      Alert.alert("Error", "Could not unlock contact.");
      return false;
    }
  };

  const handleWhatsApp = async (user) => {
    // Check if locked
    if (user.isContactLocked) {
      const proceeding = await handleUnlockAndProceed(user, 'whatsapp');
      if (!proceeding) return; // Wait for refresh or failure
    }

    // If we are here, it's unlocked. But do we have the phone number?
    // If it was just unlocked, we might need to wait for fetchData. 
    // IF handleUnlockAndProceed returned false, we stopped. 
    // If user.isContactLocked was false initially, we have phone.

    // Fallback: If phone is hidden/masked
    let phoneStr = user.phoneNumber || user.phone;
    if (!phoneStr) {
      Alert.alert("Info", "Contact unlocked. Refreshing...");
      fetchData();
      return;
    }

    let phone = phoneStr.replace(/[^\d]/g, '');

    const text = `Hi ${user.name || user.firstName}, I found your profile on LyvBond.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    Linking.openURL(url).catch(err => {
      console.error("An error occurred", err);
      Alert.alert("Error", "Could not open WhatsApp");
    });
  };

  const handleCall = async (user) => {
    if (user.isContactLocked) {
      const proceeding = await handleUnlockAndProceed(user, 'call');
      if (!proceeding) return;
    }

    let phoneStr = user.phoneNumber || user.phone;
    if (!phoneStr) {
      Alert.alert("Info", "Contact unlocked. Refreshing...");
      fetchData();
      return;
    }

    const url = `tel:${phoneStr}`;

    Linking.openURL(url).catch(err => {
      console.error("An error occurred", err);
      Alert.alert("Error", "Could not open dialer");
    });
  };

  if (loading && listHer.length === 0 && listMe.length === 0) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>

      {/* SEGMENTED CONTROL TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabSegment, tab === "her" && styles.activeSegment]}
          onPress={() => setTab("her")}
        >
          <Text style={[styles.tabText, tab === "her" && styles.activeTabText]}>
            {userInfo?.gender?.toLowerCase() === 'female' ? "Accepted by Him" : "Accepted by Her"}
          </Text>
          {tab === "her" && <View style={styles.tabBadge}><Text style={styles.badgeText}>{listHer.length}</Text></View>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabSegment, tab === "me" && styles.activeSegment]}
          onPress={() => setTab("me")}
        >
          <Text style={[styles.tabText, tab === "me" && styles.activeTabText]}>Accepted by Me</Text>
          {tab === "me" && <View style={styles.tabBadge}><Text style={styles.badgeText}>{listMe.length}</Text></View>}
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchData} style={{ padding: 10 }}>
          <Ionicons name="refresh" size={20} color="#888" />
        </TouchableOpacity>
      </View>


      <FlatList
        data={activeList}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          // Fix logic: 
          // tab='her' -> I sent request (from=Me), she accepted. Show 'toUserId' (Her).
          // tab='me' -> She sent request (to=Me), I accepted. Show 'fromUserId' (Her).
          const targetUser = tab === "her" ? item.toUserId : item.fromUserId;
          const otherUser = (targetUser && targetUser._id) ? targetUser : {
            name: "Unknown User", _id: "missing", profileImage: "https://via.placeholder.com/150",
            dob: {}, preferences: {}, education: {}, location: "Unknown"
          };

          let age = "N/A";
          if (otherUser.dob && otherUser.dob.year) {
            age = new Date().getFullYear() - parseInt(otherUser.dob.year);
          }
          const height = otherUser.preferences?.height || "N/A";

          const professionV = otherUser.education?.profession || otherUser.education?.workType;
          const occupation = (typeof professionV === 'object') ? "N/A" : (professionV || "N/A");

          const cityState = (otherUser.location && typeof otherUser.location === 'object')
            ? `${otherUser.location.city || ''}, ${otherUser.location.state || ''}`
            : (otherUser.location || "Location N/A");

          return (
            <TouchableWithoutFeedback onPress={() => setMenuId(null)}>
              <View style={styles.card}>

                {/* 1. Main Profile Click Area -> Navigates to User Details */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => otherUser._id !== "missing" && navigation.navigate("UserDetailsScreen", { userId: otherUser._id })}
                >
                  <View style={styles.cardContent}>
                    {/* Image */}
                    <Image source={{ uri: otherUser.profileImage || 'https://via.placeholder.com/150' }} style={styles.profile} />

                    {/* Info */}
                    <View style={styles.infoCol}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name}>{otherUser.name || otherUser.firstName || "Unknown"}</Text>
                        {/* Verified badge logic if field exists */}
                        <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
                      </View>

                      <Text style={styles.details}>{age} yrs, {height}</Text>
                      <Text style={styles.details}>{occupation}</Text>
                      <Text style={styles.subDetail}>{cityState}</Text>
                    </View>

                    {/* Menu */}
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
                            <Text style={styles.menuText}>Cancel Connection</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* ACTION BUTTONS (Outside Main Touchable) */}
                <View style={styles.divider} />

                <View style={styles.actionsRow}>
                  {/* CHAT BUTTON */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      console.log("Chat Clicked. Always Allowed.");
                      handleChat(otherUser);
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
                    <Text style={[styles.actionLabel, { color: COLORS.primary }]}>LyvBond Chat</Text>
                  </TouchableOpacity>

                  <View style={styles.vertDivider} />

                  {/* WHATSAPP */}
                  <TouchableOpacity
                    style={[styles.actionBtn]}
                    onPress={() => {
                      console.log("WhatsApp Clicked");
                      handleWhatsApp(otherUser);
                    }}
                  >
                    <Ionicons name={otherUser.isContactLocked ? "lock-closed" : "logo-whatsapp"} size={20} color={otherUser.isContactLocked ? "#888" : "#25D366"} />
                    <Text style={[styles.actionLabel, { color: otherUser.isContactLocked ? '#888' : '#25D366' }]}>WhatsApp</Text>
                  </TouchableOpacity>

                  <View style={styles.vertDivider} />

                  {/* CALL */}
                  <TouchableOpacity
                    style={[styles.actionBtn]}
                    onPress={() => {
                      console.log("Call Clicked");
                      handleCall(otherUser);
                    }}
                  >
                    <Ionicons name={otherUser.isContactLocked ? "lock-closed" : "call"} size={20} color={otherUser.isContactLocked ? "#888" : "#444"} />
                    <Text style={[styles.actionLabel, { color: otherUser.isContactLocked ? "#888" : "#444" }]}>Call</Text>
                  </TouchableOpacity>
                </View>

              </View>
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

  container: { flex: 1, backgroundColor: "#F8F9FA" },

  /* TABS */
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#fff',
    margin: 16, borderRadius: 12, padding: 4, elevation: 2
  },
  tabSegment: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 10, borderRadius: 10
  },
  activeSegment: { backgroundColor: '#F0F2F5' },

  tabText: { fontSize: 13, color: '#666', fontFamily: FONTS.RobotoMedium },
  activeTabText: { color: '#222', fontFamily: FONTS.RobotoBold },

  tabBadge: {
    backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, marginLeft: 6
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },


  /* CARD */
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8
  },

  cardContent: { flexDirection: 'row', marginBottom: 5 },

  profile: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },

  infoCol: { flex: 1, marginLeft: 14, justifyContent: 'center' },

  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 17, color: '#222', fontFamily: FONTS.RobotoBold },

  details: { fontSize: 13, color: '#555', fontFamily: FONTS.RobotoMedium },
  subDetail: { fontSize: 12, color: '#888', marginTop: 2, fontFamily: FONTS.RobotoRegular },

  rightActions: { alignItems: 'flex-end', minWidth: 60 },
  dateText: { fontSize: 11, color: '#888' },

  /* ACTIONS */
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { marginLeft: 6, fontSize: 12, fontFamily: FONTS.RobotoBold, color: '#444' },

  vertDivider: { width: 1, height: 20, backgroundColor: '#eee' },

  /* POPUP */
  menuPopup: {
    position: "absolute", right: 0, top: 25,
    backgroundColor: "#fff", padding: 10, borderRadius: 8,
    elevation: 6, zIndex: 999, minWidth: 140
  },
  menuText: { fontSize: 13, color: "#FF5252", fontFamily: FONTS.RobotoBold },

});
