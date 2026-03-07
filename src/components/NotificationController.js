import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import NotificationService from '../services/NotificationService';

const NotificationController = () => {
    const navigation = useNavigation();

    useEffect(() => {
        // Request permissions
        NotificationService.requestUserPermission();

        // 1. Initial Launch (App was QUIT)
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage && remoteMessage.data) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                    handleNavigation(remoteMessage.data);
                }
            });

        // 2. Background State Open (App in Background)
        const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background:', remoteMessage.notification);
            handleNavigation(remoteMessage.data);
        });

        // 3. Foreground Notification Press (Handled by Notifee)
        const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                console.log('User pressed foreground notification:', detail.notification);
                if (detail.notification && detail.notification.data) {
                    handleNavigation(detail.notification.data);
                }
            }
        });

        return () => {
            unsubscribeOnNotificationOpenedApp();
            unsubscribeForeground();
        };
    }, []);

    const handleNavigation = (data) => {
        console.log("Handling Notification Navigation:", data);
        if (!data) return;

        if (data.type === 'CHAT_MESSAGE') {
            const { conversationId, senderId, senderName, senderImage } = data;

            // ChatView expects: route.params = { chatId, userId, name, image }
            // image passed should be source object { uri: ... } if available

            const imageSource = senderImage ? { uri: senderImage } : null;

            navigation.navigate('ChatView', {
                chatId: conversationId,
                userId: senderId,
                name: senderName,
                image: imageSource,
            });
        } else if (data.type === 'GHOSTING_ALERT') {
            const { conversationId, otherUserId, otherUserName, otherUserImage, otherUserGender } = data;
            const imageSource = otherUserImage ? { uri: otherUserImage } : null;

            navigation.navigate('ChatView', {
                chatId: conversationId,
                userId: otherUserId,
                name: otherUserName,
                image: imageSource,
                otherUserGender: otherUserGender,
                isGhostingAlert: true
            });
        }
    };

    return null;
};

export default NotificationController;
