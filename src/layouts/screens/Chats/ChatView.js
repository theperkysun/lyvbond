import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
  LayoutAnimation,
  UIManager,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { chatUsers } from "./chatData";
import { COLORS, FONTS } from "../../../utlis/comon";

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageView from "react-native-image-viewing";
import { useAuth } from "../../../context/AuthContext";
import ChatService from "../../../services/ChatService";
import SocketService from "../../../services/SocketService";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChatView({ route, navigation }) {
  const { chatId, userId, name, image, online, lastSeen } = route.params || {};
  const { userInfo } = useAuth(); // Get current user

  const [chat, setChat] = useState({
    id: chatId, // Conversation ID
    otherUserId: userId,
    name: name || "Unknown",
    image: image || null,
    online: online || false,
    lastSeen: lastSeen || null,
    messages: []
  });

  // Sync state if params change
  useEffect(() => {
    setChat(prev => ({
      ...prev,
      id: chatId,
      otherUserId: userId,
      name: name || prev.name,
      image: image || prev.image,
      online: online !== undefined ? online : prev.online,
      lastSeen: lastSeen || prev.lastSeen
    }));
  }, [chatId, userId, name]);

  const [messages, setMessages] = useState([]); // Separate state for flexibility
  const [blockStatus, setBlockStatus] = useState({ blockedByMe: false, blockedByOther: false });
  const [messageText, setMessageText] = useState("");
  const [attachVisible, setAttachVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Image Viewer & Upload State
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Progress Bar & Modals State
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // Loaded dynamically from backend
  const [discussionModalVisible, setDiscussionModalVisible] = useState(false);
  const [genericModalVisible, setGenericModalVisible] = useState(false);
  const [genericModalData, setGenericModalData] = useState({ title: "", desc: "" });

  // In Person Meet States
  const [meetModalVisible, setMeetModalVisible] = useState(false);
  const [meetLocations, setMeetLocations] = useState([]);
  const [meetRequestState, setMeetRequestState] = useState(null);
  const [meetLoading, setMeetLoading] = useState(false);
  // Ghosting Alert State
  const [ghostModalVisible, setGhostModalVisible] = useState(route.params?.isGhostingAlert || false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // Blink (Show/Hide) animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }), // fade in
        Animated.delay(2000), // stay visible for 2 seconds
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }), // fade out
        Animated.delay(2000) // stay hidden for 2 seconds
      ])
    ).start();
  }, [pulseAnim, opacityAnim]);

  const stages = [
    { title: "Shortlist", status: currentStageIndex > 0 ? "completed" : (currentStageIndex === 0 ? "in-progress" : "incomplete") },
    { title: "Two calls", status: currentStageIndex > 1 ? "completed" : (currentStageIndex === 1 ? "in-progress" : "incomplete") },
    { title: "In person meet", status: currentStageIndex > 2 ? "completed" : (currentStageIndex === 2 ? "in-progress" : "incomplete") },
    { title: "Family", status: currentStageIndex > 3 ? "completed" : (currentStageIndex === 3 ? "in-progress" : "incomplete") },
    { title: "Discussion", status: currentStageIndex > 4 ? "completed" : (currentStageIndex === 4 ? "in-progress" : "incomplete") },
  ];

  const handleStageClick = async (stage, index) => {
    // Stage logic: if index is strictly greater than current progression, block it.
    if (index > currentStageIndex) {
      return;
    }

    if (index === 2) {
      setMeetModalVisible(true);
      fetchMeetData();
    } else if (index === 3) {
      setGenericModalData({ title: "Family Involvement", desc: "It's time to involve the family! Coordinating functionality will be implemented soon." });
      setGenericModalVisible(true);
    } else if (index === 4) {
      setDiscussionModalVisible(true);
    }
  };

  const fetchMeetData = async () => {
    if (!chat.otherUserId) return;
    try {
      setMeetLoading(true);

      // 1. Check if there's an existing meet request
      const reqRes = await ChatService.getMeetRequestState(chat.otherUserId);
      if (reqRes.success && reqRes.meetRequest && reqRes.meetRequest.status !== 'rejected') {
        setMeetRequestState(reqRes.meetRequest);
        setMeetLoading(false);
        return; // Skip fetching locations if we have an active or pending request
      } else {
        setMeetRequestState(null); // Clear rejected or old ones
      }

      // 2. Fallback to fetching nearby cafes/restaurants
      const locRes = await ChatService.getNearbyMeetLocations(chat.otherUserId);
      if (locRes.success) {
        setMeetLocations(locRes.locations);
      } else {
        Alert.alert("Notice", "We couldn't fetch nearby locations. Location services might be disabled.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not fetch In-Person Meet details.");
    } finally {
      setMeetLoading(false);
    }
  };

  const sendMeetRequest = async (location) => {
    if (!chat.otherUserId) return;
    try {
      const res = await ChatService.sendMeetRequest(chat.otherUserId, {
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng
      });
      if (res.success) {
        Alert.alert("Success", "Meet request sent to " + chat.name + "!");
        setMeetRequestState(res.meetRequest);

        // Emit message to chat
        SocketService.emit("message:send", {
          conversationId: chatId,
          senderId: userInfo._id,
          receiverId: chat.otherUserId,
          text: location.name,
          type: 'meet_request',
          metadata: { location: location.name }
        });

        // Add to local state immediately
        const tempMsg = {
          id: Date.now().toString(),
          text: location.name,
          time: new Date().toISOString(),
          fromMe: true,
          type: 'meet_request',
          metadata: { location: location.name }
        };
        setMessages(prev => [tempMsg, ...prev]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not send meet request.");
    }
  };

  const handleMeetResponse = async (status) => {
    if (!meetRequestState) return;
    try {
      const res = await ChatService.respondToMeetRequest(meetRequestState._id, status);
      if (res.success) {
        setMeetRequestState(res.meetRequest);
        if (status === 'accepted') {
          // Immediately refresh UI index if possible, it will automatically bump up 
          setCurrentStageIndex(3);
        } else {
          // Rejected - clear state, refetch locations
          setMeetRequestState(null);
          await fetchMeetData();
        }
      }
    } catch (e) {
      Alert.alert("Error", "Failed to respond.");
    }
  };

  const openInGoogleMaps = (lat, lng, name) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = scheme + `${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open Google Maps");
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  const handleDiscussionDecision = (decision) => {
    setDiscussionModalVisible(false);
    if (decision === 'no') {
      Alert.alert("Match Removed", "You have chosen not to proceed. This connection has been removed.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert("Congratulations!", "Your journey continues. Wish you a happy matchmaking experience!");
      setCurrentStageIndex(5);
    }
  };

  const handleGhostResponse = async (type) => {
    setGhostModalVisible(false);

    if (type === 'unmatch') {
      const msgText = `${userInfo?.name || 'I am'} is not interested in you.`;

      SocketService.emit("message:send", {
        conversationId: chatId,
        senderId: userInfo?._id,
        receiverId: chat.otherUserId,
        text: msgText,
        type: 'text'
      });

      try {
        await ChatService.unmatchUser(chat.otherUserId);
      } catch (e) {
        console.error("Unmatch failed", e);
      }

      navigation.goBack();
    } else if (type === 'busy') {
      const msgText = "I am busy for some reason, I'll be back in a while.";

      SocketService.emit("message:send", {
        conversationId: chatId,
        senderId: userInfo?._id,
        receiverId: chat.otherUserId,
        text: msgText,
        type: 'text'
      });

      const tempMsg = {
        id: Date.now().toString(),
        text: msgText,
        time: new Date().toISOString(),
        fromMe: true,
        type: 'text',
      };
      setMessages(prev => [tempMsg, ...prev]);
    }
  };


  // 0. Fetch Connection Progress (Shortlist & Two Calls status)
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (chat.otherUserId) {
          const res = await ChatService.getConnectionProgress(chat.otherUserId);
          if (res && res.success) {
            // Apply layout animation for a smooth progress transitions dynamically
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCurrentStageIndex(res.currentStageIndex);
          }
        }
      } catch (err) {
        console.log("Error fetching connection progress:", err);
      }
    };
    fetchProgress();
  }, [chat.otherUserId]);

  // 1. Fetch History & Mark Read
  useEffect(() => {
    const fetchHistory = async () => {
      let activeChatId = chat.id || chatId;

      try {
        setLoading(true);

        // A. If no chatId but we have userId, get or start conversation
        if (!activeChatId && chat.otherUserId) {
          console.log("No chatId, starting conversation for userId:", chat.otherUserId);
          const res = await ChatService.startConversation(chat.otherUserId);
          if (res && res.conversationId) {
            activeChatId = res.conversationId;
            setChat(prev => ({ ...prev, id: activeChatId }));
          }
        }

        if (activeChatId) {
          // 1. Fetch
          const res = await ChatService.getMessages(activeChatId);
          let msgs = [];

          if (Array.isArray(res)) {
            msgs = res;
          } else {
            msgs = res.messages || [];
            setBlockStatus(res.blockStatus || { blockedByMe: false, blockedByOther: false });
          }

          setMessages(msgs);

          // 2. Mark Read (Socket)
          if (msgs.length > 0) {
            const lastMsg = msgs[0]; // Newest first
            console.log("Marking conversation read:", activeChatId);
            SocketService.emit("conversation:read", {
              conversationId: activeChatId,
              userId: userInfo._id, // Me
              lastReadMessageId: lastMsg.id // The ID of newest msg I see
            });
          }
        }
      } catch (e) {
        console.log("Error fetching messages:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [chatId, userId]); // Runs when opening this chat or if ID resolved

  // 2. Socket Listeners
  useEffect(() => {
    const handleReceive = (msg) => {
      console.log("Msg received:", msg);
      if (msg.conversationId === chatId) {
        const isMe = userInfo && msg.senderId === userInfo._id;

        // If incoming message and I am on this screen, mark read immediately
        if (!isMe) {
          console.log("Marking new incoming message read immediately");
          SocketService.emit("conversation:read", {
            conversationId: chatId,
            userId: userInfo._id,
            lastReadMessageId: msg._id
          });
        }

        const newUiMsg = {
          id: msg._id || Date.now().toString(),
          text: msg.text,
          time: msg.createdAt || new Date().toISOString(),
          fromMe: isMe,
          type: msg.type || 'msg',
          senderId: msg.senderId,
          isDeleted: msg.isDeletedForEveryone,
          metadata: msg.metadata,
          seen: msg.seen || false
        };
        setMessages(prev => [newUiMsg, ...prev]);
      }
    };

    const handleDeleted = ({ id }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    };

    const handleUpdated = ({ id, text, isDeleted }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === id) {
          return { ...m, text: text, isDeleted: isDeleted };
        }
        return m;
      }));
    };

    const handleSeen = ({ conversationId, seenBy }) => {
      if (conversationId === chatId) {
        setMessages(prev => prev.map(m => {
          if (m.fromMe && !m.seen) {
            return { ...m, seen: true };
          }
          return m;
        }));
      }
    };

    SocketService.on("message:receive", handleReceive);
    SocketService.on("message:deleted", handleDeleted);
    SocketService.on("message:updated", handleUpdated);
    SocketService.on("messages:seen", handleSeen);

    return () => {
      SocketService.off("message:receive", handleReceive);
      SocketService.off("message:deleted", handleDeleted);
      SocketService.off("message:updated", handleUpdated);
      SocketService.off("messages:seen", handleSeen);
    };
  }, [chatId]);

  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState(null);

  // Delete Handlers
  const handleDelete = (msgId, type) => {
    SocketService.emit("message:delete", {
      messageId: msgId,
      type: type,
      userId: userInfo._id,
      conversationId: chatId
    });
    // Local optimistic update for 'me'
    if (type === 'me') {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  const handleLongPress = (item) => {
    if (item.type === 'date' || item.isDeleted) return;
    setMsgToDelete(item);
    setDeleteMenuVisible(true);
  };

  const confirmDelete = (type) => {
    if (msgToDelete) {
      handleDelete(msgToDelete.id, type);
    }
    setDeleteMenuVisible(false);
    setMsgToDelete(null);
  };

  // 3. Send
  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;

    // A. Optimistic Update
    const tempMsg = {
      id: Date.now().toString(),
      text: text,
      time: new Date().toISOString(),
      fromMe: true,
      type: 'msg'
    };
    setMessages(prev => [tempMsg, ...prev]);
    setMessageText("");

    // B. Socket Emit
    if (userInfo && userInfo._id) {
      const receiver = chat.otherUserId;
      if (receiver) {
        SocketService.emit("message:send", {
          conversationId: chatId,
          senderId: userInfo._id,
          receiverId: receiver, // Crucial for backend to route
          text: text
        });
      } else {
        console.error("Missing receiver ID");
      }
    }
  };


  // ---------- STATUS TEXT (online / last seen) ----------
  const statusText = useMemo(() => {
    if (chat.online) return "Online";
    if (!chat.lastSeen) return "Last seen recently";

    const last = new Date(chat.lastSeen);
    const now = new Date();
    const diffMs = now - last;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `Recently`;
  }, [chat.online, chat.lastSeen]);

  // ---------- MESSAGES WITH DATE SEPARATORS ----------
  const messagesWithDates = useMemo(() => {
    if (!Array.isArray(messages)) return [];

    const items = [];
    let lastDateKey = null;

    // Sort Oldest -> Newest to determine date headers correctly
    messages
      .slice()
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .forEach((m) => {
        const d = new Date(m.time);
        const key = d.toDateString();

        if (key !== lastDateKey) {
          lastDateKey = key;
          items.push({
            type: "date",
            id: `date-${key}`,
            label: formatDateLabel(d),
          });
        }

        items.push({ type: "msg", ...m });
      });

    // Reverse to Newest -> Oldest for inverted FlatList
    return items.reverse();
  }, [messages]);




  // -------- header menu handlers --------
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const onViewProfile = () => { closeMenu(); handleHeaderPress(); };

  const handleBlockAction = async () => {
    closeMenu();
    try {
      if (blockStatus.blockedByMe) {
        await ChatService.unblockUser(chat.otherUserId);
        setBlockStatus(prev => ({ ...prev, blockedByMe: false }));
        Alert.alert("Success", "User unblocked");
      } else {
        Alert.alert("Block User", "Are you sure you want to block this user?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block", style: "destructive", onPress: async () => {
              await ChatService.blockUser(chat.otherUserId);
              setBlockStatus(prev => ({ ...prev, blockedByMe: true }));
            }
          }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Action failed");
    }
  };

  const onReport = () => { closeMenu(); Alert.alert("Report Profile", "Profile reported."); };

  const openAttach = () => setAttachVisible(true);
  const closeAttach = () => setAttachVisible(false);

  const handleImagePick = async (type) => {
    closeAttach();
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1500,
      maxHeight: 1500
    };

    const callback = async (res) => {
      if (res.didCancel || res.errorCode) return;
      const asset = res.assets[0];

      setUploading(true); // Start Loading

      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'image.jpg',
      });

      try {
        const uploadRes = await ChatService.uploadChatImage(formData);
        if (uploadRes.success) {
          const url = uploadRes.url;
          SocketService.emit("message:send", {
            conversationId: chatId,
            senderId: userInfo._id,
            receiverId: chat.otherUserId,
            text: url,
            type: 'image'
          });

          const tempMsg = {
            id: Date.now().toString(),
            text: url,
            time: new Date().toISOString(),
            fromMe: true,
            type: 'image'
          };
          setMessages(prev => [tempMsg, ...prev]);
        }
      } catch (e) {
        console.error("Image send failed", e);
        Alert.alert("Error", "Failed to send image");
      } finally {
        setUploading(false); // Stop Loading
      }
    };

    if (type === 'Camera') launchCamera(options, callback);
    else launchImageLibrary(options, callback);
  };

  const openImageViewer = (url) => {
    setCurrentImage(url);
    setImageViewVisible(true);
  };

  // ---------- Header Navigation ----------
  const handleHeaderPress = () => {
    // Fix: Use chat.otherUserId (the user's ID), not chat.id (conversation ID)
    const targetUserId = chat.otherUserId;

    const foundUser = {
      _id: targetUserId, // UserDetails expects _id
      name: chat.name,
      images: [chat.image],
      online: chat.online,
      basicDetails: { userId: targetUserId },
      about: "No details available."
    };

    // Pass both userId explicitly and the user object
    navigation.navigate("UserDetailsScreen", {
      userId: targetUserId,
      user: foundUser
    });
  };

  // ---------- message row ----------
  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateWrap}>
          <Text style={styles.dateText}>{item.label}</Text>
        </View>
      );
    }

    // Image Message
    if (item.type === 'image') {
      const isMe = item.senderId === userInfo?._id || item.fromMe;

      // Handle Deleted Image
      if (item.isDeleted) {
        return (
          <Pressable
            style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}
            onLongPress={() => handleLongPress(item)}
          >
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, { backgroundColor: isMe ? '#ccc' : '#e0e0e0' }]}>
              <Text style={[styles.msgText, { fontStyle: 'italic', color: isMe ? '#555' : '#777' }]}>
                This message was deleted
              </Text>
              <Text style={[styles.msgTime, { color: isMe ? '#555' : '#777' }]}>{formatTime(new Date(item.time))}</Text>
            </View>
          </Pressable>
        );
      }

      return (
        <Pressable
          style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}
          onLongPress={() => handleLongPress(item)}
          onPress={() => openImageViewer(item.text)}
        >
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, { padding: 4, backgroundColor: isMe ? COLORS.primary : '#F0F2F5' }]}>
            <Image
              source={{ uri: item.text }}
              style={{ width: 200, height: 200, borderRadius: 12 }}
              resizeMode="cover"
            />
            <Text style={[styles.msgTime, { color: isMe ? COLORS.white : '#777', paddingHorizontal: 6 }]}>{formatTime(new Date(item.time))}</Text>
          </View>
        </Pressable>
      );
    }

    // Call System Message
    if (item.type === 'call') {
      const isMe = item.senderId === userInfo?._id || item.fromMe;
      const isMissed = item.metadata?.status === 'missed' || item.text.toLowerCase().includes('missed');
      const callType = item.metadata?.callType || (item.text.toLowerCase().includes('video') ? 'video' : 'audio');

      const Content = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: isMissed ? '#FFEBEE' : (isMe ? 'rgba(255,255,255,0.2)' : COLORS.white),
            justifyContent: 'center', alignItems: 'center', marginRight: 12
          }}>
            <Ionicons
              name={isMissed ? "call" : (callType === 'video' ? "videocam" : "call")}
              size={20}
              color={isMissed ? '#D32F2F' : (isMe ? COLORS.white : '#555')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 15, fontWeight: '600',
              color: isMe ? COLORS.white : '#222',
              marginBottom: 2
            }}>
              {item.text}
            </Text>
            <Text style={{
              fontSize: 11,
              color: isMe ? 'rgba(255,255,255,0.8)' : '#666'
            }}>
              {formatTime(new Date(item.time))}
            </Text>
          </View>
        </View>
      );

      return (
        <View style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}>
          {isMe ? (
            <LinearGradient
              colors={[COLORS.primary, '#FF9A9E']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.bubbleMe, { minWidth: 200, paddingVertical: 12 }]}
            >
              <Content />
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleThem, { minWidth: 200, paddingVertical: 12 }]}>
              <Content />
            </View>
          )}
        </View>
      );
    }

    const isMe = item.fromMe;
    return (
      <Pressable
        style={[styles.msgRow, isMe ? styles.rowRight : styles.rowLeft]}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={1000} // User requested 2 seconds
        android_ripple={{ color: 'transparent' }}
      >

        {item.type === 'meet_request' ? (
          <TouchableOpacity
            style={[{ maxWidth: '85%', padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }, isMe ? { backgroundColor: '#e3f2fd', borderColor: '#90caf9' } : { backgroundColor: '#fff3e0', borderColor: '#ffcc80' }]}
            onPress={() => {
              if (!isMe) {
                setMeetModalVisible(true);
                fetchMeetData();
              }
            }}>
            <Ionicons name="location" size={24} color={isMe ? "#1976d2" : "#f57c00"} />
            <View style={{ marginLeft: 10, flexShrink: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: FONTS.RobotoMedium, color: '#333', lineHeight: 20 }}>
                {isMe ? 'You sent a meeting point request at ' : `${chat.name} sent you an In Person Meet location request at `}
                <Text style={{ fontFamily: FONTS.RobotoBold }}>{item.metadata?.location || item.text}</Text>
              </Text>
              {!isMe && <Text style={{ fontSize: 11, color: '#f57c00', marginTop: 4, fontFamily: FONTS.RobotoBold }}>Tap to view and respond</Text>}
            </View>
          </TouchableOpacity>
        ) : isMe ? (
          <LinearGradient
            colors={item.isDeleted ? ['#ccc', '#ccc'] : [COLORS.primary, '#FF9A9E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe]}
          >
            <Text style={[styles.msgText, { color: item.isDeleted ? '#555' : COLORS.white, fontStyle: item.isDeleted ? 'italic' : 'normal' }]}>{item.text}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 }}>
              <Text style={[styles.msgTime, { color: item.isDeleted ? '#555' : 'rgba(255,255,255,0.8)', marginTop: 0 }]}>{formatTime(new Date(item.time))}</Text>
              {!item.isDeleted && (
                <Ionicons
                  name={item.seen ? "checkmark-done" : "checkmark"}
                  size={16}
                  color={item.seen ? "#00E676" : "#fffc37ff"}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleThem, item.isDeleted && { backgroundColor: '#e0e0e0' }]}>
            <Text style={[styles.msgText, item.isDeleted && { fontStyle: 'italic', color: '#777' }]}>{item.text}</Text>
            <Text style={styles.msgTime}>{formatTime(new Date(item.time))}</Text>
          </View>
        )}

      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      {/* ---------- MODERN HEADER (OUTSIDE KEYBOARD VIEW) ---------- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerUser} onPress={handleHeaderPress}>
          <View style={styles.avatarWrap}>
            <Image source={chat.image} style={styles.avatar} />
            {chat.online && <View style={styles.onlineDotHeader} />}
          </View>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>{chat.name}</Text>
            <Text style={styles.statusText} numberOfLines={1}>{statusText}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("AudioCallScreen", {
              isCaller: true,
              userId: chat.otherUserId,
              name: chat.name,
              profileImage: chat.image
            })}
          >
            <Ionicons name="call" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("VideoCallScreen", {
              isCaller: true,
              userId: chat.otherUserId,
              name: chat.name,
              profileImage: chat.image
            })}
          >
            <Ionicons name="videocam" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={openMenu}>
            <Ionicons name="ellipsis-vertical" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- FLOATING PROGRESS BAR ---------- */}
      <View style={styles.progressBarWrapperOuter}>
        <View style={styles.progressBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.progressBarScroll}
          >
            {stages.map((stage, index) => {
              const isCompleted = stage.status === 'completed';
              const isInProgress = stage.status === 'in-progress';
              const isPending = stage.status === 'incomplete';

              const textColor = isPending ? '#9e9e9e' : (isInProgress ? '#FFB300' : '#4CAF50'); // Yellow text for active
              const circleBgColor = isPending ? '#E0E0E0' : (isInProgress ? '#FFC107' : '#4CAF50'); // Yellow circle for active
              const circleSize = isInProgress ? 34 : 26;

              const lineIsGreen = isCompleted;
              const lineColor = lineIsGreen ? '#4CAF50' : '#E0E0E0';

              const showFloatingClick = isInProgress && (index === 2 || index === 3 || index === 4);

              return (
                <View key={index} style={styles.stageContainer}>

                  <View style={styles.trackContainer}>
                    {index < stages.length - 1 && (
                      <View
                        style={[
                          styles.connectingLine,
                          {
                            backgroundColor: lineColor,
                            width: 75,
                            left: circleSize / 2,
                          }
                        ]}
                      />
                    )}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleStageClick(stage, index)}
                      style={[
                        styles.stageCircle,
                        {
                          width: circleSize,
                          height: circleSize,
                          borderRadius: circleSize / 2,
                          backgroundColor: circleBgColor,
                          elevation: isInProgress ? 5 : (isCompleted ? 2 : 0),
                          shadowColor: isInProgress ? '#FFC107' : '#4CAF50',
                          shadowOpacity: isInProgress ? 0.4 : 0,
                          shadowRadius: 5,
                          shadowOffset: { width: 0, height: 2 },
                          borderWidth: isPending ? 0 : 3,
                          borderColor: isPending ? 'transparent' : (isInProgress ? '#FFF8E1' : '#E8F5E9')
                        }
                      ]}>
                      {isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
                      {isInProgress && <Ionicons name="time" size={20} color="#fff" />}
                      {isPending && <Text style={{ fontSize: 12, color: '#9e9e9e', fontFamily: FONTS.RobotoBold }}>{index + 1}</Text>}
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.stageNames, { color: textColor, fontWeight: isInProgress ? 'bold' : 'normal' }]}>
                    {stage.title}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* GLOBAL FLOATING TOOLTIP */}
      {stages[currentStageIndex] && stages[currentStageIndex].status === 'in-progress' && (currentStageIndex === 2 || currentStageIndex === 3 || currentStageIndex === 4) && (
        <Animated.View
          style={[
            styles.globalFloatingTip,
            {
              left: 35 + (currentStageIndex * 75), // adjust spacing dynamically
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim // Blink visibility
            }
          ]}
        >
          <View style={styles.globalFloatingTipTriangle} />
          <Text style={styles.floatingTipText}>Click here</Text>
        </Animated.View>
      )}

      {/* ---------- CONTENT WITH KEYBOARD HANDLING ---------- */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* List */}
        <FlatList
          data={messagesWithDates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          inverted
          showsVerticalScrollIndicator={false}
        />

        {/* Input / Blocked Message */}
        {blockStatus.blockedByMe ? (
          <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#f9f9f9' }}>
            <Text style={{ color: '#555', textAlign: 'center', marginBottom: 10, fontFamily: FONTS.RobotoRegular }}>
              You blocked this user to continue conversation you have unblock.
            </Text>
            <TouchableOpacity
              onPress={handleBlockAction}
              style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
            >
              <Text style={{ color: COLORS.white, fontFamily: FONTS.RobotoMedium }}>Unblock</Text>
            </TouchableOpacity>
          </View>
        ) : blockStatus.blockedByOther ? (
          <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#f9f9f9' }}>
            <Text style={{ color: '#555', textAlign: 'center', fontStyle: 'italic', fontFamily: FONTS.RobotoRegular }}>
              {chat.name} has blocked you.
            </Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <View style={styles.inputBar}>
              <TouchableOpacity style={styles.attachBtn} onPress={openAttach}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>

              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                style={styles.input}
                placeholder="Message..."
                placeholderTextColor="#999"
                multiline
              />

              <TouchableOpacity style={styles.camBtn} onPress={() => handleImagePick("Camera")}>
                <Ionicons name="camera" size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={22} color={COLORS.white} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>


      {/* ---------- DELETE MENU MODAL ---------- */}
      <Modal
        visible={deleteMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setDeleteMenuVisible(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Message Options</Text>

            {msgToDelete?.fromMe && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete('everyone')}>
                <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="trash-bin" size={20} color="#D32F2F" />
                </View>
                <View>
                  <Text style={styles.actionTextWarn}>Delete for everyone</Text>
                  <Text style={styles.actionSubText}>Remove for all participants</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete('me')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F5F5F5' }]}>
                <Ionicons name="trash-outline" size={20} color="#333" />
              </View>
              <View>
                <Text style={styles.actionText}>Delete for me</Text>
                <Text style={styles.actionSubText}>Remove from your chat only</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={() => setDeleteMenuVisible(false)}>
              <View style={[styles.actionIcon, { backgroundColor: '#F5F5F5' }]}>
                <Ionicons name="close" size={20} color="#333" />
              </View>
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ---------- HEADER MENU ---------- */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={onViewProfile}><Text style={styles.menuText}>View Profile</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleBlockAction}>
              <Text style={styles.menuText}>{blockStatus.blockedByMe ? "Unblock Member" : "Block Member"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onReport}><Text style={styles.menuText}>Report</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ---------- ATTACHMENT SHEET ---------- */}
      <Modal visible={attachVisible} transparent animationType="slide" onRequestClose={closeAttach}>
        <Pressable style={styles.attachOverlay} onPress={closeAttach}>
          <View style={styles.attachSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.attachGrid}>
              <AttachItem icon="camera" color="#E91E63" label="Camera" onPress={() => handleImagePick("Camera")} />
              <AttachItem icon="image" color="#9C27B0" label="Gallery" onPress={() => handleImagePick("Gallery")} />
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ---------- LOADING OVERLAY ---------- */}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={{ color: COLORS.white, marginTop: 10, fontFamily: FONTS.RobotoMedium }}>Sending Image...</Text>
        </View>
      )}

      {/* ---------- FULL SCREEN IMAGE VIEWER ---------- */}
      <ImageView
        images={[{ uri: currentImage }]}
        imageIndex={0}
        visible={imageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

      {/* ---------- GENERIC STAGE MODAL ---------- */}
      <Modal visible={genericModalVisible} transparent animationType="fade" onRequestClose={() => setGenericModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setGenericModalVisible(false)}>
          <View style={styles.popupBox}>
            <View style={styles.pIconBg}><Ionicons name="information-circle" size={36} color={COLORS.primary} /></View>
            <Text style={styles.pTitle}>{genericModalData.title}</Text>
            <Text style={styles.pDesc}>{genericModalData.desc}</Text>
            <TouchableOpacity style={styles.pBtnOrange} onPress={() => setGenericModalVisible(false)}>
              <Text style={styles.pBtnTextWhite}>Okay</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ---------- DISCUSSION DECISION MODAL ---------- */}
      <Modal visible={discussionModalVisible} transparent animationType="slide" onRequestClose={() => setDiscussionModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setDiscussionModalVisible(false)}>
          <View style={[styles.popupBox, { paddingBottom: 30 }]}>
            <View style={[styles.pIconBg, { backgroundColor: '#E3F2FD' }]}><Ionicons name="heart-circle" size={40} color="#2196F3" /></View>
            <Text style={styles.pTitle}>Final Decision</Text>
            <Text style={styles.pDesc}>You have reached the key stage of your matrimonial journey! Have you both mutually decided to take this relationship forward and stay together?</Text>
            <View style={styles.pBtnRow}>
              <TouchableOpacity onPress={() => handleDiscussionDecision('no')} style={[styles.pBtnHalf, { borderColor: '#F44336', borderWidth: 1 }]}>
                <Ionicons name="close" size={20} color="#F44336" style={{ marginRight: 5 }} />
                <Text style={[styles.pBtnTextOrange, { color: '#F44336' }]}>No, remove</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDiscussionDecision('yes')} style={[styles.pBtnHalf, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.pBtnTextWhite}>Yes, continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ---------- MEET POPUP MODAL ---------- */}
      <Modal visible={meetModalVisible} transparent animationType="slide" onRequestClose={() => setMeetModalVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMeetModalVisible(false)} />
          <View style={[styles.actionSheet, { width: '100%', height: '85%', paddingBottom: 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>In Person Meet</Text>
            {meetLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : meetRequestState ? (
              // SHOW REQUEST STATUS
              <View style={{ width: '100%', alignItems: 'center', paddingBottom: 20 }}>
                <Ionicons name="location" size={54} color={COLORS.primary} />
                <Text style={[styles.pDesc, { marginVertical: 10, fontFamily: FONTS.RobotoBold, fontSize: 18, color: '#333' }]}>
                  {meetRequestState.location.name}
                </Text>
                <Text style={[styles.pDesc, { color: '#666' }]}>{meetRequestState.location.address}</Text>

                <TouchableOpacity
                  style={[styles.pBtnOrange, { backgroundColor: '#2196F3', flexDirection: 'row', justifyContent: 'center', marginVertical: 20 }]}
                  onPress={() => openInGoogleMaps(meetRequestState.location.lat, meetRequestState.location.lng, meetRequestState.location.name)}>
                  <MaterialCommunityIcons name="google-maps" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.pBtnTextWhite}>Direction</Text>
                </TouchableOpacity>

                {meetRequestState.status === 'accepted' ? (
                  <View style={{ padding: 15, backgroundColor: '#E8F5E9', borderRadius: 10, width: '100%' }}>
                    <Text style={{ textAlign: 'center', color: '#4CAF50', fontFamily: FONTS.RobotoBold, fontSize: 15 }}>Meetup Location Fixed!</Text>
                  </View>
                ) : meetRequestState.senderId === userInfo?._id ? (
                  <Text style={{ textAlign: 'center', color: '#FF9800', fontFamily: FONTS.RobotoMedium, fontSize: 15 }}>Waiting for response...</Text>
                ) : (
                  <View style={[styles.pBtnRow, { marginTop: 10 }]}>
                    <TouchableOpacity onPress={() => handleMeetResponse('rejected')} style={[styles.pBtnHalf, { borderColor: '#F44336', borderWidth: 1 }]}>
                      <Text style={[styles.pBtnTextOrange, { color: '#F44336' }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMeetResponse('accepted')} style={[styles.pBtnHalf, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.pBtnTextWhite}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              // SHOW LOCATIONS LIST
              <View style={{ width: '100%', flex: 1 }}>
                <Text style={{ textAlign: 'center', marginBottom: 15, color: '#666', fontSize: 14 }}>We found some popular spots nearby. Choose one to send an invite.</Text>
                <FlatList
                  data={meetLocations}
                  keyExtractor={(item, index) => item.id.toString() || index.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={{ backgroundColor: '#F5F6FA', padding: 15, borderRadius: 16, marginBottom: 12 }}>
                      <Text style={{ fontSize: 16, fontFamily: FONTS.RobotoBold, color: '#333' }}>{item.name}</Text>
                      <Text style={{ fontSize: 13, color: '#777', marginVertical: 6 }} numberOfLines={2}>{item.address} • {item.distance_km} km away</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                        <TouchableOpacity style={{ padding: 8, paddingLeft: 0, flexDirection: 'row', alignItems: 'center' }} onPress={() => openInGoogleMaps(item.lat, item.lng, item.name)}>
                          <MaterialCommunityIcons name="google-maps" size={20} color="#2196F3" />
                          <Text style={{ marginLeft: 6, color: '#2196F3', fontFamily: FONTS.RobotoMedium, fontSize: 14 }}>Direction</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 }}
                          onPress={() => sendMeetRequest(item)}>
                          <Text style={{ color: '#fff', fontSize: 14, fontFamily: FONTS.RobotoBold }}>Meet Here</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  style={{ maxHeight: '100%' }}
                  ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#999', fontSize: 15 }}>No popular places found nearby.</Text>}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ---------- GHOSTING POPUP MODAL ---------- */}
      <Modal visible={ghostModalVisible} transparent animationType="fade" onRequestClose={() => setGhostModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => { }}>
          <View style={[styles.popupBox, { paddingBottom: 20 }]}>
            <View style={[styles.pIconBg, { backgroundColor: '#ffebee' }]}><MaterialCommunityIcons name="ghost" size={40} color="#f44336" /></View>
            <Text style={styles.pTitle}>Ghosting Alert</Text>
            <Text style={styles.pDesc}>You didn't message {chat.name} for 24 hours. Are you interested in {chat.name}?</Text>

            <View style={{ width: '100%', marginTop: 20 }}>
              <TouchableOpacity style={[styles.pBtnOrange, { marginBottom: 10, width: '100%' }]} onPress={() => handleGhostResponse('interested')}>
                <Text style={[styles.pBtnTextWhite, { textAlign: 'center' }]}>Interested</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pBtnOrange, { backgroundColor: '#f44336', marginBottom: 10, width: '100%' }]} onPress={() => handleGhostResponse('unmatch')}>
                <Text style={[styles.pBtnTextWhite, { textAlign: 'center' }]}>Not Interested</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ padding: 10, alignSelf: 'center' }} onPress={() => handleGhostResponse('busy')}>
                <Text style={{ color: '#555', fontFamily: FONTS.RobotoMedium, fontSize: 14 }}>Busy for some reason, I'll be back in a while</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const AttachItem = ({ icon, color, label, onPress }) => (
  <TouchableOpacity style={styles.attachItem} onPress={onPress}>
    <View style={[styles.attachIconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.attachLabel}>{label}</Text>
  </TouchableOpacity>
);

// -------- helper formatters ----------
function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12; else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

function formatDateLabel(d) {
  const today = new Date();
  const diffDay = Math.floor((stripTime(today) - stripTime(d)) / (1000 * 60 * 60 * 24));
  if (diffDay === 0) return "Today";
  if (diffDay === 1) return "Yesterday";
  const day = d.getDate().toString().padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${monthNames[d.getMonth()]}`;
}

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* HEADER */
  header: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backBtn: { padding: 8, marginRight: 4 },

  headerUser: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    marginRight: 10, position: 'relative'
  },
  avatar: { width: "100%", height: "100%", borderRadius: 20 },
  onlineDotHeader: {
    position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
    backgroundColor: '#4CAF50', borderRadius: 5, borderWidth: 1.5, borderColor: COLORS.white
  },

  headerName: { color: "#222", fontSize: 16, fontFamily: FONTS.RobotoBold },
  statusText: { color: COLORS.primary, fontSize: 11, fontFamily: FONTS.RobotoRegular },

  headerRight: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: 8, marginLeft: 4 },

  /* LIST */
  listContent: { paddingHorizontal: 12, paddingVertical: 10 },

  msgRow: { marginVertical: 4, flexDirection: "row" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  bubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1
  },
  bubbleThem: {
    backgroundColor: "#F0F2F5",
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    // Gradient handled in component
    borderBottomRightRadius: 4,
  },
  msgText: { fontSize: 15, color: "#111", fontFamily: FONTS.RobotoRegular, lineHeight: 22 },
  msgTime: { fontSize: 10, color: "#777", alignSelf: "flex-end", marginTop: 4 },

  dateWrap: { alignSelf: "center", backgroundColor: "#f5f5f5", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginVertical: 10 },
  dateText: { fontSize: 12, color: "#666", fontWeight: '600' },

  /* INPUT */
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#f0f0f0'
  },
  inputBar: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F6FA", borderRadius: 24, paddingVertical: 2, paddingHorizontal: 4,
    marginRight: 8
  },
  attachBtn: { padding: 6 },
  input: { flex: 1, fontSize: 15, color: "#333", maxHeight: 100, paddingHorizontal: 8, fontFamily: FONTS.RobotoRegular },
  camBtn: { padding: 8, marginRight: 4 },

  sendBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
    elevation: 5, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 5
  },

  /* MENUS */
  menuOverlay: { flex: 1, alignItems: "flex-end", paddingTop: 60, paddingRight: 10, backgroundColor: "transparent" },
  menuBox: { backgroundColor: COLORS.white, borderRadius: 12, elevation: 10, paddingVertical: 5, minWidth: 160 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuText: { fontSize: 15, color: "#333", fontFamily: FONTS.RobotoMedium },

  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  actionSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  sheetTitle: { fontSize: 18, color: '#333', fontFamily: FONTS.RobotoBold, marginBottom: 20, textAlign: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionText: { fontSize: 16, color: '#333', fontFamily: FONTS.RobotoMedium },
  actionTextWarn: { fontSize: 16, color: '#D32F2F', fontFamily: FONTS.RobotoMedium },
  actionSubText: { fontSize: 12, color: '#888', fontFamily: FONTS.RobotoRegular, marginTop: 2 },

  attachOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  attachSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  attachGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  attachItem: { alignItems: 'center', width: '30%', marginBottom: 20 },
  attachIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  attachLabel: { fontSize: 13, color: '#555', fontFamily: FONTS.RobotoMedium },

  callMsgRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  callMsgBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#dde' },
  callMsgText: { color: '#555', fontSize: 13, fontFamily: FONTS.RobotoMedium },

  /* OVERLAYS */
  loadingOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  viewerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  viewerContent: { flexGrow: 1, justifyContent: 'center' },
  fullImage: { width: '100%', height: '100%' },

  /* PROGRESS BAR STYLES */
  progressBarWrapperOuter: {
    height: 85, // strict fixed height
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  progressBarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 50, // Pill shape
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    marginHorizontal: 12,
    height: 75, // Fix the height
    justifyContent: 'center',
  },
  progressBarScroll: {
    paddingHorizontal: 16,
    alignItems: 'center', // Fix vertical centering inside the scroll wrap
    paddingBottom: 6 // room for tip at bottom
  },
  stageContainer: {
    alignItems: 'center',
    width: 75,
    position: 'relative',
  },
  trackContainer: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  globalFloatingTip: {
    position: 'absolute',
    top: 140, // Adjust based on header + progress height
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: 'center',
  },
  floatingTipText: { color: COLORS.white, fontSize: 10, fontFamily: FONTS.RobotoBold },
  globalFloatingTipTriangle: {
    position: 'absolute',
    top: -5,
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#222'
  },
  connectingLine: {
    position: 'absolute',
    height: 3,
    width: 60,
    left: '50%',
    marginLeft: 13, // half of circle width (26 / 2)
    zIndex: 1,
    borderRadius: 2,
  },
  stageCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stageNames: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: FONTS.RobotoMedium,
    marginTop: 0,
    width: 70
  },

  /* POPUP STYLES */
  popupBox: {
    backgroundColor: '#fff',
    width: '85%',
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 15,
  },
  pIconBg: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  pTitle: {
    fontSize: 20, color: '#222', fontFamily: FONTS.RobotoBold, marginBottom: 10, textAlign: 'center'
  },
  pDesc: {
    fontSize: 14, color: '#666', fontFamily: FONTS.RobotoRegular, textAlign: 'center', lineHeight: 22,
    marginBottom: 24
  },
  pBtnOrange: {
    backgroundColor: COLORS.primary, width: '100%', paddingVertical: 14, borderRadius: 30, alignItems: 'center'
  },
  pBtnTextWhite: { color: '#fff', fontSize: 16, fontFamily: FONTS.RobotoBold },
  pBtnRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  pBtnHalf: {
    flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginHorizontal: 5
  },
  pBtnTextOrange: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.RobotoBold }

});
