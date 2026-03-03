import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform, Modal, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { COLORS, FONTS } from '../../../utlis/comon';
import AstroEditPopup from '../Astro Pop up/AstroEditPopup';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';

export default function AstroDetailsSettings() {
    const navigation = useNavigation();
    const { userToken } = useAuth();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [privacySetting, setPrivacySetting] = useState('Visible to all Members');
    const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
    const [tempPrivacySetting, setTempPrivacySetting] = useState(privacySetting);

    // State to control the large edit popup
    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);

    // Data State
    const [astroData, setAstroData] = useState({
        timeOfBirth: '',
        placeOfBirth: '',
        manglik: '',
        nakshatra: '',
        raashi: '',
    });

    // Privacy Options
    const privacyOptions = [
        "Visible to all members",
        "Visible to Contacted and Accepted Members",
        "Hide from all"
    ];

    // --- API Calls ---
    useEffect(() => {
        fetchUserProfile();
    }, [userToken]);

    const fetchUserProfile = async () => {
        if (!userToken) return;
        try {
            const response = await axios.get(`${BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data && response.data.user) {
                const user = response.data.user;
                const astro = user.astro || {};

                setAstroData({
                    timeOfBirth: astro.timeOfBirth || '',
                    placeOfBirth: astro.cityOfBirth || '', // Map cityOfBirth to placeOfBirth
                    manglik: astro.manglik || "Don't Know",
                    nakshatra: astro.nakshatra || '',
                    raashi: astro.raashi || '',
                });

                if (astro.privacy) {
                    // Handle object or string legacy
                    const priv = typeof astro.privacy === 'string' ? astro.privacy : "Visible to all members";
                    setPrivacySetting(priv);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Alert.alert("Error", "Failed to load astro details.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateAstroDetails = async (newData) => {
        try {
            setIsLoading(true);
            const payload = {
                astro: {
                    timeOfBirth: newData.timeOfBirth,
                    cityOfBirth: newData.placeOfBirth, // Map back
                    manglik: newData.manglik,
                    nakshatra: newData.nakshatra,
                    raashi: newData.raashi,
                    // Preserve existing privacy if not updating it here, 
                    // BUT since we are merging via service, it's safer to include it or ensure service merges deep.
                    // Our service merges keys of objects. `astro` will be merged.
                    // So we must include current privacy to avoid overwriting it if service does shallow generic replace 
                    // (Actually service does user[key] = { ...user[key], ...updateData[key] } so it is SAFE).
                }
            };

            const response = await axios.patch(`${BASE_URL}/user/update`, payload, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                // Update local state
                setAstroData(newData);
                Alert.alert("Success", "Astro details updated successfully.");
            }
        } catch (error) {
            console.error("Error updating astro details:", error);
            Alert.alert("Error", "Failed to update astro details.");
        } finally {
            setIsLoading(false);
        }
    };

    const updatePrivacy = async () => {
        try {
            setIsLoading(true);
            const payload = {
                astro: {
                    privacy: tempPrivacySetting
                }
            };
            const response = await axios.patch(`${BASE_URL}/user/update`, payload, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                setPrivacySetting(tempPrivacySetting);
                setIsPrivacyModalVisible(false);
                // Alert.alert("Success", "Privacy settings updated.");
            }
        } catch (error) {
            console.error("Error updating privacy:", error);
            Alert.alert("Error", "Failed to update privacy.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Handlers ---

    const handlePrivacyEdit = () => {
        setTempPrivacySetting(privacySetting);
        setIsPrivacyModalVisible(true);
    };

    const savePrivacy = () => {
        updatePrivacy();
    };

    const handleAstroEditSave = (newData) => {
        updateAstroDetails(newData);
    };

    // --- Render Helpers ---

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Astro Details</Text>
        </View>
    );

    const renderSectionHeader = (title, onEdit) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                <Text style={styles.editButtonText}>EDIT</Text>
                <MaterialCommunityIcons name="pencil" size={14} color={COLORS.chatme} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        </View>
    );

    const renderDetailItem = (iconName, label, value, iconType = 'MaterialCommunityIcons') => (
        <View style={styles.detailItem}>
            <View style={styles.iconCircle}>
                {iconType === 'Ionicons' ? (
                    <Ionicons name={iconName} size={20} color="#fff" />
                ) : (
                    <MaterialCommunityIcons name={iconName} size={20} color="#fff" />
                )}
            </View>
            <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value || "Not Set"}</Text>
            </View>
        </View>
    );

    const renderPrivacyOption = (label, value) => (
        <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setTempPrivacySetting(label)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.radioCircleOuter,
                tempPrivacySetting === label && { borderColor: COLORS.chatme }
            ]}>
                {tempPrivacySetting === label && <View style={[styles.radioCircleInner, { backgroundColor: COLORS.chatme }]} />}
            </View>
            <Text style={styles.privacyLabel}>{label}</Text>
        </TouchableOpacity>
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

            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>

                {/* Astro Privacy Settings */}
                {renderSectionHeader('Astro Privacy Settings', handlePrivacyEdit)}
                <Text style={styles.privacyValue}>{privacySetting}</Text>

                <View style={styles.divider} />

                {/* Astro Details */}
                {renderSectionHeader('Astro Details', () => setIsEditPopupVisible(true))}

                <View style={styles.detailsList}>
                    {renderDetailItem('clock-time-four-outline', 'Time of Birth', astroData.timeOfBirth)}
                    {renderDetailItem('map-marker-outline', 'Place of Birth', astroData.placeOfBirth)}
                    {renderDetailItem('orbit', 'Manglik?', astroData.manglik)}
                    {renderDetailItem('star-four-points-outline', 'Nakshatra', astroData.nakshatra)}
                    {renderDetailItem('grid', 'Raashi', astroData.raashi)}
                </View>

            </ScrollView>

            {/* Privacy Popup */}
            <Modal
                visible={isPrivacyModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsPrivacyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Who can see your Astro Details</Text>

                        <View style={styles.radioGroup}>
                            {privacyOptions.map((option, index) => (
                                <React.Fragment key={index}>
                                    {renderPrivacyOption(option, option)}
                                </React.Fragment>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsPrivacyModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={savePrivacy}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Astro Edit Popup (The large multi-step one) */}
            <AstroEditPopup
                visible={isEditPopupVisible}
                onClose={() => setIsEditPopupVisible(false)}
                initialData={astroData}
                onSave={handleAstroEditSave}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 15,
        backgroundColor: COLORS.primary,
        elevation: 4, // Adding shadow for consistency
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#333', // Slightly darker header
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '50', // Light border
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    editButtonText: {
        color: COLORS.chatme, // Using the teal color for Edit button text
        fontSize: 12,
        fontWeight: '600',
        fontFamily: FONTS.RobotoMedium,
    },
    privacyValue: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        fontFamily: FONTS.RobotoRegular,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 25,
    },
    detailsList: {
        marginTop: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#9E86B6', // Muted purple like in screenshot
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 2,
        fontFamily: FONTS.RobotoRegular,
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // Bottom sheet style for visual variety or center? Screenshot shows center/bottom. Center looks like second image.
        justifyContent: 'center', // Changed to center as per second screenshot reference (standard alert dialog) but wait, second screenshot is bottom aligned? No, it looks like a bottom sheet popup. Wait, the second screenshot "Who can see your Astro Details" is a bottom sheet? No, it looks like a center popup or bottom. Let's stick to Bottom for modern feel or Center if it's an alert. The 2nd screenshot looks like a bottom sheet with rounded corners at top. Actually let's look closely. It has "Cancel" and "Save" buttons at the bottom. It looks like a bottom sheet. BUT the user said "popup will arrive". Let's do a bottom sheet style for the privacy one as it looks cleaner, or Center. The screenshot 2 "Who can see..." is a bottom sheet. 
        // actually looking at screenshot 2 (uploaded_image_1...) it is a bottom anchored sheet with rounded top corners.
        justifyContent: 'flex-end',
        marginBottom: 0,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        elevation: 10,
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 25,
        fontFamily: FONTS.RobotoMedium,
    },
    radioGroup: {
        marginBottom: 30,
    },
    privacyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    radioCircleOuter: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    radioCircleInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: COLORS.chatme,
    },
    privacyLabel: {
        fontSize: 16,
        color: '#444',
        fontFamily: FONTS.RobotoRegular,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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
        backgroundColor: COLORS.chatme, // Teal button
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
});
