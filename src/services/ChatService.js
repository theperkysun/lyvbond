import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const ChatService = {
    // Get all conversations list
    getConversations: async () => {
        try {
            const config = await getAuthHeader();
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CHAT_LIST}`, config);
            return response.data;
        } catch (error) {
            console.error("fetchConversations error:", error);
            throw error;
        }
    },

    // Get messages for a specific conversation
    getMessages: async (conversationId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CHAT_MESSAGES}/${conversationId}/messages`, config);
            return response.data;
        } catch (error) {
            console.error("fetchMessages error:", error);
            throw error;
        }
    },

    // Get online/connected friends
    getOnlineUsers: async () => {
        try {
            const config = await getAuthHeader();
            // We reuse the matches connections endpoint as these are the "online" candidates
            const response = await axios.get(`${BASE_URL}/matches/connections`, config);
            return response.data;
        } catch (error) {
            console.error("fetchOnlineUsers error:", error);
            throw error;
        }
    },

    // Start or get existing conversation ID
    startConversation: async (receiverId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.CHAT_START}`, { receiverId }, config);
            return response.data; // { conversationId: ... }
        } catch (error) {
            console.error("startConversation error:", error);
            throw error;
        }
    },

    // Block User
    blockUser: async (targetUserId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.USER_BLOCK}`, { targetUserId }, config);
            return response.data;
        } catch (error) {
            console.error("blockUser error:", error);
            throw error;
        }
    },

    // Unblock User
    unblockUser: async (targetUserId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.USER_UNBLOCK}`, { targetUserId }, config);
            return response.data;
        } catch (error) {
            console.error("unblockUser error:", error);
            throw error;
        }
    },

    // Get connection progress index (Shortlist & Two Calls logic)
    getConnectionProgress: async (otherUserId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.get(`${BASE_URL}/connection-progress/${otherUserId}`, config);
            return response.data;
        } catch (error) {
            console.error("getConnectionProgress error:", error);
            throw error;
        }
    },

    getNearbyMeetLocations: async (otherUserId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.get(`${BASE_URL}/connection-progress/nearby-cafes/${otherUserId}`, config);
            return response.data;
        } catch (error) {
            console.error("getNearbyMeetLocations error:", error);
            throw error;
        }
    },

    getMeetRequestState: async (otherUserId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.get(`${BASE_URL}/connection-progress/meet-request/${otherUserId}`, config);
            return response.data;
        } catch (error) {
            console.error("getMeetRequestState error:", error);
            throw error;
        }
    },

    sendMeetRequest: async (receiverId, location) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.post(`${BASE_URL}/connection-progress/meet-request`, { receiverId, location }, config);
            return response.data;
        } catch (error) {
            console.error("sendMeetRequest error:", error);
            throw error;
        }
    },

    respondToMeetRequest: async (meetId, status) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.patch(`${BASE_URL}/connection-progress/meet-request/${meetId}`, { status }, config);
            return response.data;
        } catch (error) {
            console.error("respondToMeetRequest error:", error);
            throw error;
        }
    },

    unmatchUser: async (targetUserId) => {
        try {
            const config = await getAuthHeader();
            const response = await axios.post(`${BASE_URL}/matches/unmatch`, { targetUserId }, config);
            return response.data;
        } catch (error) {
            console.error("unmatchUser error:", error);
            throw error;
        }
    },

    // Upload Image
    uploadChatImage: async (formData) => {
        try {
            const config = await getAuthHeader();
            config.headers['Content-Type'] = 'multipart/form-data';
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.CHAT_IMAGE_UPLOAD}`, formData, config);
            return response.data; // { url: ... }
        } catch (error) {
            console.error("uploadChatImage error:", error);
            throw error;
        }
    }
};

export default ChatService;
