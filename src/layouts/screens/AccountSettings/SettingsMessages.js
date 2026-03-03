import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, TextInput, Modal, FlatList, ActivityIndicator, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, FONTS } from '../../../utlis/comon';

const MESSAGE_OPTIONS = {
    connect: [
        { id: 'c1', text: "Hi, I liked your profile and it seems to be a good match. Please accept my request to take this forward :)", type: 'default' },
        { id: 'c2', text: "Hello! I came across your profile and found it very interesting. Would love to connect and know more.", type: 'default' },
        { id: 'c3', text: "Namaste! Your profile details match what I am looking for. Let's connect if you are interested.", type: 'default' },
        { id: 'c4', text: "Hi, I'm interested in your profile. Please accept my invite to chat further.", type: 'custom' },
    ],
    accept: [
        { id: 'a1', text: "Hi, I like your profile too. Would like to get in touch to take this forward. You can contact me on +91-XXXXXXXXXX. I'll be waiting :)", type: 'default' },
        { id: 'a2', text: "Thank you for the interest! I'm happy to connect. Let's chat and see where this goes.", type: 'default' },
        { id: 'a3', text: "Hi! Glad we matched. Feel free to call/text me at +91-XXXXXXXXXX so we can talk.", type: 'default' },
        { id: 'a4', text: "Thanks for connecting! I'm looking forward to getting to know you better. Adding my contact no +91-XXXXXXXXXX.", type: 'custom' },
    ],
    remind: [
        { id: 'r1', text: "Hi there! Just wanted to remind you that I eagerly awaiting your response. Please accept if you like my profile. Thanks!", type: 'default' },
        { id: 'r2', text: "Hello! I sent a request a while ago. If you're still interested, please do accept. Have a great day!", type: 'default' },
        { id: 'r3', text: "Just a gentle reminder regarding my connection request. Hope to hear from you soon.", type: 'default' },
        { id: 'r4', text: "Hi, just checking in on my previous request. Would love to connect if you're interested.", type: 'custom' },
    ]
};

