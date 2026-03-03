import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get headers
const getHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

const InboxService = {
    getReceived: async () => {
        try {
            const headers = await getHeaders();
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.INBOX_RECEIVED}`, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.getReceived Error:", error);
            throw error;
        }
    },

    getSent: async () => {
        try {
            const headers = await getHeaders();
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.INBOX_SENT}`, { headers });
            return response.data; // { success, data: [...] }
        } catch (error) {
            console.error("InboxService.getSent Error:", error);
            throw error;
        }
    },

    getAccepted: async (type = 'me') => {
        try {
            const headers = await getHeaders();
            // type = 'me' (Accepted by Me) or 'her' (Accepted by Her currently mapped to logic)
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.INBOX_ACCEPTED}?type=${type}`, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.getAccepted Error:", error);
            throw error;
        }
    },

    getContacts: async () => {
        try {
            const headers = await getHeaders();
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.INBOX_CONTACTS}`, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.getContacts Error:", error);
            throw error;
        }
    },

    acceptRequest: async (requestId) => {
        try {
            const headers = await getHeaders();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.INBOX_ACCEPT}`, { requestId }, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.acceptRequest Error:", error);
            throw error;
        }
    },

    rejectRequest: async (requestId) => {
        try {
            const headers = await getHeaders();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.INBOX_REJECT}`, { requestId }, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.rejectRequest Error:", error);
            throw error;
        }
    },

    remindRequest: async (requestId) => {
        try {
            const headers = await getHeaders();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.INBOX_REMIND}`, { requestId }, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.remindRequest Error:", error);
            throw error;
        }
    },

    cancelRequest: async (requestId) => {
        try {
            const headers = await getHeaders();
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.INBOX_CANCEL}`, { requestId }, { headers });
            return response.data;
        } catch (error) {
            console.error("InboxService.cancelRequest Error:", error);
            throw error;
        }
    }
};

export default InboxService;
