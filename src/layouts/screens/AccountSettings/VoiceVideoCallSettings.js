import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform, Switch, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

export default function VoiceVideoCallSettings() {
    const navigation = useNavigation();
    const { userToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // Toggles
    const [videoCallEnabled, setVideoCallEnabled] = useState(true);
    const [voiceCallEnabled, setVoiceCallEnabled] = useState(true);

    // Settings State
    const [whoCanCall, setWhoCanCall] = useState('Only Premium Members');
    const [availabilityTime, setAvailabilityTime] = useState('10am to 10pm');
    const [availabilityDays, setAvailabilityDays] = useState('everyday'); // everyday, weekdays, weekends

    // Modals
    const [isWhoCanCallVisible, setIsWhoCanCallVisible] = useState(false);
    const [isAvailabilityVisible, setIsAvailabilityVisible] = useState(false);

    // Temp State for Modals
    const [tempWhoCanCall, setTempWhoCanCall] = useState(whoCanCall);
    const [tempAvailabilityTime, setTempAvailabilityTime] = useState(availabilityTime);
    const [tempAvailabilityDays, setTempAvailabilityDays] = useState(availabilityDays);


    // --- API & Handlers ---

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/call-settings`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                if (response.data && response.data.data) {
                    const data = response.data.data;
                    setVideoCallEnabled(data.videoCallEnabled ?? true);
                    setVoiceCallEnabled(data.voiceCallEnabled ?? true);
                    setWhoCanCall(data.whoCanCall || 'Only Premium Members');
                    setAvailabilityTime(data.availabilityTime || '10am to 10pm');
                    setAvailabilityDays(data.availabilityDays || 'everyday');
                }
            } catch (error) {
                console.error("Error fetching call settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userToken) fetchSettings();
    }, [userToken]);

    const updateSetting = async (payload) => {
        try {
            await axios.patch(`${BASE_URL}/call-settings`, payload, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error) {
            console.error("Error updating setting:", error);
            Alert.alert("Error", "Failed to update setting");
        }
    };

    const handleToggleVideo = (val) => {
        setVideoCallEnabled(val);
        updateSetting({ videoCallEnabled: val });
    };

    const handleToggleVoice = (val) => {
        setVoiceCallEnabled(val);
        updateSetting({ voiceCallEnabled: val });
    };

    const openWhoCanCall = () => {
        setTempWhoCanCall(whoCanCall);
        setIsWhoCanCallVisible(true);
    };

    const saveWhoCanCall = () => {
        setWhoCanCall(tempWhoCanCall);
        updateSetting({ whoCanCall: tempWhoCanCall });
        setIsWhoCanCallVisible(false);
    };

    const openAvailability = () => {
        setTempAvailabilityTime(availabilityTime);
        setTempAvailabilityDays(availabilityDays);
        setIsAvailabilityVisible(true);
    };

    const saveAvailability = () => {
        setAvailabilityTime(tempAvailabilityTime);
        setAvailabilityDays(tempAvailabilityDays);
        updateSetting({
            availabilityTime: tempAvailabilityTime,
            availabilityDays: tempAvailabilityDays
        });
        setIsAvailabilityVisible(false);
    };

    // --- Render Helpers ---

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Voice and Video call</Text>
        </View>
    );

    const renderRadioOption = (label, value, selectedValue, onSelect, recommended = false) => (
        <TouchableOpacity
            style={styles.radioOption}
            onPress={() => onSelect(value)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.radioCircleOuter,
                selectedValue === value && { borderColor: COLORS.primary }
            ]}>
                {selectedValue === value && <View style={[styles.radioCircleInner, { backgroundColor: COLORS.primary }]} />}
            </View>
            <Text style={styles.radioLabel}>{label}</Text>
            {recommended && (
                <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderDayButton = (label, value, selectedValue, onSelect) => {
        const isSelected = selectedValue === value;
        return (
            <TouchableOpacity
                style={[
                    styles.dayButton,
                    isSelected ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } : { borderColor: '#ccc' }
                ]}
                onPress={() => onSelect(value)}
            >
                <Text style={[
                    styles.dayButtonText,
                    isSelected ? { color: '#fff' } : { color: '#666' }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
            {renderHeader()}

            <View style={styles.content}>

                {/* Call Preferences */}
                <Text style={styles.sectionTitle}>Call Preferences</Text>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Video Call</Text>
                    <Switch
                        trackColor={{ false: "#e0e0e0", true: COLORS.primary + "80" }} // opacity for track
                        thumbColor={videoCallEnabled ? COLORS.primary : "#f4f3f4"}
                        onValueChange={handleToggleVideo}
                        value={videoCallEnabled}
                    />
                </View>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Voice Call</Text>
                    <Switch
                        trackColor={{ false: "#e0e0e0", true: COLORS.primary + "80" }}
                        thumbColor={voiceCallEnabled ? COLORS.primary : "#f4f3f4"}
                        onValueChange={handleToggleVoice}
                        value={voiceCallEnabled}
                    />
                </View>

                <View style={styles.divider} />

                {/* Who can call you */}
                <Text style={styles.sectionTitle}>Who can call you</Text>
                <View style={styles.settingRow}>
                    <Text style={styles.settingValue}>{whoCanCall}</Text>
                    <TouchableOpacity onPress={openWhoCanCall}>
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Your availability */}
                <Text style={styles.sectionTitle}>Your availability</Text>
                <View style={styles.settingRow}>
                    <Text style={styles.settingValue}>
                        {availabilityTime}, {availabilityDays === 'everyday' ? 'everyday' : (availabilityDays === 'weekdays' ? 'weekdays' : 'weekends')}
                    </Text>
                    <TouchableOpacity onPress={openAvailability}>
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />

            </View>


            {/* ------ POPUP 1: Who can call you ------ */}
            <Modal
                visible={isWhoCanCallVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsWhoCanCallVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Who can call you</Text>

                        <View style={styles.radioGroup}>
                            {renderRadioOption(
                                "Members you have interacted with",
                                "Members you have interacted with",
                                tempWhoCanCall,
                                setTempWhoCanCall
                            )}
                            {renderRadioOption(
                                "Only Premium Members",
                                "Only Premium Members",
                                tempWhoCanCall,
                                setTempWhoCanCall,
                                true // Recommended
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsWhoCanCallVisible(false)}>
                                <Text style={styles.cancelText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveWhoCanCall}>
                                <Text style={styles.saveText}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* ------ POPUP 2: Choose Availability ------ */}
            <Modal
                visible={isAvailabilityVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAvailabilityVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Availability</Text>

                        <View style={styles.radioGroup}>
                            {renderRadioOption("10am to 10pm", "10am to 10pm", tempAvailabilityTime, setTempAvailabilityTime, true)}
                            {renderRadioOption("9am to 4pm", "9am to 4pm", tempAvailabilityTime, setTempAvailabilityTime)}
                            {renderRadioOption("4pm to 10pm", "4pm to 10pm", tempAvailabilityTime, setTempAvailabilityTime)}
                        </View>

                        <TouchableOpacity style={{ marginBottom: 20, marginTop: -10, marginLeft: 35 }}>
                            <Text style={styles.editText}>Set your own time</Text>
                        </TouchableOpacity>

                        <Text style={styles.subLabel}>Choose days</Text>
                        <View style={styles.daysContainer}>
                            {renderDayButton('Everyday', 'everyday', tempAvailabilityDays, setTempAvailabilityDays)}
                            {renderDayButton('Weekdays', 'weekdays', tempAvailabilityDays, setTempAvailabilityDays)}
                            {renderDayButton('Weekends', 'weekends', tempAvailabilityDays, setTempAvailabilityDays)}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsAvailabilityVisible(false)}>
                                <Text style={styles.cancelText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveAvailability}>
                                <Text style={styles.saveText}>SAVE TIME</Text>
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
    sectionTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginBottom: 15,
        fontFamily: FONTS.RobotoMedium,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#666',
        fontFamily: FONTS.RobotoRegular,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
        marginTop: 5,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    settingValue: {
        fontSize: 15,
        color: '#666',
        fontFamily: FONTS.RobotoRegular,
    },
    editText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        marginBottom: 20,
        fontFamily: FONTS.RobotoMedium,
    },
    radioGroup: {
        marginBottom: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    radioCircleOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#757575',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    radioCircleInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    radioLabel: {
        fontSize: 15,
        color: '#444',
        fontFamily: FONTS.RobotoRegular,
    },
    recommendedBadge: {
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#FF9800', // Orange border
        backgroundColor: '#FFF3E0', // Light orange bg
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    recommendedText: {
        fontSize: 10,
        color: '#FF9800',
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 25,
        marginTop: 15,
    },
    cancelText: {
        color: '#999',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: FONTS.RobotoMedium,
    },
    saveText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: FONTS.RobotoMedium,
    },

    // Availability specific
    subLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        fontFamily: FONTS.RobotoMedium,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dayButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    dayButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
