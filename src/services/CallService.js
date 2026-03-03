import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const CallService = {
    getCallHistory: async () => {
        try {
            const config = await getAuthHeader();
            // Reuse GET /calls/history endpoint from API if already defined or define in apiConfig
            // Assuming endpoint is /calls/history based on code. 
            // Need to add this to apiConfig if not present.
            // Or if it's strictly for chat module, maybe it belongs in ChatService? 
            // But separate CallService is cleaner.

            const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CALL_HISTORY}`, config);
            return response.data;
        } catch (error) {
            console.error("CallService.getCallHistory error:", error);
            throw error;
        }
    }
};

export default CallService;
