import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get("window");

export default function ProfileTopSection() {

    const navigation = useNavigation();
    const { userInfo, fetchCurrentUser } = useAuth();

    useFocusEffect(
        useCallback(() => {
            if (fetchCurrentUser) {
                fetchCurrentUser();
            }
        }, [fetchCurrentUser])
    );

    const userData = userInfo; // Use context data

    // Calculate Completion based on ACTUAL SCHEMA STRUCTURE (Nested)
    const calculateCompletion = () => {
        if (!userData) return 0;

        let filledCount = 0;

        // Define paths based on signup.model.js Schema
        const pathsToCheck = [
            // Top Level
            'name', 'email', 'phoneNumber', 'gender', 'profileFor', 'about', 'profileImage',

            // DOB
            'dob.year', 'dob.month', 'dob.day',

            // Location
            'location.state', 'location.city', 'location.subcommunity', 'location.country', 'location.pinCode', 'location.grewUpIn', 'location.residencyStatus',

            // Preferences
            'preferences.maritalStatus', 'preferences.height', 'preferences.diet', 'preferences.hobbies', 'preferences.noCasteBar',

            // Education & Profession
            'education.qualification', 'education.college', 'education.income', 'education.workType', 'education.profession', 'education.organization',

            // Family
            'family.motherDetails', 'family.fatherDetails', 'family.sistersCount', 'family.brothersCount', 'family.financialStatus',

            // Basic & Religious & Astro
            'basicInfo.anyDisability', 'basicInfo.healthInfo',
            'religiousInfo.subCommunity', 'religiousInfo.gothra',
            'astro.manglik', 'astro.timeOfBirth', 'astro.cityOfBirth',

            // Partner Preferences
            'partnerPreferences.ageRange', 'partnerPreferences.heightRange', 'partnerPreferences.maritalStatus',
            'partnerPreferences.religion', 'partnerPreferences.community', 'partnerPreferences.motherTongue',
            'partnerPreferences.country', 'partnerPreferences.state', 'partnerPreferences.city',
            'partnerPreferences.qualification', 'partnerPreferences.workingWith', 'partnerPreferences.profession',
            'partnerPreferences.workingAs', 'partnerPreferences.income', 'partnerPreferences.profileManagedBy',
            'partnerPreferences.children', 'partnerPreferences.diet'
        ];

        // Helper to resolve "location.city" from object
        const getValue = (obj, path) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        pathsToCheck.forEach(path => {
            const value = getValue(userData, path);

            // Check for valid values (including boolean false)
            if (value !== undefined && value !== null) {
                if (typeof value === 'boolean') {
                    filledCount++;
                } else if (Array.isArray(value)) {
                    if (value.length > 0) filledCount++;
                } else if (typeof value === 'object') {
                    if (Object.keys(value).length > 0) filledCount++;
                } else if (value.toString().trim() !== '') {
                    filledCount++;
                }
            }
        });

        const totalFields = pathsToCheck.length;
        const percentage = Math.round((filledCount / totalFields) * 100);
        return Math.min(percentage, 100);
    };

    const completion = calculateCompletion();

    return (
        <View style={styles.container}>
            {/* Top Curved Background Decoration */}
            <View style={styles.bgDecorationCircle} />

            {/* MAIN CARD CONTAINER */}
            <View style={styles.glassCard}>

                {/* 1. TOP ROW: Image + Info */}
                <View style={styles.profileRow}>

                    {/* LEFT: IMAGE + STATUS */}
                    <View style={styles.imageWrapper}>
                        <View style={[styles.borderRing, { borderColor: COLORS.primary }]}>
                            <Image
                                source={userData?.profileImage ? { uri: userData.profileImage } : require('../../../assets/images/profileimage.png')}
                                style={styles.profileImg}
                            />
                        </View>
                        {/* Online/Verified Badge */}
                        <View style={styles.verifiedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={22} color={COLORS.primary} />
                        </View>
                    </View>

                    {/* RIGHT: INFO TEXT */}
                    <View style={styles.infoContainer}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name} numberOfLines={1}>
                                {userData?.name || "Welcome User"}
                            </Text>

                            {/* Membership Tag */}
                            <View style={styles.planTag}>
                                <Text style={styles.planText}>{userData?.subscriptionType || "Free"}</Text>
                            </View>
                        </View>

                        <Text style={styles.userId}>ID: {userData?.userId || "Unknown"}</Text>

                        {/* Progress Bar (Profile Completion) - Hide if 100% */}
                        {completion < 100 && (
                            <View style={styles.progressSection}>
                                <Text style={styles.progressLabel}>Profile Completed: {completion}%</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${completion}%` }]} />
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* 2. DIVIDER LINE */}
                <View style={styles.divider} />

                {/* 3. ACTION BUTTONS ROW */}
                <View style={styles.actionsRow}>

                    {/* EDIT BUTTON */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.editBtnStyle]}
                        onPress={() => navigation.navigate("UserProfileScreen")}
                    >
                        <View style={styles.iconCircleEdit}>
                            <MaterialCommunityIcons name="account-edit" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.btnTextDark}>
                            {completion < 100 ? "Complete Now" : "Edit Profile"}
                        </Text>
                    </TouchableOpacity>

                    {/* UPGRADE BUTTON (Pulsing Effect UI) */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.upgradeBtnStyle]}
                        onPress={() => navigation.navigate("SubscriptionScreen")}
                    >
                        <View style={styles.iconCircleUpgrade}>
                            <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                        </View>
                        <Text style={styles.btnTextLight}>Upgrade Premium</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        paddingTop: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    // Background Decoration
    bgDecorationCircle: {
        position: 'absolute',
        top: -100,
        right: -80,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: COLORS.primaryShadow,
        opacity: 0.2, // Subtle blob
    },

    // GLASS CARD LOOK
    glassCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        // Shadow for depth
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10, // Android shadow
        borderWidth: 1,
        borderColor: COLORS.primaryShadow,
    },

    // 1. Profile Row
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
    },
    borderRing: {
        borderWidth: 2,
        borderRadius: 50,
        padding: 3, // Space between ring and image
        borderColor: COLORS.primary,
    },
    profileImg: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: -4,
        backgroundColor: '#fff',
        borderRadius: 12,
    },

    // Info
    infoContainer: {
        flex: 1,
        marginLeft: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontFamily: FONTS.RobotoBold,
        fontSize: 20,
        color: COLORS.black,
        flexShrink: 1,
    },
    planTag: {
        backgroundColor: COLORS.primaryShadow, // Light red
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 8,
    },
    planText: {
        fontFamily: FONTS.RobotoBold,
        fontSize: 10,
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    userId: {
        fontFamily: FONTS.RobotoRegular,
        fontSize: 13,
        color: COLORS.grey,
        marginTop: 2,
    },

    // Progress
    progressSection: {
        marginTop: 10,
    },
    progressLabel: {
        fontSize: 11,
        color: COLORS.grey,
        marginBottom: 4,
        fontFamily: FONTS.RobotoMedium,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },

    // 2. Divider
    divider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginVertical: 18,
    },

    // 3. Actions Row
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 14,
    },
    // Edit Button Style
    editBtnStyle: {
        backgroundColor: '#F7F8FA', // Very light grey
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    iconCircleEdit: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    btnTextDark: {
        fontSize: 14,
        color: COLORS.black,
        fontFamily: FONTS.RobotoMedium,
    },

    // Upgrade Button Style
    upgradeBtnStyle: {
        backgroundColor: COLORS.primary, // Brand Color
        marginLeft: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircleUpgrade: {
        marginRight: 8,
    },
    btnTextLight: {
        fontSize: 14,
        color: COLORS.white,
        fontFamily: FONTS.RobotoBold,
    },
});
