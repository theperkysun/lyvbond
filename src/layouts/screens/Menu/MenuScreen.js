import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { userProfileData } from '../../components/CommonComponents/profileUserData';
import RateUsPopup from '../../components/Popups/RateUsPopup';
import DownloadProfilePopup from '../../components/Popups/DownloadProfilePopup';
import { useAuth } from '../../../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import UserService from '../../../services/UserService';
import { COLORS, FONTS } from '../../../utlis/comon';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';

export default function MenuScreen() {
    const navigation = useNavigation();
    const [showRatePopup, setShowRatePopup] = useState(false);
    const [showDownloadPopup, setShowDownloadPopup] = useState(false);

    const { userToken, userInfo, fetchCurrentUser, logout } = useAuth();
    const isInvited = userInfo?.isInvitedUser === true;

    useFocusEffect(
        useCallback(() => {
            if (fetchCurrentUser) {
                fetchCurrentUser();
            }
        }, [fetchCurrentUser])
    );

    // USER DATA FROM CONTEXT
    const user = {
        name: userInfo?.name || "User",
        id: userInfo?.userId || "ID-XXXXXX",
        isVerified: true,
        image: (userInfo?.profileImage && userInfo.profileImage.startsWith('http'))
            ? { uri: userInfo.profileImage }
            : require("../../../assets/images/profileimage.png"),
    };

    const handleCopyId = () => {
        Clipboard.setString(user.id);
        if (Platform.OS === 'android') {
            ToastAndroid.show('ID copied to clipboard', ToastAndroid.SHORT);
        }
    };

    const renderMenuItem = (icon, label, onPress, badge = null) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>{icon}</View>
                <Text style={styles.menuLabel}>{label}</Text>
                {badge && <View style={styles.badgeContainer}><Text style={styles.badgeText}>{badge}</Text></View>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* HEADER: Close Button & Profile */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Menu</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* PROFILE SECTION */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image source={user.image} style={styles.profileImage} />
                        {user.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={22} color={COLORS.primary} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.userName}>{user.name}</Text>

                    <TouchableOpacity style={styles.idContainer} onPress={handleCopyId}>
                        <Text style={styles.userId}>ID: {user.id}</Text>
                        <Ionicons name="copy-outline" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    {/* Membership Tag (Dynamic) */}
                    <View style={styles.membershipTag}>
                        <Text style={styles.membershipText}>
                            {(userInfo?.subscriptionType || "Free")} Member
                        </Text>
                    </View>
                </View>

                {/* ACTION ITEMS (Edit/Download) */}
                <View style={[styles.menuCard, { marginTop: 20 }]}>
                    {!isInvited && (
                        <>
                            {renderMenuItem(
                                <FontAwesome5 name="edit" size={18} color={COLORS.primary} />,
                                "View and Edit Profile",
                                () => navigation.navigate('UserProfileScreen')
                            )}
                            <View style={styles.separator} />
                        </>
                    )}
                    {renderMenuItem(
                        <FontAwesome5 name="download" size={18} color={COLORS.primary} />,
                        "Download Profile PDF",
                        () => setShowDownloadPopup(true)
                    )}
                </View>

                {/* DISCOVER MATCHES */}
                {!isInvited && (
                    <>
                        <Text style={styles.sectionTitle}>Discover</Text>
                        <View style={styles.menuCard}>
                            {renderMenuItem(
                                <FontAwesome5 name="user-friends" size={18} color="#4F8EF7" />,
                                "My Matches",
                                () => navigation.navigate('Home', {
                                    screen: 'HomeScreen',
                                    params: { tab: 'matches' }
                                })
                            )}
                            <View style={styles.separator} />
                            {renderMenuItem(
                                <MaterialIcons name="mail-outline" size={22} color="#F7B731" />,
                                "Inbox",
                                () => navigation.navigate('Home', { screen: 'inbox' })
                            )}
                            <View style={styles.separator} />
                            {renderMenuItem(
                                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#20BF6B" />,
                                "Chats",
                                () => navigation.navigate('Home', { screen: 'Message' })
                            )}
                        </View>

                        {/* SETTINGS */}
                        <Text style={styles.sectionTitle}>Settings & Support</Text>
                        <View style={styles.menuCard}>
                            {renderMenuItem(
                                <FontAwesome5 name="user-check" size={18} color="#8854d0" />,
                                "Partner Preferences",
                                () => navigation.navigate('PreferencesOverview', { fromMenu: true })
                            )}
                            <View style={styles.separator} />
                            {renderMenuItem(
                                <FontAwesome5 name="filter" size={18} color="#FA8231" />,
                                "Contact Filters",
                                () => navigation.navigate('ContactFilterScreen')
                            )}
                            <View style={styles.separator} />
                            {renderMenuItem(
                                <Ionicons name="settings-outline" size={22} color="#0FB9B1" />,
                                "Account Settings",
                                () => navigation.navigate('AccountSettingsScreen')
                            )}
                            <View style={styles.separator} />
                            {renderMenuItem(
                                <MaterialIcons name="security" size={22} color="#EB3B5A" />,
                                "Safety Centre",
                                () => navigation.navigate('SafetyCentreScreen')
                            )}
                        </View>
                    </>
                )}

                {/* APP INFO */}
                <Text style={styles.sectionTitle}>App Info</Text>
                <View style={styles.menuCard}>
                    {renderMenuItem(
                        <MaterialIcons name="help-outline" size={22} color="#333" />,
                        "Help & Support",
                        () => navigation.navigate('HelpSupportScreen')
                    )}
                    <View style={styles.separator} />
                    {renderMenuItem(
                        <FontAwesome5 name="thumbs-up" size={18} color="#333" />,
                        "Rate Us",
                        () => setShowRatePopup(true)
                    )}
                </View>

                {isInvited && (
                    <>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.menuCard}>
                            {renderMenuItem(
                                <MaterialIcons name="delete-outline" size={22} color="#EB3B5A" />,
                                "Delete Profile",
                                () => navigation.navigate('HideDeleteProfile')
                            )}
                            <View style={styles.separator} />
                            {renderMenuItem(
                                <MaterialCommunityIcons name="logout" size={22} color="#4F8EF7" />,
                                "Log Out",
                                async () => {
                                    await logout();
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'MainLoginScreen' }],
                                    });
                                }
                            )}
                        </View>
                    </>
                )}




                {/* FOOTER */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate("TermsConditionScreen")}>
                        <Text style={styles.footerLink}>Terms & Conditions</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerText}>Version 1.0.0 • LyvBond © {new Date().getFullYear()}</Text>
                </View>

            </ScrollView>

            <DownloadProfilePopup visible={showDownloadPopup} onClose={() => setShowDownloadPopup(false)} />
            <RateUsPopup visible={showRatePopup} onClose={() => setShowRatePopup(false)} />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA', // Light grey app background
    },
    // Removed topCurveBg style
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        marginBottom: 10,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        color: '#000',
    },

    // PROFILE
    profileSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    avatarContainer: {
        marginBottom: 12,
        position: 'relative',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: COLORS.primary, // Changed to primary for visibility on light bg
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 4,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },
    userName: {
        fontSize: 22,
        fontFamily: FONTS.RobotoBold,
        color: '#000', // On light background now (avatar visually overlaps, but text is below curve likely)
        // Wait, layout wise, image overlaps curve ending. Text should be dark.
        // Let's adjust marginTop of profileSection if needed. Active layout will handle.
        marginBottom: 4,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: 10,
    },
    userId: {
        fontSize: 13,
        color: '#555',
        fontFamily: FONTS.RobotoMedium,
    },
    membershipTag: {
        backgroundColor: COLORS.primaryShadow,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    membershipText: {
        fontSize: 11,
        color: COLORS.primary,
        fontFamily: FONTS.RobotoBold,
        textTransform: 'uppercase',
    },

    // MENU ITEM & CARDS
    sectionTitle: {
        fontSize: 14,
        fontFamily: FONTS.RobotoBold,
        color: '#888',
        marginLeft: 24,
        marginTop: 20,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    menuCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F5F6FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
    },
    badgeContainer: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#F5F6FA',
        marginLeft: 68, // Align with text start
        marginRight: 20
    },

    // Footer
    footer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    footerLink: {
        fontSize: 13,
        fontFamily: FONTS.RobotoMedium,
        color: COLORS.primary,
        marginBottom: 6,
    },
    footerText: {
        fontSize: 12,
        color: '#aaa',
        fontFamily: FONTS.RobotoRegular,
    }
});