export default function SettingsMessages() {
    const navigation = useNavigation();
    const { userToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State for Selected Messages and Options (so custom messages can be updated)
    const [messageOptions, setMessageOptions] = useState(MESSAGE_OPTIONS);
    const [connectMsg, setConnectMsg] = useState(MESSAGE_OPTIONS.connect[0].text);
    const [acceptMsg, setAcceptMsg] = useState(MESSAGE_OPTIONS.accept[0].text);
    const [remindMsg, setRemindMsg] = useState(MESSAGE_OPTIONS.remind[0].text);
    const [autoSendConnect, setAutoSendConnect] = useState(true);
    const [autoSendAccept, setAutoSendAccept] = useState(true);

    // Edit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentEditType, setCurrentEditType] = useState(null); // 'connect', 'accept', 'remind'
    const [modalMode, setModalMode] = useState('select'); // 'select' or 'edit'
    const [tempSelectedText, setTempSelectedText] = useState("");
    const [tempCustomText, setTempCustomText] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            if (!userToken) return;
            try {
                const response = await axios.get(`${BASE_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });

                if (response.data?.user?.messagePreferences) {
                    const prefs = response.data.user.messagePreferences;

                    const setAndSyncCustom = (typeKey, fetchedText, setStateFunc) => {
                        if (!fetchedText) return;
                        setStateFunc(fetchedText);

                        // Sync with option list to flag custom messages if they aren't default ones
                        const isDefault = MESSAGE_OPTIONS[typeKey].some(opt => opt.type === 'default' && opt.text === fetchedText);
                        if (!isDefault) {
                            setMessageOptions(prev => {
                                const newOpts = { ...prev };
                                const customIndex = newOpts[typeKey].findIndex(opt => opt.type === 'custom');
                                if (customIndex !== -1) {
                                    newOpts[typeKey][customIndex].text = fetchedText;
                                }
                                return newOpts;
                            });
                        }
                    };

                    setAndSyncCustom('connect', prefs.connectMsg, setConnectMsg);
                    setAndSyncCustom('accept', prefs.acceptMsg, setAcceptMsg);
                    setAndSyncCustom('remind', prefs.remindMsg, setRemindMsg);

                    if (prefs.autoSendConnect !== undefined) setAutoSendConnect(prefs.autoSendConnect);
                    if (prefs.autoSendAccept !== undefined) setAutoSendAccept(prefs.autoSendAccept);
                }
            } catch (error) {
                console.error("Fetch Messages Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, [userToken]);

    // Open Modal for Selection (Change Button)
    const openSelectionModal = (type, currentText) => {
        setCurrentEditType(type);
        setModalMode('select');
        setTempSelectedText(currentText);
        setModalVisible(true);
    };

    // Open Modal for Editing Custom Message (Edit Now Button)
    const openTextEditModal = (type) => {
        setCurrentEditType(type);
        setModalMode('edit');

        // Find existing custom message to prefill
        const customOption = messageOptions[type].find(opt => opt.type === 'custom');
        setTempCustomText(customOption ? customOption.text : "");

        setModalVisible(true);
    };

    const saveMessage = async () => {
        let finalValue = "";
        let updatedOptions = { ...messageOptions };

        if (modalMode === 'select') {
            finalValue = tempSelectedText;
            if (currentEditType === 'connect') setConnectMsg(finalValue);
            if (currentEditType === 'accept') setAcceptMsg(finalValue);
            if (currentEditType === 'remind') setRemindMsg(finalValue);
        } else {
            finalValue = tempCustomText;
            const typeOptions = [...updatedOptions[currentEditType]];
            const customIndex = typeOptions.findIndex(opt => opt.type === 'custom');

            if (customIndex !== -1) {
                typeOptions[customIndex] = { ...typeOptions[customIndex], text: finalValue };
                updatedOptions[currentEditType] = typeOptions;
                setMessageOptions(updatedOptions);
            }

            if (currentEditType === 'connect') setConnectMsg(finalValue);
            if (currentEditType === 'accept') setAcceptMsg(finalValue);
            if (currentEditType === 'remind') setRemindMsg(finalValue);
        }

        // Push to server
        setIsSaving(true);
        try {
            const payloadKeyMap = {
                connect: 'connectMsg',
                accept: 'acceptMsg',
                remind: 'remindMsg'
            };

            await axios.post(`${BASE_URL}/user/message-preferences/update`,
                { [payloadKeyMap[currentEditType]]: finalValue },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

        } catch (error) {
            console.error("Message Save Error:", error);
            Alert.alert("Error", "Failed to sync message preference to server.");
        } finally {
            setIsSaving(false);
            setModalVisible(false);
        }
    };

    const toggleAutoSend = async (type) => {
        const newValue = type === 'connect' ? !autoSendConnect : !autoSendAccept;
        if (type === 'connect') setAutoSendConnect(newValue);
        else setAutoSendAccept(newValue);

        try {
            const payloadKey = type === 'connect' ? 'autoSendConnect' : 'autoSendAccept';
            await axios.post(`${BASE_URL}/user/message-preferences/update`,
                { [payloadKey]: newValue },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
        } catch (error) {
            console.error("Toggle Auto Send Error:", error);
            Alert.alert("Error", "Failed to update preference.");
            // Revert on error
            if (type === 'connect') setAutoSendConnect(!newValue);
            else setAutoSendAccept(!newValue);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Messages</Text>
        </View>
    );





    const renderSection = (title, subTitle, message, type, isPremiumLabel = false) => {
        const isAutoOn = type === 'connect' ? autoSendConnect : type === 'accept' ? autoSendAccept : false;
        const showToggle = type === 'connect' || type === 'accept';

        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {isPremiumLabel && (
                        <View style={styles.premiumBadge}>
                            <MaterialCommunityIcons name="crown" size={12} color="#D2374B" />
                            <Text style={styles.premiumText}>PREMIUM ONLY</Text>
                        </View>
                    )}
                    {showToggle && (
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#666', marginRight: 5 }}>Auto-send</Text>
                            <Switch
                                value={isAutoOn}
                                onValueChange={() => toggleAutoSend(type)}
                                trackColor={{ false: "#767577", true: COLORS.primary + '80' }}
                                thumbColor={isAutoOn ? COLORS.primary : "#f4f3f4"}
                            />
                        </View>
                    )}
                </View>

                {/* Content Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        {subTitle ? <Text style={styles.cardSubTitle}>{subTitle}</Text> : <View />}
                        <TouchableOpacity onPress={() => openSelectionModal(type, message)}>
                            <Text style={styles.changeAction}>Change</Text>
                        </TouchableOpacity>
                    </View>

                    {title === "Message on Connect" && (
                        <Text style={styles.descriptionText}>This Message is sent to Members that you send Connect Requests to</Text>
                    )}

                    <Text style={styles.messageText}>{message}</Text>

                    <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>To write your own Message, </Text>
                        <TouchableOpacity onPress={() => openTextEditModal(type)}>
                            <Text style={styles.footerAction}>Edit Now {'>'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderMessageOption = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.optionCard,
                tempSelectedText === item.text && styles.selectedOptionCard
            ]}
            onPress={() => setTempSelectedText(item.text)}
            activeOpacity={0.8}
        >
            <View style={styles.optionHeader}>
                <View style={[
                    styles.radioCircle,
                    tempSelectedText === item.text && styles.radioCircleSelected
                ]} />
                {item.type === 'custom' && (
                    <View style={styles.customBadge}>
                        <MaterialCommunityIcons name="crown" size={12} color={COLORS.primary} />
                        <Text style={styles.customBadgeText}>Custom Message</Text>
                    </View>
                )}
            </View>
            <Text style={styles.optionText}>{item.text}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>
                {renderSection("Message on Connect", "Connect Message", connectMsg, 'connect')}
                {renderSection("Message on Accept", null, acceptMsg, 'accept', true)}
                {renderSection("Message on Remind", null, remindMsg, 'remind', true)}
            </ScrollView>

            {/* Modal - Dynamic Content based on Mode */}
            <Modal
                animationType={modalMode === 'select' ? "slide" : "fade"}
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#555" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>
                            {modalMode === 'select' ? 'Select Message' : 'Edit Custom Message'}
                        </Text>

                        {modalMode === 'select' ? (
                            <View style={{ maxHeight: 400, width: '100%' }}>
                                <FlatList
                                    data={currentEditType ? messageOptions[currentEditType] : []}
                                    renderItem={renderMessageOption}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        ) : (
                            <TextInput
                                style={styles.input}
                                multiline
                                numberOfLines={4}
                                onChangeText={setTempCustomText}
                                value={tempCustomText}
                                placeholder="Type your custom message here..."
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)} disabled={isSaving}>
                                <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={saveMessage} disabled={isSaving}>
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.textStyle}>
                                        {modalMode === 'select' ? 'Select' : 'Save'}
                                    </Text>
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
        backgroundColor: '#f5f5f5'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 15,
        paddingBottom: 15,
        backgroundColor: COLORS.primary
    },
    backButton: {
        paddingRight: 10
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: FONTS.RobotoMedium
    },
    content: {
        paddingBottom: 30
    },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 15
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 16,
        color: '#555',
        fontFamily: FONTS.RobotoRegular
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D2374B',
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 10
    },
    premiumText: {
        color: '#D2374B',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        elevation: 1
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    cardSubTitle: {
        fontSize: 14,
        color: '#555',
        fontFamily: FONTS.RobotoMedium
    },
    changeAction: {
        color: COLORS.chatme,
        fontSize: 14,
        fontWeight: '500'
    },
    descriptionText: {
        fontSize: 12,
        color: '#777',
        marginBottom: 10
    },
    messageText: {
        fontSize: 14,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 15,
        lineHeight: 20
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    footerText: {
        fontSize: 12,
        color: '#555'
    },
    footerAction: {
        fontSize: 12,
        color: COLORS.chatme,
        fontWeight: 'bold'
    },

    // Modal
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        width: '90%',
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: '#333',
        alignSelf: 'center'
    },
    optionCard: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    selectedOptionCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#fdf2f4' // light red tint
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        justifyContent: 'space-between'
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#bbb',
        marginRight: 10
    },
    radioCircleSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary
    },
    customBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    customBadgeText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginLeft: 4
    },
    optionText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20
    },
    input: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
        height: 100,
        marginBottom: 20,
        color: '#333',
        fontSize: 14
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        marginTop: 15
    },
    button: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 2,
        alignItems: 'center',
        marginLeft: 10
    },
    buttonClose: {
        backgroundColor: "#ccc"
    },
    buttonSave: {
        backgroundColor: COLORS.primary
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    closeModalButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10
    }
});
