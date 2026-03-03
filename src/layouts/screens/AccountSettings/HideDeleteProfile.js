import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function HideDeleteProfile() {
    const navigation = useNavigation();
    const { userToken, logout } = useAuth();

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileHidden, setIsProfileHidden] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, [userToken]);

    const fetchUserProfile = async () => {
        if (!userToken) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data && response.data.user) {
                const currentStatus = response.data.user.privacy?.doNotShowProfile || false;
                setIsProfileHidden(currentStatus);
            }
        } catch (error) {
            console.error("Error fetching hidden status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleHideProfile = async () => {
        setIsPopupVisible(false);
        setIsLoading(true);
        const newStatus = !isProfileHidden;

        try {
            const payload = {
                privacy: {
                    doNotShowProfile: newStatus
                }
            };

            const response = await axios.patch(`${BASE_URL}/user/update`, payload, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                setIsProfileHidden(newStatus);
            }
        } catch (error) {
            console.error("Error updating hidden status:", error);
            Alert.alert("Error", "Failed to update profile visibility.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHideAction = () => {
        setIsPopupVisible(true);
    };

    const handleDeleteProfile = () => {
        setIsDeletePopupVisible(true);
    };

    const executeDeleteProfile = async () => {
        setIsDeletePopupVisible(false);
        setIsLoading(true);
        try {
            const response = await axios.delete(`${BASE_URL}/user/delete-profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                Alert.alert("Profile Deleted", "Your account has been permanently removed.");
                logout(); // Will clear token and redirect to login
            }
        } catch (error) {
            console.error("Delete Error:", error);
            Alert.alert("Error", "Could not delete profile. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hide / Delete Profile</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
            {renderHeader()}

            <View style={styles.content}>

                {/* Hide Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hide Profile</Text>

                    <View style={styles.actionRow}>
                        <Text style={styles.statusText}>
                            {isProfileHidden ? "Your Profile is currently hidden" : "Your Profile is currently visible"}
                        </Text>
                        <TouchableOpacity onPress={handleHideAction} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={COLORS.chatme} />
                            ) : (
                                <Text style={styles.actionLink}>{isProfileHidden ? "Unhide" : "Hide"}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle" size={16} color="#999" style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            When you hide your profile, you will not be visible on LyvBond. You will neither be able to send invitations or messages.
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Delete Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delete Profile</Text>

                    <View style={styles.actionRow}>
                        <Text style={styles.statusText}>Delete your Profile from LyvBond</Text>
                        <TouchableOpacity onPress={handleDeleteProfile}>
                            <Text style={styles.actionLink}>Delete</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle" size={16} color="#999" style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            You will permanently lose all profile information, Match interactions and paid memberships
                        </Text>
                    </View>
                </View>

            </View>

            {/* Confirmation Popup */}
            <Modal
                visible={isPopupVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsPopupVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {isProfileHidden ? "Unhide Profile?" : "Hide Profile?"}
                        </Text>
                        <Text style={styles.modalMessage}>
                            {isProfileHidden
                                ? "Your profile will become visible to other members. Do you want to proceed?"
                                : "Your profile will be hidden from all members. You won't be able to send requests. Do you want to proceed?"
                            }
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsPopupVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={toggleHideProfile}>
                                <Text style={styles.saveButtonText}>{isProfileHidden ? "Unhide" : "Hide"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Popup */}
            <Modal
                visible={isDeletePopupVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDeletePopupVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.warningIconContainer}>
                            <Ionicons name="trash-outline" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.modalTitle}>
                            Delete Profile?
                        </Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to permanently delete your profile? This action cannot be undone.
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsDeletePopupVisible(false)} disabled={isLoading}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={executeDeleteProfile} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
        fontFamily: FONTS.RobotoMedium,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: COLORS.primary, // Red section title
        fontWeight: '500',
        marginBottom: 15,
        fontFamily: FONTS.RobotoMedium,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusText: {
        fontSize: 15,
        color: '#444',
        fontFamily: FONTS.RobotoRegular,
        flex: 1,
        marginRight: 10,
    },
    actionLink: {
        color: COLORS.chatme, // Teal/Blue link color
        fontSize: 15,
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 5,
    },
    infoIcon: {
        marginTop: 2,
        marginRight: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
        flex: 1,
        fontFamily: FONTS.RobotoRegular,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        fontFamily: FONTS.RobotoMedium,
        textAlign: 'center'
    },
    modalMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        fontFamily: FONTS.RobotoRegular,
        lineHeight: 20
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.RobotoMedium,
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.chatme,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginLeft: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.RobotoMedium,
    },
    warningIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFE5E5',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignSelf: 'center',
        marginBottom: 15,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: COLORS.primary, // Red color
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginLeft: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.RobotoMedium,
    }
});
