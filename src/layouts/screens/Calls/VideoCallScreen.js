import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar, Platform, DeviceEventEmitter, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { RTCView } from 'react-native-webrtc';
import { COLORS, FONTS } from "../../../utlis/comon";
import WebrtcService from "../../../services/WebrtcService";
import SocketService from "../../../services/SocketService";
import { useAuth } from '../../../context/AuthContext';

export default function VideoCallScreen({ route, navigation }) {
    const { isCaller, userId, name, profileImage, offer } = route.params || {};
    const { userInfo } = useAuth(); // Get my info

    const [status, setStatus] = useState("Connecting...");
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [duration, setDuration] = useState(0);

    const statusRef = useRef(status);
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        let isMounted = true;
        let timer = null;

        const setupCall = async () => {
            try {
                // 1. Local Stream
                const stream = await WebrtcService.startLocalStream(true);
                if (isMounted) setLocalStream(stream);

                // 2. Setup Listeners
                SocketService.on("call:answer", async (data) => {
                    console.log("Call Answered");
                    setStatus("Connected");
                    await WebrtcService.handleAnswer(data.answer);
                });

                SocketService.on("call:ringing", () => {
                    if (status === "Connecting...") setStatus("Ringing...");
                });

                SocketService.on("call:offline", () => {
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
                    setStatus("Call Ended");
                    setTimeout(() => navigation.goBack(), 1000);
                });

                SocketService.on("call:rejected", () => {
                    isRemoteEnd.current = true;
                    setStatus("Call Declined");
                    setTimeout(() => navigation.goBack(), 1000);
                });

                // 3. Initiate or Join
                if (isCaller) {
                    WebrtcService.createPeerConnection((stream) => {
                        if (isMounted) {
                            setRemoteStream(stream);
                            setStatus("Connected");
                        }
                    }, userId);

                    const callerName = userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : "Unknown";
                    const callerImg = userInfo ? (userInfo.profileImage || (userInfo.images && userInfo.images[0])) : null;
                    const myId = userInfo?._id;

                    await WebrtcService.startCall(userId, {
                        callerId: myId,
                        name: callerName,
                        profileImage: callerImg
                    });

                } else if (offer) {
                    setStatus("Connected");
                    await WebrtcService.handleOffer(offer, userId, (stream) => {
                        if (isMounted) setRemoteStream(stream);
                    });
                }

            } catch (err) {
                console.error("Call setup failed", err);
                setStatus("Failed");
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



    const durationRef = useRef(0);
    const isRemoteEnd = useRef(false);

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

        console.log("Ending Video Call -> Emitting call:end");
        SocketService.emit("call:end", {
            targetId: targetId,
            receiverId: dbReceiverId,
            callerId: dbCallerId,
            status: durationRef.current > 0 ? 'completed' : 'missed',
            duration: durationRef.current,
            type: 'video'
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

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const toggleCamera = () => {
        const newCamState = !cameraOn;
        WebrtcService.toggleVideo(newCamState);
        setCameraOn(newCamState);
    };

    const toggleMic = () => {
        const newMicState = !micOn;
        WebrtcService.toggleAudio(newMicState);
        setMicOn(newMicState);
    };

    const switchCamera = () => {
        WebrtcService.switchCamera();
    };

    const toggleSpeaker = () => {
        const newState = !speakerOn;
        setSpeakerOn(newState);
        WebrtcService.setSpeaker(newState);
    };

    // Hold Feature Effect
    useEffect(() => {
        let focusListener;

        const handleHold = (hold) => {
            console.log(`Setting video hold state to: ${hold}`);
            WebrtcService.toggleAudio(!hold ? micOn : false);
            WebrtcService.toggleVideo(!hold ? cameraOn : false);
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
    }, [micOn, cameraOn, userId]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* --- REMOTE VIDEO (Background) --- */}
            <View style={styles.remoteVideoContainer}>
                {remoteStream ? (
                    <RTCView
                        streamURL={remoteStream.toURL()}
                        style={styles.rtcView}
                        objectFit="cover"
                        zOrder={0}
                    />
                ) : (
                    <Image
                        source={profileImage ? (typeof profileImage === 'string' ? { uri: profileImage } : profileImage) : { uri: "https://via.placeholder.com/400" }}
                        style={styles.remoteVideoImage}
                        resizeMode="cover"
                    />
                )}

                {/* Connect Overlay */}
                {status !== "Connected" && !remoteStream && (
                    <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']} style={styles.connectOverlay}>
                        <Image
                            source={profileImage ? (typeof profileImage === 'string' ? { uri: profileImage } : profileImage) : { uri: "https://via.placeholder.com/150" }}
                            style={styles.avatarLarge}
                        />
                        <Text style={styles.connectName}>{name}</Text>
                        <Text style={styles.connectStatus}>{status}</Text>
                    </LinearGradient>
                )}
            </View>

            {/* --- LOCAL VIDEO (PIP) --- */}
            {localStream ? (
                <View style={styles.localVideoWrap}>
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={styles.rtcView}
                        objectFit="cover"
                        mirror={true}
                        zOrder={1}
                    />
                    {!cameraOn && (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: COLORS.white, fontSize: 10 }}>Camera Off</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.localVideoWrap}>
                    <View style={styles.localVideoPlaceholder}>
                        <Text style={{ color: COLORS.white, fontSize: 10 }}>Loading...</Text>
                    </View>
                </View>
            )}

            {/* --- TIMER (Visible on Top when Connected) --- */}
            {status === "Connected" && (
                <View style={styles.timerChip}>
                    <View style={styles.redDot} />
                    <Text style={styles.timerText}>{formatTime(duration)}</Text>
                </View>
            )}

            {/* --- CONTROLS OVERLAY --- */}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.95)']} style={styles.controlsGradient}>

                {/* Status Bar */}
                <View style={[styles.controlRow, { marginBottom: 20 }]}>
                    <TouchableOpacity style={[styles.btn, !cameraOn && styles.btnOff]} onPress={toggleCamera}>
                        <Ionicons name={cameraOn ? "videocam" : "videocam-off"} size={28} color={cameraOn ? COLORS.white : "#000"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, styles.endBtn]} onPress={handleEndCall}>
                        <MaterialCommunityIcons name="phone-hangup" size={32} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, !micOn && styles.btnOff]} onPress={toggleMic}>
                        <Ionicons name={micOn ? "mic" : "mic-off"} size={28} color={!micOn ? "#000" : COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.utilRow}>
                    <TouchableOpacity style={[styles.iconUtil, { marginRight: 10 }]} onPress={toggleSpeaker}>
                        <Ionicons name={speakerOn ? "volume-high" : "volume-off"} size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconUtil} onPress={switchCamera}>
                        <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

            </LinearGradient>

            {/* Top Back Button */}
            <SafeAreaView style={styles.topArea}>
                <TouchableOpacity style={styles.backBtn} onPress={handleEndCall}>
                    <Ionicons name="chevron-down" size={30} color={COLORS.white} />
                </TouchableOpacity>
            </SafeAreaView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },

    remoteVideoContainer: { flex: 1, width: '100%', height: '100%' },
    remoteVideoImage: { width: '100%', height: '100%' },

    connectOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 2
    },
    avatarLarge: { width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 2, borderColor: COLORS.white },
    connectName: { color: COLORS.white, fontSize: 26, fontFamily: FONTS.RobotoBold },
    connectStatus: { color: '#ccc', fontSize: 16, marginTop: 8, fontFamily: FONTS.RobotoRegular },

    localVideoWrap: {
        position: 'absolute', right: 16, bottom: 160,
        width: 110, height: 160,
        borderRadius: 12, overflow: 'hidden',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
        elevation: 10,
        backgroundColor: '#333',
        zIndex: 5
    },
    rtcView: { width: '100%', height: '100%' },
    localVideoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#444' },

    controlsGradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 180,
        justifyContent: 'flex-end', alignItems: 'center',
        paddingBottom: 40,
        zIndex: 10
    },
    controlRow: { flexDirection: 'row', width: '80%', justifyContent: 'space-evenly', alignItems: 'center' },

    btn: {
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
    },
    btnOff: { backgroundColor: COLORS.white },
    endBtn: {
        backgroundColor: '#FF3B30',
        width: 70, height: 70, borderRadius: 35,
        elevation: 8
    },

    utilRow: { position: 'absolute', top: 20, right: 20 },
    iconUtil: { padding: 10 },

    topArea: { position: 'absolute', top: 10, left: 10, zIndex: 20 },
    backBtn: { padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },

    timerChip: {
        position: 'absolute', top: 50, alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center', zIndex: 20
    },
    redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f00', marginRight: 8 },
    timerText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.RobotoMedium }
});
