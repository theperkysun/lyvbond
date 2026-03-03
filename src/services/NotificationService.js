import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

class NotificationService {

    constructor() {
        this.createChannel();
    }

    async createChannel() {
        await notifee.createChannel({
            id: 'lyvbond_channel_v1',
            name: 'LyvBond Notifications',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });
    }

    // Request User Permission
    async requestUserPermission() {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                console.log("Notification permission denied");
                return false;
            }
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
    }

    // Get FCM Token
    async getFcmToken() {
        try {
            await messaging().registerDeviceForRemoteMessages();
            const fcmToken = await messaging().getToken();
            console.log('🔥 FCM Token:', fcmToken);
            return fcmToken;
        } catch (error) {
            console.log("Error getting FCM token:", error);
            return null;
        }
    }

    // Save Token to Backend
    async saveTokenToBackend(userToken, fcmToken) {
        if (!fcmToken || !userToken) return;
        try {
            await axios.post(`${BASE_URL}/notification/fcm-token`, { fcmToken }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            console.log("✅ FCM Token synced with backend");
            await AsyncStorage.setItem('fcmTokenSynced', fcmToken);
        } catch (error) {
            console.log("Error syncing FCM token:", error);
        }
    }

    // Foreground Message Handler
    registerForegroundHandler() {
        return messaging().onMessage(async remoteMessage => {
            console.log('🔔 Foreground Notification:', remoteMessage);
            const { title, body } = remoteMessage.notification || {};

            // Display System Notification even in foreground
            await notifee.displayNotification({
                title: title || "New Notification",
                body: body || "You have a new message!",
                android: {
                    channelId: 'lyvbond_channel_v1',
                    smallIcon: 'ic_launcher',
                    pressAction: {
                        id: 'default',
                    },
                },
                data: remoteMessage.data, // Pass data for click handling
            });
        });
    }
}

export default new NotificationService();
