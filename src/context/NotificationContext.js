import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import { useAuth } from './AuthContext'; // To get the userToken

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Utility to format "time ago"
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHrs > 0) return `${diffHrs}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return 'Just now';
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { userToken } = useAuth(); // Assuming useAuth exposes userToken

    const fetchNotifications = useCallback(async () => {
        if (!userToken) {
            setNotifications([]);
            return;
        }

        setIsLoading(true);
        console.log(`🔔 Fetching notifications from: ${BASE_URL}/notification`);
        try {
            const response = await axios.get(`${BASE_URL}/notification`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (response.data && response.data.success) {
                // Map API data to the format expected by the frontend
                const apiNotifications = response.data.data.map((item) => {
                    // Enrich title based on type and name
                    let titleParts = [];
                    const name = item.data?.name || "Someone";

                    if (item.type === 'CONNECTION_REQUEST') {
                        titleParts = [
                            { text: name, bold: true },
                            { text: " sent you a connection request! 💖", bold: false }
                        ];
                    } else if (item.type === 'CONNECTION_ACCEPTED') {
                        titleParts = [
                            { text: name, bold: true },
                            { text: " accepted your connection request! ✨", bold: false }
                        ];
                    } else if (item.type === 'CHAT_MESSAGE' || item.type === 'MESSAGE') {
                        titleParts = [
                            { text: name, bold: true },
                            { text: " sent you a message.", bold: false }
                        ];
                    } else if (item.type === 'VIEWED_PROFILE') {
                        titleParts = [
                            { text: name, bold: true },
                            { text: " viewed your profile.", bold: false }
                        ];
                    } else if (item.type === 'MATCHES_NEAR_YOU' || item.type === 'NEARBY_MATCH') {
                        titleParts = [
                            { text: "New matches found near you!", bold: true }
                        ];
                    } else {
                        titleParts = [{ text: item.title, bold: true }];
                    }

                    return {
                        id: item._id,
                        titleParts,
                        message: item.body,
                        time: formatTimeAgo(item.createdAt),
                        seen: item.isRead,
                        images: item.data?.profileImage ? [item.data.profileImage] : [],
                        type: item.type,
                        data: item.data || {},
                    };
                });
                setNotifications(apiNotifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userToken]);

    useEffect(() => {
        fetchNotifications();

        // Polling or integrating with FCM/Socket could go here
    }, [fetchNotifications]);

    const markAsSeen = async (id) => {
        // Optimistic UI update
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, seen: true } : n
            )
        );

        if (!userToken) return;

        try {
            await axios.patch(`${BASE_URL}/notification/${id}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error);
            // Could revert optimistic update on failure
        }
    };

    const markAllAsRead = async () => {
        // Optimistic UI update
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, seen: true }))
        );

        if (!userToken) return;

        try {
            await axios.patch(`${BASE_URL}/notification/read-all`, {}, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            // Re-fetch to sync with server on failure
            fetchNotifications();
        }
    };

    const unseenCount = notifications.filter((n) => !n.seen).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            isLoading,
            markAsSeen,
            markAllAsRead,
            unseenCount,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

