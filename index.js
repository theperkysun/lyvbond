/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);

    const { type, callerName, callType } = remoteMessage.data || {};

    if (type === 'CALL_INCOMING') {
        // Display Incoming Call Notification
        await notifee.displayNotification({
            title: 'Incoming Call',
            body: `${callerName || 'Someone'} is inviting you to a ${callType || 'video'} call`,
            android: {
                channelId: 'lyvbond_channel_v1',
                importance: AndroidImportance.HIGH,
                visibility: 1, // Public
                category: 'call',
                waitToDisplay: false,
                pressAction: {
                    id: 'default',
                    launchActivity: 'default',
                },
                // Optional: Add actions like Answer/Decline if we had headless handlers
            },
        });
    }
});

// Handle Background Events (e.g. user pressed notification)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    if (type === EventType.PRESS) {
        // User pressed the notification, app opens automatically
        console.log('User pressed background notification', notification);
    }
});

AppRegistry.registerComponent(appName, () => App);
