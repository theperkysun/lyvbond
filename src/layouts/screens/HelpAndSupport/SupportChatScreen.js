import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function SupportChatScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { ticketId, status, title } = route.params || {}; // Assuming passing these properties
    const { userToken } = useAuth();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const flatListRef = useRef(null);
    let pollingInterval = useRef(null);

    useFocusEffect(
        React.useCallback(() => {
            fetchChatHistory();

            // Basic polling for admin replies
            pollingInterval.current = setInterval(() => {
                fetchChatHistory();
            }, 5000);

            return () => clearInterval(pollingInterval.current);
        }, [])
    );

    const fetchChatHistory = async () => {
        if (!ticketId) return;
        try {
            const response = await axios.get(`${BASE_URL}/support-chat/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            if (response.data.success) {
                // Map API keys to component keys
                const formatted = response.data.messages.map(msg => ({
                    id: msg._id,
                    text: msg.message,
                    sender: msg.senderRole, // 'user' or 'admin' 
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setChatHistory(formatted);
            }
        } catch (error) {
            console.error("Error fetching support chat history:", error);
        }
    };

    const handleSend = async () => {
        if (message.trim().length === 0) return;

        // Optimistic UI update
        const msgText = message;
        setMessage('');
        const optimisticMsg = {
            id: Date.now().toString(),
            text: msgText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory(prev => [...prev, optimisticMsg]);

        try {
            await axios.post(`${BASE_URL}/support-chat/tickets/${ticketId}/send`,
                { message: msgText },
                { headers: { Authorization: `Bearer ${userToken}` } });
            // Let the polling catch the permanent message, or rely on the optimistic one for now
        } catch (error) {
            console.error("Error sending support message:", error);
            // Revert optimistic if needed
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.systemBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.systemText]}>{item.text}</Text>
                <Text style={[styles.timeText, isUser ? styles.userTime : styles.systemTime]}>{item.time}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HelpSupportScreen')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{title || "Support Chat"}</Text>
                    <Text style={styles.headerStatus}>{status === 'solved' ? "Ticket Closed" : "Typically replies in few minutes"}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"} // Changed to 'height' for Android to ensure it pushes up
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={chatHistory}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Input Area */}
                {status !== 'solved' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            placeholderTextColor="#999" // Added explicit placeholder color
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            editable={status !== 'solved'}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 15,
        backgroundColor: COLORS.primary, // Red header
        elevation: 4,
    },
    backButton: {
        marginRight: 15,
    },
    headerInfo: {
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: FONTS.RobotoMedium,
    },
    headerStatus: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: FONTS.RobotoRegular,
    },
    chatContent: {
        padding: 15,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    systemBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#eee',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        fontFamily: FONTS.RobotoRegular,
    },
    userText: {
        color: '#fff',
    },
    systemText: {
        color: '#333',
    },
    timeText: {
        fontSize: 10,
        marginTop: 5,
        alignSelf: 'flex-end',
        fontFamily: FONTS.RobotoRegular,
    },
    userTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    systemTime: {
        color: '#999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#ebebeb',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#bfbfbf',
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: '#333', // Explicit text color
        marginRight: 10,
        fontFamily: FONTS.RobotoRegular,
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: COLORS.chatme,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
