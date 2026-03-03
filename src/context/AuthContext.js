import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { BASE_URL } from '../config/apiConfig';
import SocketService from '../services/SocketService';
import NotificationService from '../services/NotificationService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (email, phoneNumber, password) => {
        setIsLoading(true);
        try {
            const payload = {};
            if (email) payload.email = email;
            if (phoneNumber) payload.phoneNumber = phoneNumber;
            payload.password = password;

            console.log("Logging in with:", payload);

            const response = await axios.post(`${BASE_URL}/auth/login`, payload);

            console.log("Login Response:", response.data);

            const { token, user } = response.data;

            if (token) {
                await AsyncStorage.removeItem('userToken'); // Clear old token
                setUserToken(token);
                await AsyncStorage.setItem('userToken', token);
                console.log("✅ Token successfully stored in Async Storage:", token);
            }

            if (user) {
                setUserInfo(user);
                await AsyncStorage.setItem('userInfo', JSON.stringify(user));
                console.log("✅ User Info stored:", user);
            }

            return true;
        } catch (error) {
            console.log("Login Error Full:", error);
            if (error.response) {
                Alert.alert("Login Failed", error.response.data.message || "Invalid credentials");
            } else if (error.request) {
                Alert.alert("Network Error", "Please check your internet connection or server status.");
            } else {
                Alert.alert("Error", "Something went wrong.");
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const forceLogin = async (token, user) => {
        setIsLoading(true);
        try {
            if (token) {
                await AsyncStorage.removeItem('userToken'); // Clear old token
                setUserToken(token);
                await AsyncStorage.setItem('userToken', token);
            }

            if (user) {
                setUserInfo(user);
                await AsyncStorage.setItem('userInfo', JSON.stringify(user));
            }
            return true;
        } catch (error) {
            console.error("Force login error:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/google`, { idToken });
            console.log("Google Login Response:", response.data);

            const { token, user, isNewUser, email, name, profileImage, firebaseUid } = response.data;

            if (isNewUser) {
                return {
                    success: true,
                    status: 'USER_NOT_FOUND',
                    googleData: { email, name, photo: profileImage, uid: firebaseUid, idToken }
                };
            } else if (token) {
                setUserToken(token);
                await AsyncStorage.setItem('userToken', token);

                if (user) {
                    setUserInfo(user);
                    await AsyncStorage.setItem('userInfo', JSON.stringify(user));
                }
                return { success: true, status: 'LOGIN_SUCCESS' };
            }

            return { success: false, message: "Invalid backend response" };

        } catch (error) {
            console.log("Google Login API Error:", error);
            if (error.response) {
                Alert.alert("Login Failed", error.response.data.message || "Something went wrong");
            } else {
                Alert.alert("Network Error", "Unable to connect to server");
            }
            return { success: false };
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            await axios.post(`${BASE_URL}/logout`);
        } catch (e) {
            console.log("Backend logout failed (non-critical):", e);
        }

        setUserToken(null);
        setUserInfo(null);
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
        } catch (e) {
            console.log("Logout Error:", e);
        }
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');

            if (userToken) {
                setUserToken(userToken);
                setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            }
            setIsLoading(false);
        } catch (e) {
            console.log("isLoggedIn Error:", e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    // 🟢 SOCKET CONNECTION LOGIC
    useEffect(() => {
        if (userInfo && userInfo._id) {
            SocketService.connect(userInfo._id);
        } else {
            SocketService.disconnect();
        }
    }, [userInfo]);

    // 🔔 NOTIFICATION PERMISSION & TOKEN SYNC
    useEffect(() => {
        if (userToken) {
            const syncNotifications = async () => {
                const hasPermission = await NotificationService.requestUserPermission();
                if (hasPermission) {
                    const fcmToken = await NotificationService.getFcmToken();
                    if (fcmToken) {
                        await NotificationService.saveTokenToBackend(userToken, fcmToken);
                    }
                }
            };
            syncNotifications();
        }
    }, [userToken]);

    // 🔔 NOTIFICATION LISTENER (Foreground) - Runs once or cleans up
    useEffect(() => {
        const unsubscribe = NotificationService.registerForegroundHandler();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // 🔴 ONLINE STATUS / HEARTBEAT LOGIC
    useEffect(() => {
        if (!userToken) return;

        console.log("Starting Heartbeat System...");

        const sendHeartbeat = async () => {
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await axios.patch(`${BASE_URL}/status/update`, { lat: latitude, lng: longitude }, {
                            headers: { Authorization: `Bearer ${userToken}` }
                        });
                    } catch (error) {
                        console.log("Heartbeat failed with coords:", error.message);
                    }
                },
                async (error) => {
                    console.log("Heartbeat geo error:", error.message);
                    try {
                        await axios.patch(`${BASE_URL}/status/update`, {}, {
                            headers: { Authorization: `Bearer ${userToken}` }
                        });
                    } catch (err) {
                        console.log("Heartbeat failed without coords:", err.message);
                    }
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
            );
        };

        sendHeartbeat();

        const interval = setInterval(() => {
            if (AppState.currentState === 'active') {
                sendHeartbeat();
            }
        }, 25000);

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                console.log("App Foreground -> Sending Heartbeat");
                sendHeartbeat();

                // 🟢 Ensure Socket is connected & server knows we are online (to flush pending calls)
                if (userInfo && userInfo._id) {
                    SocketService.connect(userInfo._id);
                    SocketService.emit('user:online', { userId: userInfo._id });
                }
            }
        });

        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [userToken]);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = userToken || await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await axios.get(`${BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.user) {
                const user = response.data.user;

                // Optional: Check equality to avoid re-render if data is identical?
                // For now, simple reference stability is enough to stop the infinite effect loop.
                setUserInfo(user);
                await AsyncStorage.setItem('userInfo', JSON.stringify(user));
                return user;
            }
        } catch (error) {
            console.log("Error fetching current user:", error);
        }
    }, [userToken]);

    return (
        <AuthContext.Provider value={{ login, forceLogin, googleLogin, logout, fetchCurrentUser, isLoading, userToken, userInfo, setUserInfo, setUserToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
