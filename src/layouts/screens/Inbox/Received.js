import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, ActivityIndicator, Alert, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import InboxService from "../../../services/InboxService";
import { COLORS, FONTS } from "../../../utlis/comon";
import { useAuth } from "../../../context/AuthContext";

export default function Received({ navigation }) {

  const { userInfo, fetchCurrentUser } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectPopup, setShowRejectPopup] = useState(false);

  const isPremium = userInfo?.subscriptionType === 'premium';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await InboxService.getReceived();
      if (res.success) {
        setList(res.data);
      }
    } catch (e) {
      console.log("Error fetching received:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  const handleAccept = async (item) => {
    try {
      if (!item._id) return;
      await InboxService.acceptRequest(item._id);
      setList(list.filter(u => u._id !== item._id));
      navigation.navigate("Inbox", {
        screen: "Accepted",
        params: { openTab: "me" }
      });
    } catch (e) {
      alert("Failed to accept");
    }
  };

  const confirmReject = (item) => {
    setSelectedUser(item);
    setShowRejectPopup(true);
  };

  const handleReject = async () => {
    try {
      if (!selectedUser._id) return;
      await InboxService.rejectRequest(selectedUser._id);
      setList(list.filter(u => u._id !== selectedUser._id));
      setShowRejectPopup(false);
    } catch (e) {
      alert("Failed to reject");
    }
  };


  if (loading) {
    return <View style={styles.centerEmpty}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }


  return (
    <View style={styles.container}>

      {/* TOP HEAD */}
      <View style={styles.topRow}>
        <Text style={styles.allRequests}>All Requests <Text style={{ color: COLORS.primary }}>({list.length})</Text></Text>
        <TouchableOpacity onPress={fetchData}>
          {/* Refresh Icon instead of filter for now */}
          <Ionicons name="refresh" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* EMPTY */}
      {list.length === 0 ? (
        <View style={styles.centerEmpty}>
          <MaterialCommunityIcons name="inbox-outline" size={60} color="#ddd" />
          <Text style={{ color: '#aaa', marginTop: 10 }}>No new requests</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const user = item.fromUserId || {};

            // Age Logic
            let age = "N/A";
            const currentYear = new Date().getFullYear();
            if (user.dob && user.dob.year) {
              age = currentYear - parseInt(user.dob.year);
            }

            const cityState = (user.location && user.location.city) ? `${user.location.city}, ${user.location.state || ''}` : '';
            const occupation = user.education?.profession || user.education?.workType || "N/A";
            const height = user.preferences?.height || "N/A";
            const name = user.name || user.firstName || "Unknown";
            const image = user.profileImage ? { uri: user.profileImage } : { uri: 'https://via.placeholder.com/150' };

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate("UserDetailsScreen", { userId: user._id || item.fromUserId })}
                style={styles.card}
              >

                <View style={styles.cardContent}>
                  <Image source={image} style={styles.profile} />

                  <View style={styles.infoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{name}</Text>
                      <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
                    </View>

                    <Text style={styles.details}>{age} yrs, {height}</Text>
                    <Text style={styles.details}>{occupation}</Text>
                    <Text style={styles.subDetail}>{cityState}</Text>
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => confirmReject(item)}>
                    <Ionicons name="close" size={24} color="#FF5252" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item)}>
                    <Text style={styles.acceptText}>Accept Request</Text>
                    <Ionicons name="checkmark" size={20} color="#fff" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>

              </TouchableOpacity>
            )
          }}
        />
      )}


      {/* POPUP */}
      <Modal transparent visible={showRejectPopup} animationType="fade">
        <View style={styles.popupContainer}>
          <View style={styles.popupBox}>
            <View style={styles.popupIcon}>
              <Ionicons name="alert-circle-outline" size={32} color="#FF5252" />
            </View>
            <Text style={styles.popupTitle}>Reject Request?</Text>
            <Text style={styles.popupSub}>This action cannot be undone.</Text>

            <View style={styles.popupBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRejectPopup(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.finalRejectBtn} onPress={handleReject}>
                <Text style={styles.finalRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View >
  );
}


/**************** STYLES *****************/

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#F8F9FA" },

  topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15
  },
  allRequests: { fontSize: 16, color: "#333", fontFamily: FONTS.RobotoBold },

  centerEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /***** CARD *****/
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8
  },

  cardContent: { flexDirection: 'row', marginBottom: 15 },

  profile: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eee' },

  infoCol: { flex: 1, marginLeft: 14, justifyContent: 'center' },

  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 18, color: '#222', fontFamily: FONTS.RobotoBold },

  details: { fontSize: 14, color: '#555', fontFamily: FONTS.RobotoMedium },
  subDetail: { fontSize: 12, color: '#888', marginTop: 2, fontFamily: FONTS.RobotoRegular },

  dateBadge: {
    position: 'absolute', right: 0, top: 0,
    backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
  },
  dateText: { fontSize: 11, color: '#666', fontWeight: '600' },

  contactRow: { flexDirection: 'row', marginBottom: 12, justifyContent: 'center' },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20
  },
  contactBtnText: { marginLeft: 6, fontSize: 12, fontFamily: FONTS.RobotoMedium, color: '#444' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },

  /* BUTTONS */
  btnRow: { flexDirection: "row", alignItems: 'center' },

  rejectBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center',
    marginRight: 10
  },

  acceptBtn: {
    flex: 1, height: 50, borderRadius: 25,
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }
  },
  acceptText: { color: "#fff", fontSize: 16, fontFamily: FONTS.RobotoBold },

  /***** POPUP *****/
  popupContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  popupBox: { width: '80%', backgroundColor: "#fff", borderRadius: 24, padding: 25, alignItems: 'center' },

  popupIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFEBEE',
    alignItems: 'center', justifyContent: 'center', marginBottom: 15
  },

  popupTitle: { fontSize: 18, fontFamily: FONTS.RobotoBold, color: '#333' },
  popupSub: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8, marginBottom: 20 },

  popupBtnRow: { flexDirection: "row", justifyContent: "space-between", width: '100%' },

  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#F5F5F5', alignItems: 'center', marginRight: 10
  },
  cancelText: { fontFamily: FONTS.RobotoBold, color: "#666" },

  finalRejectBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#FF5252', alignItems: 'center'
  },
  finalRejectText: { fontFamily: FONTS.RobotoBold, color: "#fff" },

});
