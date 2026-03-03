import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Alert
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { userProfileData } from '../../components/CommonComponents/profileUserData';
import { COLORS, FONTS } from '../../../utlis/comon';
import { useAuth } from '../../../context/AuthContext';
import Header from '../../components/CommonComponents/Header';

export default function AccountSettingsScreen() {
    const navigation = useNavigation();
    const { logout, userToken } = useAuth(); // Destructure userToken

    // State for Email Edit
    const [currentEmail, setCurrentEmail] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

    // State for Phone
    const [currentPhone, setCurrentPhone] = useState('+91-XXXX-XXXX');
    const [phonePrivacy, setPhonePrivacy] = useState('Only Premium Members');
    const [currentDob, setCurrentDob] = useState('');

    // OTP State
    const [otp, setOtp] = useState('');
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial Data Fetch
    useFocusEffect(
        React.useCallback(() => {
            const fetchProfile = async () => {
                if (userToken) {
                    try {
                        const response = await axios.get(`${BASE_URL}/user/profile`, {
                            headers: { Authorization: `Bearer ${userToken}` }
                        });
                        if (response.data && response.data.user) {
                            setCurrentEmail(response.data.user.email);
                            if (response.data.user.phoneNumber) {
                                setCurrentPhone(response.data.user.phoneNumber);
                            }
                            if (response.data.user.privacy?.phonePrivacySetting) {
                                setPhonePrivacy(response.data.user.privacy.phonePrivacySetting);
                            }
                            if (response.data.user.privacy?.dobPrivacySetting) {
                                setDobDisplaySetting(response.data.user.privacy.dobPrivacySetting);
                            }
                            if (response.data.user.dob) {
                                const { day, month, year } = response.data.user.dob;
                                if (day && month && year) {
                                    setCurrentDob(`${day}/${month}/${year}`);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("Profile Fetch Error:", e);
                        // Fallback to static data if API fails
                        if (userProfileData.email) setCurrentEmail(userProfileData.email);
                    }
                } else if (userProfileData.email) {
                    setCurrentEmail(userProfileData.email);
                }
            };
            fetchProfile();
        }, [userToken])
    );


    // State for DOB Setting
    const [dobDisplaySetting, setDobDisplaySetting] = useState('Show my full Date of Birth');
    const [isDobModalVisible, setIsDobModalVisible] = useState(false);
    const [tempDobSetting, setTempDobSetting] = useState('');

    const dobOptions = [
        "Show my full Date of Birth (dd/mm/yyyy)",
        "Show only the Month & Year (mm/yyyy)"
    ];

    const handleEmailEdit = () => {
        setTempEmail(currentEmail);
        setIsEmailModalVisible(true);
    };

    const handleEmailUpdateInitiate = async () => {
        if (!tempEmail || !/\S+@\S+\.\S+/.test(tempEmail)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (tempEmail === currentEmail) {
            setIsEmailModalVisible(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/user/email/initiate`,
                { newEmail: tempEmail },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.data.success) {
                Alert.alert("OTP Sent", `A verification code has been sent to ${tempEmail}`);
                setIsEmailModalVisible(false);
                setOtp(''); // Reset OTP
                setIsOtpVisible(true); // Show OTP Modal
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to initiate email update";
            Alert.alert("Error", msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/user/email/verify`,
                { otp: otp },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.data.success) {
                Alert.alert("Success", "Email updated successfully!");
                setCurrentEmail(tempEmail); // Update UI
                setIsOtpVisible(false);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to verify OTP";
            Alert.alert("Error", msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailCancel = () => {
        setIsEmailModalVisible(false);
    };

    // DOB Handlers
    const handleDobEdit = () => {
        const currentOption = dobOptions.find(opt => opt.startsWith(dobDisplaySetting)) || dobOptions[0];
        setTempDobSetting(currentOption);
        setIsDobModalVisible(true);
    };

    const handleDobSave = async () => {
        const displayValue = tempDobSetting.split(' (')[0];
        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/user/dob-privacy/update`,
                { dobPrivacySetting: displayValue },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.data.success) {
                setDobDisplaySetting(displayValue);
                setIsDobModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Update Failed", error.response?.data?.message || "Could not update DOB privacy setting.");
        } finally {
            setIsLoading(false);
        }
    };


    const renderSectionHeader = (title, icon) => (
        <View style={styles.sectionHeaderContainer}>
            <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
            <Text style={styles.sectionHeader}>{title}</Text>
        </View>
    );

    const renderItem = (title, subtitle, onPress, iconName, showArrow = true, isLast = false) => (
        <TouchableOpacity
            style={[styles.itemContainer, isLast && styles.lastItemContainer]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconBox}>
                <MaterialCommunityIcons name={iconName} size={22} color={COLORS.primary} />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{title}</Text>
                {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
            </View>
            {showArrow && (
                <View style={styles.arrowBox}>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </View>
            )}
        </TouchableOpacity>
    );

    const renderRadioOption = (label, selectedValue, onSelect) => (
        <TouchableOpacity
            style={styles.radioOption}
            onPress={() => onSelect(label)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.radioCircleOuter,
                selectedValue === label && { borderColor: COLORS.primary }
            ]}>
                {selectedValue === label && <View style={[styles.radioCircleInner, { backgroundColor: COLORS.primary }]} />}
            </View>
            <Text style={styles.radioLabel}>{label.replace('(dd/mm/yyyy)', '\n(dd/mm/yyyy)').replace('(mm/yyyy)', '\n(mm/yyyy)')}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Account Settings"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ALERTS SECTION */}
                {renderSectionHeader('Alerts', 'bell-ring-outline')}
                <View style={styles.card}>
                    {renderItem('Push Notifications & Sounds', null, () => navigation.navigate('PushNotificationsSettings'), 'bell-outline', true, true)}
                </View>

                {/* PRIVACY SECTION */}
                {renderSectionHeader('Contact Privacy', 'shield-account-outline')}
                <View style={styles.card}>
                    {renderItem(currentPhone, phonePrivacy, () => navigation.navigate('VerifyContactDetails'), 'phone-outline')}
                    {renderItem(currentEmail, 'Edit your Email Id', handleEmailEdit, 'email-edit-outline')}
                    {renderItem('Voice and Video call', 'Edit your Call preferences', () => navigation.navigate('VoiceVideoCallSettings'), 'phone-settings-outline', true, true)}
                </View>

                {/* PREFERENCES SECTION */}
                {renderSectionHeader('User Preference Details', 'tune-vertical')}
                <View style={styles.card}>
                    {renderItem('Contact Filters', 'Filter Profiles who can contact you', () => navigation.navigate('ContactFilterScreen'), 'filter-variant')}
                    {renderItem('Astro Details', 'Visible to all Members', () => navigation.navigate('AstroDetailsSettings'), 'star-three-points-outline')}
                    {renderItem('Date of Birth', `${dobDisplaySetting} (${currentDob || 'dd/mm/yyyy'})`, handleDobEdit, 'calendar-account-outline')}
                    {renderItem('Messages', 'Edit Message Preferences', () => navigation.navigate('SettingsMessages'), 'message-cog-outline', true, true)}
                </View>

                {/* ACTIONS SECTION */}
                {renderSectionHeader('Actions', 'cogs')}
                <View style={styles.card}>
                    {renderItem('Hide / Delete Profile', 'Temperory hide or delete permanently', () => navigation.navigate('HideDeleteProfile'), 'eye-off-outline', true, true)}
                </View>

                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={async () => {
                            await logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'MainLoginScreen' }],
                            });
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                        <MaterialCommunityIcons name="logout" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <Text style={styles.versionText}>App Version 1.0.0</Text>
                </View>

                <View style={{ height: 40 }} />

            </ScrollView>

            {/* Email Edit Modal */}
            <Modal
                visible={isEmailModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleEmailCancel}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Email Id</Text>
                            </View>

                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Enter New Email Address</Text>
                                <TextInput
                                    style={styles.inputBox}
                                    value={tempEmail}
                                    onChangeText={setTempEmail}
                                    keyboardType="email-address"
                                    placeholder="e.g. name@example.com"
                                    placeholderTextColor="#ccc"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleEmailCancel}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
                                    onPress={handleEmailUpdateInitiate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Update</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* OTP Verification Modal */}
            <Modal
                visible={isOtpVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOtpVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Verify Email</Text>
                            </View>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 15 }}>
                                    Enter the 6-digit code sent to{'\n'}<Text style={{ fontWeight: 'bold' }}>{tempEmail}</Text>
                                </Text>
                                <TextInput
                                    style={[styles.inputBox, {
                                        textAlign: 'center',
                                        fontSize: 24,
                                        fontWeight: 'bold',
                                        letterSpacing: 5,
                                        color: COLORS.primary
                                    }]}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    placeholder="------"
                                    placeholderTextColor="#ccc"
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsOtpVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
                                    onPress={handleVerifyOtp}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Verify</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Date of Birth Edit Modal */}
            <Modal
                visible={isDobModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDobModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsDobModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.dobModalTitle}>Privacy Settings{'\n'}<Text style={{ fontSize: 14, color: '#888', fontWeight: '400' }}>Choose how people see your Date of Birth</Text></Text>

                                <View style={styles.radioGroup}>
                                    {dobOptions.map(option => renderRadioOption(option, tempDobSetting, setTempDobSetting))}
                                </View>

                                <View style={styles.dobModalButtons}>
                                    <TouchableOpacity style={[styles.fullWidthButton, isLoading && { opacity: 0.7 }]} onPress={handleDobSave} disabled={isLoading}>
                                        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.doneButtonText}>Save Preference</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: 4,
        marginTop: 10
    },
    sectionHeader: {
        fontSize: 14,
        color: '#888',
        fontFamily: FONTS.RobotoBold,
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    // CARD STYLE
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 5,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    lastItemContainer: {
        borderBottomWidth: 0,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10', // 10% opacity
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemContent: {
        flex: 1,
        marginRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#999',
        fontFamily: FONTS.RobotoRegular,
    },
    arrowBox: {
        backgroundColor: '#f9f9f9',
        padding: 5,
        borderRadius: 8
    },

    bottomActions: {
        marginTop: 10,
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: COLORS.primary,
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
    },
    versionText: {
        marginTop: 15,
        color: '#ccc',
        fontSize: 12,
        fontFamily: FONTS.RobotoRegular
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 10,
    },
    modalHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 15,
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        color: '#333',
        textAlign: 'center',
    },
    inputSection: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 13,
        color: '#888',
        fontFamily: FONTS.RobotoMedium,
        marginBottom: 8
    },
    inputBox: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoRegular
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontFamily: FONTS.RobotoMedium,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        marginLeft: 10
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: FONTS.RobotoBold,
    },

    // DOB Modal Specifics
    dobModalTitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        fontFamily: FONTS.RobotoBold,
        textAlign: 'center'
    },
    radioGroup: {
        marginBottom: 20,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 12
    },
    radioCircleOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    radioCircleInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    radioLabel: {
        fontSize: 15,
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
        flex: 1,
    },
    dobModalButtons: {
        width: '100%',
    },
    fullWidthButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center'
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
    },
});
