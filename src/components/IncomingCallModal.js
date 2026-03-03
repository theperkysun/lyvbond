import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InCallManager from 'react-native-incall-manager';
import notifee, { AndroidImportance } from '@notifee/react-native';
import SocketService from '../services/SocketService';
import WebrtcService from '../services/WebrtcService';
import { COLORS, FONTS } from '../utlis/comon';
import { useAuth } from '../context/AuthContext';

export default function IncomingCallModal() {
    const navigation = useNavigation();
    const { userInfo } = useAuth();
    const [callData, setCallData] = useState(null); // { callerId, name, profileImage, type, offer }
    const appState = useRef(AppState.currentState);

    // Track AppState to decide if we show Notification or Modal
    useEffect(() => {
        const sub = AppState.addEventListener("change", nextAppState => {
            appState.current = nextAppState;
        });
        return () => sub.remove();
    }, []);

    const stopRing = async () => {
        try {
            InCallManager.stopRingtone();
            await notifee.cancelAllNotifications(); // Stop any notification sound
        } catch (e) { console.warn("InCallManager stopRing error", e); }
    };

    const startRing = () => {
        try {
            // Generate pattern: 1s ON, 1s OFF, repeated 30 times (60 seconds)
            const pattern = [0];
            for (let i = 0; i < 30; i++) {
                pattern.push(1000); // Vibrate
                pattern.push(1000); // Pause
            }
            InCallManager.startRingtone('_BUNDLE_', pattern);
        } catch (e) {
            console.warn("InCallManager startRing error", e);
        }
    };

    useEffect(() => {
        const handleIncoming = async (data) => {
            console.log("Incoming Call Received:", data);

            // IF APP IS BACKGROUND -> Show Notification
            if (appState.current.match(/inactive|background/)) {
                console.log("App in background, showing Local Notification");
                await notifee.displayNotification({
                    title: 'Incoming Call',
                    body: `${data.name || 'Someone'} is calling...`,
                    android: {
                        channelId: 'lyvbond_channel_v1',
                        importance: AndroidImportance.HIGH,
                        category: 'call',
                        pressAction: {
                            id: 'default',
                            launchActivity: 'default',
                        },
                        fullScreenAction: {
                            id: 'default',
                        },
                    },
                });
            }

            // ALWAYS set call data (Logic will render Modal when app opens)
            setCallData(data);
            startRing();

            // Notify Caller we are ringing
            SocketService.emit("call:ringing", { callerId: data.callerId });
        };

        const handleEnd = () => {
            console.log("IncomingCallModal: Call Ended/Cancelled");
            stopRing();
            setCallData(null);
        };

        SocketService.on("call:incoming", handleIncoming);
        SocketService.on("call:end", handleEnd); // Caller hung up
        SocketService.on("call:offline", handleEnd);
        SocketService.on("call:failed", handleEnd);
        SocketService.on("disconnect", handleEnd);

        // Listen for specific "Call validation failed" error
        SocketService.on("error", (err) => {
            if (err === 'Call validation failed' || (err && err.message === 'Call validation failed')) {
                handleEnd();
            }
        });

        return () => {
            stopRing();
            SocketService.off("call:incoming", handleIncoming);
            SocketService.off("call:end", handleEnd);
            SocketService.off("call:offline", handleEnd);
            SocketService.off("call:failed", handleEnd);
            SocketService.off("disconnect", handleEnd);
            SocketService.off("error");
        };
    }, []);

    const onAccept = () => {
        stopRing();
        if (!callData) return;
        const { callerId, name, profileImage, type, offer } = callData;

        // Navigate to Call Screen
        const screen = type === 'video' ? 'VideoCallScreen' : 'AudioCallScreen';
        navigation.navigate(screen, {
            isCaller: false,
            userId: callerId,
            name: name,
            profileImage: profileImage,
            offer: offer // Pass offer to screen to handle answer
        });

        // Hide modal
        setCallData(null);
    };

    const onDecline = () => {
        stopRing();
        if (callData) {
            SocketService.emit("call:reject", {
                callerId: callData.callerId,
                receiverId: userInfo?._id, // Me (The rejector)
                type: callData.type
            });
        }
        setCallData(null);
    };

    if (!callData) return null;

    return (
        <Modal visible={!!callData} transparent animationType="slide" onRequestClose={onDecline}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Incoming {callData.type} Call</Text>

                    <View style={styles.avatarContainer}>
                        <Image
                            source={callData.profileImage ? { uri: callData.profileImage } : { uri: 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <Image
                            source={callData.profileImage ? { uri: callData.profileImage } : { uri: 'https://via.placeholder.com/150' }}
                            style={[styles.avatar, styles.avatarBlur]}
                            blurRadius={10}
                        />
                    </View>

                    <Text style={styles.name}>{callData.name}</Text>
                    <Text style={styles.status}>LyvBond {callData.type === 'video' ? 'Video' : 'Audio'} Call...</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={onDecline}>
                            <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                            <Text style={styles.btnText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={onAccept}>
                            <Ionicons name={callData.type === 'video' ? "videocam" : "call"} size={32} color="#fff" />
                            <Text style={styles.btnText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    container: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 10 },

    title: { fontSize: 16, color: '#666', marginBottom: 20, fontFamily: FONTS.RobotoMedium },

    avatarContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, zIndex: 2, borderWidth: 3, borderColor: '#fff' },
    avatarBlur: { position: 'absolute', width: 120, height: 120, borderRadius: 60, zIndex: 1, opacity: 0.5 },

    name: { fontSize: 24, color: '#222', fontFamily: FONTS.RobotoBold, marginBottom: 8, textAlign: 'center' },
    status: { fontSize: 14, color: COLORS.primary, marginBottom: 40, fontFamily: FONTS.RobotoRegular },

    actions: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },

    btn: { alignItems: 'center', justifyContent: 'center' },
    acceptBtn: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: '#4CAF50',
        elevation: 5, shadowColor: '#4CAF50', shadowOpacity: 0.4, shadowRadius: 8
    },
    declineBtn: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: '#F44336',
        elevation: 5, shadowColor: '#F44336', shadowOpacity: 0.4, shadowRadius: 8
    },

    btnText: { marginTop: 8, color: '#333', fontSize: 12, fontWeight: '600' }
});
