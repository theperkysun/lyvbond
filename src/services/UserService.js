import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

const getMultiPartHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
    };
};

const UserService = {
    getProfile: async () => {
        try {
            const headers = await getHeaders();
            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.USER_PROFILE}`, { headers });
            return response.data;
        } catch (error) {
            console.error("UserService.getProfile Error:", error);
            throw error;
        }
    },

    updateProfile: async (data) => {
        try {
            const headers = await getHeaders();
            const response = await axios.patch(`${BASE_URL}${API_ENDPOINTS.USER_UPDATE}`, data, { headers });
            return response.data;
        } catch (error) {
            console.error("UserService.updateProfile Error:", error);
            throw error;
        }
    },

    async updateImage(formData) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.USER_IMAGE_UPLOAD}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Update Image Error:', error);
            return { success: false, message: error.message };
        }
    },

    async getUserDetails(userId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${BASE_URL}/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Get User Details Error:', error);
            return { success: false, message: error.message };
            return { success: false, message: error.message };
        }
    },

    async unlockContact(targetUserId, relationshipStatus = "none") {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${BASE_URL}/subscription/unlock-contact`,
                { targetUserId, relationshipStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Unlock Contact Error:', error);
            if (error.response) return error.response.data;
            return { success: false, message: error.message };
        }
    }
};

export default UserService;
