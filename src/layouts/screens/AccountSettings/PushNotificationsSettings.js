import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView, StatusBar, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../utlis/comon';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

export default function PushNotificationsSettings() {
    const navigation = useNavigation();
    const { userToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const [toggles, setToggles] = useState({
        newInvitations: true,
        newAccepts: true,
        recommendations: true,
        newMatches: true,
        shortlisted: true,
        recentVisitors: true,
        premiumMatches: true,
        pendingInvitations: true,
        inAppSounds: true,
    });

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/notification-settings`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                if (response.data && response.data.data) {
                    const data = response.data.data;
                    // Merge with defaults just in case
                    setToggles(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Error fetching notification settings:", error);
                // Optionally show error toast
            } finally {
                setIsLoading(false);
            }
        };

        if (userToken) fetchSettings();
    }, [userToken]);

    const toggleSwitch = async (key) => {
        // Optimistic Update
        const newValue = !toggles[key];
        setToggles(prev => ({ ...prev, [key]: newValue }));

        try {
            await axios.patch(`${BASE_URL}/notification-settings`, { [key]: newValue }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            // Success (silent)
        } catch (error) {
            console.error("Error updating setting:", error);
            // Revert on failure
            setToggles(prev => ({ ...prev, [key]: !newValue }));
            Alert.alert("Error", "Failed to update setting. Please check your connection.");
        }
    };

    const renderToggleItem = (label, key) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Switch
                trackColor={{ false: "#e0e0e0", true: COLORS.primaryShadow }}
                thumbColor={toggles[key] ? COLORS.primary : "#f4f3f4"}
                ios_backgroundColor="#e0e0e0"
                onValueChange={() => toggleSwitch(key)}
                value={toggles[key]}
                disabled={isLoading}
            />
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Alerts</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Push Notifications Section */}
                <Text style={styles.sectionTitle}>Push Notifications</Text>

                {renderToggleItem('New Invitations', 'newInvitations')}
                {renderToggleItem('New Accepts', 'newAccepts')}
                {renderToggleItem('Recommendations', 'recommendations')}
                {renderToggleItem('New Matches', 'newMatches')}
                {renderToggleItem('Shortlisted', 'shortlisted')}
                {renderToggleItem('Recent Visitors', 'recentVisitors')}
                {renderToggleItem('Premium Matches', 'premiumMatches')}
                {renderToggleItem('Pending Invitations', 'pendingInvitations')}

                <View style={styles.divider} />

                {/* Sound Section */}
                <Text style={styles.sectionTitle}>Sound</Text>
                {renderToggleItem('In-app Sounds', 'inAppSounds')}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        paddingBottom: 15,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        elevation: 4,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '500', // Matches the "Push Notifications" weight in screenshot
        marginBottom: 15,
        marginTop: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25, // Spacing between items
    },
    itemLabel: {
        fontSize: 16,
        color: '#555', // Dark grey/black similar to screenshot
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 10,
    }
});
