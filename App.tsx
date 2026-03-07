/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, AppState, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigation from './src/layouts/navigation/AppNavigation';
import { COLORS } from './src/utlis/comon';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import NotificationController from './src/components/NotificationController';
import IncomingCallModal from './src/components/IncomingCallModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, API_ENDPOINTS } from './src/config/apiConfig';
import 'react-native-gesture-handler';

// Permission Logic
import AppPermissionsScreen from './src/layouts/screens/AppPermissionsScreen';
// @ts-ignore
import { checkLocationPermission, getCurrentLocation } from './src/utils/locationPermission';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [allPermissionsAllowed, setAllPermissionsAllowed] = useState(false);

  // App startup permission check is mostly handled by AppPermissionsScreen 
  // However, we wait to turn off loading initially so the screen can check asynchronously.
  useEffect(() => {
    const init = async () => {
      // Just check if location is granted to start mapping data, but we'll 
      // rely on AppPermissionsScreen to verify ALL permissions.
      const granted = await checkLocationPermission();
      setAllPermissionsAllowed(granted); // Actually AppPermissions will override this immediately if other perms fail
      setLoading(false);
    };

    init();

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const granted = await checkLocationPermission();
        if (granted) {
          // we assume if location is there they passed the gauntlet, but AppPermissions natively loops anyway
          // We just update this listener for the backend GPS updater.
          // setAllPermissionsAllowed(true); -> handled by the screen component cleanly
        }
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (allPermissionsAllowed) {
      getCurrentLocation()
        .then(async (position: any) => {
          console.log('User Location:', position);
          const { latitude, longitude } = position.coords;

          try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
              await axios.patch(
                `${BASE_URL}${API_ENDPOINTS.USER_UPDATE}`,
                { latitude, longitude },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              console.log('✅ Location updated on backend');
            }
          } catch (error) {
            console.log('❌ Failed to update location on backend:', error);
          }
        })
        .catch((error: any) => {
          console.log('Location Error:', error);
        });
    }
  }, [allPermissionsAllowed]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {!allPermissionsAllowed ? (
        <AppPermissionsScreen onAllPermissionsGranted={() => setAllPermissionsAllowed(true)} />
      ) : (
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer
              linking={{
                prefixes: ['lyvbond://', 'https://lyvbond.com', 'http://lyvbond.com'],
                config: {
                  screens: {
                    FamilyInviteIntermediate: 'family-chat/:chatId/:isInvite',
                  },
                },
              }}
            >
              <AppNavigation />
              <IncomingCallModal />
              <NotificationController />
            </NavigationContainer>
          </NotificationProvider>
        </AuthProvider>
      )}
    </SafeAreaProvider>
  );
}

export default App;
