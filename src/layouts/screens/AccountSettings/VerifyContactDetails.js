import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform, Modal, TextInput, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { COLORS, FONTS } from '../../../utlis/comon';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

export default function VerifyContactDetails() {
    const navigation = useNavigation();
    const { userToken } = useAuth();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('XXXXXXXXXX');
    const [tempPhoneNumber, setTempPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');

    // Privacy Logic
    const [privacySetting, setPrivacySetting] = useState('Only Premium Members');
    const [tempPrivacySetting, setTempPrivacySetting] = useState('Only Premium Members');

    const privacyOptions = [
        "Only Premium Members",
        "Only Premium Members you like",
        "No one (Matches won't be able to call you)",
        "Only visible to all your Matches (Expires with Membership) ?"
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userToken) return;
            try {
                const response = await axios.get(`${BASE_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                if (response.data && response.data.user) {
                    let num = response.data.user.phoneNumber || 'XXXXXXXXXX';
                    if (num.startsWith('+91')) {
                        setCountryCode('+91');
                        num = num.replace('+91', '').trim();
                    } else if (num.startsWith('+91-')) {
                        setCountryCode('+91');
                        num = num.replace('+91-', '').trim();
                    }
                    setPhoneNumber(num);
                    if (response.data.user.privacy?.phonePrivacySetting) {
                        setPrivacySetting(response.data.user.privacy.phonePrivacySetting);
                    }
                }
            } catch (e) {
                console.error("Profile Fetch Error:", e);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchUserData();
    }, [userToken]);

    // --- Phone Edit Handlers ---
    const handleEditPress = () => {
        setTempPhoneNumber(phoneNumber === 'XXXXXXXXXX' ? '' : phoneNumber);
        setIsEditModalVisible(true);
    };

    const handleSavePhone = async () => {
        // Simple check
        if (!tempPhoneNumber || tempPhoneNumber.length < 5) {
            Alert.alert("Invalid input", "Please provide a valid phone number.");
            return;
        }
        setIsSaving(true);
        try {
            const fullPhone = `${countryCode}-${tempPhoneNumber}`;
            const response = await axios.post(`${BASE_URL}/user/phone/update`,
                { phoneNumber: fullPhone },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            if (response.data.success) {
                setPhoneNumber(tempPhoneNumber);
                setIsEditModalVisible(false);
                Alert.alert("Success", "Phone number updated securely.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Update Failed", error.response?.data?.message || "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelPhone = () => {
        setIsEditModalVisible(false);
    };

    // --- Privacy Edit Handlers ---
    const handlePrivacyPress = () => {
        setTempPrivacySetting(privacySetting);
        setIsPrivacyModalVisible(true);
    };

    const handleSavePrivacy = async () => {
        setIsSaving(true);
        try {
            const response = await axios.post(`${BASE_URL}/user/privacy/update`,
                { phonePrivacySetting: tempPrivacySetting },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            if (response.data.success) {
                setPrivacySetting(tempPrivacySetting);
                setIsPrivacyModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Update Failed", error.response?.data?.message || "Something went wrong updating privacy rules.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelPrivacy = () => {
        setIsPrivacyModalVisible(false);
    };

    if (isLoadingData) {
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
                <Text style={styles.headerTitle}>Verify Contact Details</Text>
            </View>

            <View style={styles.content}>

                {/* Verified Section */}
                <View style={styles.verifiedContainer}>
                    <MaterialCommunityIcons name="cellphone-check" size={50} color={COLORS.chatme} style={styles.icon} />
                    <Text style={styles.verifiedText}>Phone No. is Verified.</Text>

                    <View style={styles.numberRow}>
                        <Text style={styles.phoneNumber}>{`${countryCode} ${phoneNumber}`}</Text>
                        <TouchableOpacity onPress={handleEditPress}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Privacy Settings Section */}
                <View style={styles.privacyContainer}>
                    <Text style={styles.privacyTitle}>Phone Privacy Settings</Text>

                    <TouchableOpacity style={styles.privacyRow} onPress={handlePrivacyPress}>
                        <Text style={styles.privacyValue}>{privacySetting}</Text>
                        <FontAwesome6 name="file-pen" size={20} color={COLORS.chatme} />
                    </TouchableOpacity>
                </View>

            </View>

            {/* Edit Phone Popup Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelPhone}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Phone No.</Text>

                            {/* Country and Number Section */}
                            <View style={styles.inputSection}>
                                <TouchableOpacity style={styles.countrySelector}>
                                    <Text style={styles.countryText}>(+91) India</Text>
                                    <Ionicons name="caret-down" size={16} color="#666" />
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.inputBox}
                                    value={tempPhoneNumber}
                                    onChangeText={setTempPhoneNumber}
                                    keyboardType="phone-pad"
                                    placeholder="Enter Phone Number"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPhone} disabled={isSaving}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSavePhone} disabled={isSaving}>
                                    {isSaving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Privacy Settings Popup Modal */}
            <Modal
                visible={isPrivacyModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelPrivacy}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitleLeft}>Phone Settings</Text>

                        <View style={styles.radioGroup}>
                            {privacyOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.radioOption}
                                    onPress={() => setTempPrivacySetting(option)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.radioCircleOuter}>
                                        {tempPrivacySetting === option && <View style={styles.radioCircleInner} />}
                                    </View>
                                    <Text style={styles.radioLabel}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Buttons (CANCEL / OK) */}
                        <View style={styles.privacyModalButtons}>
                            <TouchableOpacity style={styles.privacyButton} onPress={handleCancelPrivacy} disabled={isSaving}>
                                <Text style={styles.privacyButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.privacyButton} onPress={handleSavePrivacy} disabled={isSaving}>
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <Text style={styles.privacyButtonText}>OK</Text>
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
        backgroundColor: COLORS.white,
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
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    verifiedContainer: {
        alignItems: 'center',
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 20,
    },
    icon: {
        marginBottom: 10,
    },
    verifiedText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontFamily: FONTS.RobotoRegular,
    },
    numberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneNumber: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginRight: 10,
        fontFamily: FONTS.RobotoMedium,
    },
    editText: {
        fontSize: 16,
        color: COLORS.chatme,
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },
    privacyContainer: {
        marginTop: 10,
    },
    privacyTitle: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '500',
        marginBottom: 15,
        fontFamily: FONTS.RobotoMedium,
    },
    privacyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    privacyValue: {
        fontSize: 16,
        color: '#444',
        fontFamily: FONTS.RobotoRegular,
        flex: 1, // Allow text to take up space nicely
        marginRight: 10,
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
        borderRadius: 2, // Less rounded as per screenshot
        padding: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
        fontFamily: FONTS.RobotoBold,
        textAlign: 'center',
    },
    modalTitleLeft: {
        fontSize: 20,
        fontWeight: '500',
        color: '#333',
        marginBottom: 20,
        fontFamily: FONTS.RobotoMedium,
        textAlign: 'left', // Privacy popup title is left aligned
    },

    // Phone Edit Specific
    inputSection: {
        marginBottom: 25,
    },
    countrySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    countryText: {
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoRegular,
    },
    inputBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 10, // Adjust for specific design if needed
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoRegular,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
        fontFamily: FONTS.RobotoMedium,
    },
    saveButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 5,
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        fontFamily: FONTS.RobotoMedium,
    },

    // Privacy Popup Specific
    radioGroup: {
        marginTop: 5,
        marginBottom: 30,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center', // Align items to top to handle long text
        marginBottom: 22,
    },
    radioCircleOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary, // Use the blue/teal color from screenshot
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2, // Slight offset to align with first line of text
        marginRight: 15,
    },
    radioCircleInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    radioLabel: {
        fontSize: 16,
        color: '#666',
        fontFamily: FONTS.RobotoRegular,
        flex: 1, // Text wrap
        lineHeight: 22,
    },
    privacyModalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 25,
    },
    privacyButton: {
        padding: 5,
    },
    privacyButtonText: {
        color: COLORS.primary, // Blue/Teal text for buttons
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: FONTS.RobotoMedium,
    },

});
