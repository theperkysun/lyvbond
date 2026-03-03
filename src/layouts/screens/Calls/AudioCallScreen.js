import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Dimensions, StatusBar, Platform, DeviceEventEmitter, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { COLORS, FONTS } from "../../../utlis/comon";

// Services
import WebrtcService from "../../../services/WebrtcService";
import SocketService from "../../../services/SocketService";
import { useAuth } from '../../../context/AuthContext';

const { width, height } = Dimensions.get("window");

export default function AudioCallScreen({ route, navigation }) {
    const { isCaller, userId, name, profileImage, offer } = route.params || {};
    const { userInfo } = useAuth(); // Get my info

    const [status, setStatus] = useState("Connecting...");
    const [micOn, setMicOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(false);
    const [duration, setDuration] = useState(0);

    const statusRef = useRef(status);
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Call Setup Effect
    useEffect(() => {
        let isMounted = true;
        let timer = null;

        const setupCall = async () => {
            console.log("☎️ Audio Setup Start", { isCaller, userId });

            try {
                // 1. Local Stream (Audio Only)
                // Note: We ignore the stream return for local state since we don't render it, but we need it for the connection.
                console.log("🎧 Requesting Local Stream...");
                await WebrtcService.startLocalStream(false);
                console.log("🎧 Local Stream Started");

                // 2. Setup Listeners
                SocketService.on("call:answer", async (data) => {
                    console.log("✅ Audio Call Answered");
                    setStatus("Connected");
                    await WebrtcService.handleAnswer(data.answer);
                });

                SocketService.on("call:ringing", () => {
                    if (status === "Connecting...") setStatus("Ringing...");
                });

                SocketService.on("call:offline", () => {
                    console.log("⚠️ User Offline");
                    setStatus("User Offline");
                    setTimeout(() => {
                        navigation.goBack();
                    }, 2000);
                });

                SocketService.on("call:ice", async (data) => {
                    await WebrtcService.handleIce(data.candidate);
                });

                SocketService.on("call:hold", (data) => {
                    setStatus(prev => {
                        if (data.isHold && prev === "Connected") return "On Hold...";
                        if (!data.isHold && prev === "On Hold...") return "Connected";
                        return prev;
                    });
                });

                SocketService.on("call:end", (data) => {
                    console.log("❌ Received call:end", data);
                    if (data && data.reason === 'caller_disconnected' && (statusRef.current === 'Connected' || statusRef.current === 'On Hold...')) {
                        console.log("Ignoring transient dropped socket because call is active");
                        return;
                    }
                    isRemoteEnd.current = true;
                    navigation.goBack();
                });

                SocketService.on("call:rejected", () => {
                    console.log("❌ Received call:rejected");
                    isRemoteEnd.current = true;
                    setStatus("Call Declined");
                    setTimeout(() => navigation.goBack(), 1000);
                });

                // 3. Initiate or Join
                if (isCaller) {
                    console.log("🎧 Creating Peer Connection (Caller)...");
                    WebrtcService.createPeerConnection(null, userId); // No onRemoteStream needed strictly for audio, but tracking is good.

                    const callerName = userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : "Unknown";
                    const callerImg = userInfo ? (userInfo.profileImage || (userInfo.images && userInfo.images[0])) : null;
                    const myId = userInfo?._id;

                    console.log("🎧 Calling startCall...", { userId, myId });
                    await WebrtcService.startCall(userId, {
                        callerId: myId,
                        name: callerName,
                        profileImage: callerImg
                    }, false); // isVideo = false

                    console.log("🎧 startCall completed -> Request Emitted");

                } else if (offer) {
                    console.log("🎧 Handling Incoming Offer...");
                    setStatus("Connected");
                    await WebrtcService.handleOffer(offer, userId, null);
                }

            } catch (err) {
                console.error("Audio call setup failed", err);
                setStatus(`Failed: ${err.message}`);
                // alert("Audio Call Error: " + err.message);
            }
        };

        setupCall();

        return () => {
            isMounted = false;
            WebrtcService.endCall();
            if (timer) clearInterval(timer);
            SocketService.off("call:answer");
            SocketService.off("call:ice");
            SocketService.off("call:end");
            SocketService.off("call:rejected");
            SocketService.off("call:ringing");
            SocketService.off("call:offline");
            SocketService.off("call:hold");
        };
    }, []);

    // Timer Effect
    useEffect(() => {
        let timer;
        if (status === "Connected") {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => { if (timer) clearInterval(timer); };
    }, [status]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const durationRef = useRef(0);
    const isRemoteEnd = useRef(false);

    // Update ref for duration (avoid re-render in listener)
    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);

    const emitEndCall = () => {
        if (isRemoteEnd.current) return;
        isRemoteEnd.current = true;

        const myId = userInfo?._id;
        const dbCallerId = isCaller ? myId : userId;
        const dbReceiverId = isCaller ? userId : myId;
        const targetId = userId;

        console.log("Ending Call -> Emitting call:end");
        SocketService.emit("call:end", {
            targetId: targetId,
            receiverId: dbReceiverId,
            callerId: dbCallerId,
            status: durationRef.current > 0 ? 'completed' : 'missed',
            duration: durationRef.current,
            type: 'audio'
        });
        WebrtcService.endCall();
    };

    useEffect(() => {
        const onRemove = () => {
            emitEndCall();
        };

        const unsubscribe = navigation.addListener('beforeRemove', onRemove);
        return unsubscribe;
    }, [navigation, userId, userInfo]);

    const handleEndCall = () => {
        emitEndCall();
        navigation.goBack();
    };

    const toggleMic = () => {
        const newMicState = !micOn;
        WebrtcService.toggleAudio(newMicState);
        setMicOn(newMicState);
    };

    // Hold Feature Effect
    useEffect(() => {
        let focusListener;

        const handleHold = (hold) => {
            console.log(`Setting audio hold state to: ${hold}`);
            WebrtcService.toggleAudio(!hold ? micOn : false);
            SocketService.emit("call:hold", { targetId: userId, isHold: hold });

            setStatus(prev => {
                if (hold && prev === "Connected") return "On Hold...";
                if (!hold && prev === "On Hold...") return "Connected";
                return prev;
            });
        };

        if (Platform.OS === 'android') {
            focusListener = DeviceEventEmitter.addListener('onAudioFocusChange', (event) => {
                if (event.eventText === 'AUDIOFOCUS_LOSS_TRANSIENT' || event.eventText === 'AUDIOFOCUS_LOSS') {
                    handleHold(true);
                } else if (event.eventText === 'AUDIOFOCUS_GAIN') {
                    handleHold(false);
                }
            });
        }

        const appStateSub = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                handleHold(false); // Restore from hold when app comes to foreground
            }
        });

        return () => {
            if (focusListener) focusListener.remove();
            if (appStateSub) appStateSub.remove();
        };
    }, [micOn, userId]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ImageBackground
                source={profileImage ? { uri: profileImage.uri || profileImage } : require('../../../assets/images/LyvBondLogo.png')}
                blurRadius={80}
                style={styles.bg}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    style={styles.overlay}
                >
                    {/* TOP STATUS */}
                    <SafeAreaView style={styles.topContainer}>
                        <View style={styles.encureWrap}>
                            <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.secureText}>End-to-end Encrypted</Text>
                        </View>
                    </SafeAreaView>

                    {/* CENTER AVATAR */}
                    <View style={styles.centerSection}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.pulseRing, { borderColor: status === "Connected" ? '#4CAF50' : 'rgba(255,255,255,0.2)' }]} />
                            <Image
                                source={profileImage ? (typeof profileImage === 'string' ? { uri: profileImage } : profileImage) : { uri: "https://via.placeholder.com/150" }}
                                style={styles.avatar}
                            />
                        </View>

                        <Text style={styles.name}>{name || "Unknown User"}</Text>
                        <Text style={styles.status}>
                            {status === "Connected" ? formatTime(duration) : status}
                        </Text>
                    </View>

                    {/* BOTTOM CONTROLS */}
                    <View style={styles.bottomControls}>

                        {/* Speaker */}
                        <TouchableOpacity
                            style={[styles.controlBtn, speakerOn && styles.activeBtn]}
                            onPress={() => {
                                const newState = !speakerOn;
                                setSpeakerOn(newState);
                                WebrtcService.setSpeaker(newState);
                            }}
                        >
                            <Ionicons name="volume-high" size={28} color={speakerOn ? COLORS.primary : "#fff"} />
                        </TouchableOpacity>

                        {/* Mic */}
                        <TouchableOpacity
                            style={[styles.controlBtn, !micOn && styles.btnOff]}
                            onPress={toggleMic}
                        >
                            <Ionicons name={micOn ? "mic" : "mic-off"} size={28} color={!micOn ? "#000" : "#fff"} />
                        </TouchableOpacity>

                        {/* Chat Button Removed */}

                    </View>

                    {/* END CALL BUTTON (Separate Row) */}
                    <View style={styles.endCallRow}>
                        <TouchableOpacity style={styles.endBtn} onPress={handleEndCall}>
                            <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>

                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#222" },
    bg: { flex: 1, resizeMode: "cover" },
    overlay: { flex: 1, justifyContent: "space-between", alignItems: "center" },

    topContainer: { width: '100%', alignItems: 'center', marginTop: 20 },
    encureWrap: { flexDirection: 'row', alignItems: 'center', opacity: 0.8 },
    secureText: { color: "#fff", fontSize: 12, marginLeft: 6, fontFamily: FONTS.RobotoRegular },

    centerSection: { alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: -40 },

    avatarContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    pulseRing: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        borderWidth: 1.5,
    },
    avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },

    name: { color: "#fff", fontSize: 32, fontFamily: FONTS.RobotoBold, marginTop: 10, letterSpacing: 0.5 },
    status: { color: "rgba(255,255,255,0.8)", fontSize: 18, marginTop: 10, fontFamily: FONTS.RobotoMedium }, // Adjusted margin

    bottomControls: {
        flexDirection: 'row', width: '80%', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 30
    },
    controlBtn: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
        elevation: 5
    },
    activeBtn: { backgroundColor: '#fff' },
    btnOff: { backgroundColor: '#fff' },

    endCallRow: { marginBottom: 50 },
    endBtn: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF3B30',
        justifyContent: 'center', alignItems: 'center', elevation: 10,
        shadowColor: "#FF3B30", shadowOpacity: 0.4, shadowRadius: 10
    }
});
