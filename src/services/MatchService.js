import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

const MatchService = {
    getDailyMatches: async () => {
        try {
            const headers = await getHeaders();
            // Call the backend API at /api/matches/daily-gender
            const response = await axios.get(`${BASE_URL}/matches/daily-gender`, { headers });
            return response.data; // Expected { count: number, matches: [] }
        } catch (error) {
            console.error("MatchService.getDailyMatches Error:", error);
            throw error;
        }
    },

    getNearMeMatches: async (range = 5, lat, lon, includeGlobal = false) => {
        try {
            const headers = await getHeaders();
            const params = { range, includeGlobal };
            if (lat && lon) {
                params.lat = lat;
                params.lon = lon;
            }
            const response = await axios.get(`${BASE_URL}/user/matches/nearby`, { headers, params });
            return response.data;
        } catch (error) {
            console.error("MatchService.getNearMeMatches Error:", error);
            throw error;
        }
    },

    swipeUser: async (targetUserId, action) => {
        try {
            const headers = await getHeaders();
            const response = await axios.post(`${BASE_URL}/matches/swipe`, { targetUserId, action }, { headers });
            return response.data;
        } catch (error) {
            console.error("MatchService.swipeUser Error:", error);
            throw error;
        }
    },

    searchMatches: async (payload) => {
        try {
            const headers = await getHeaders();
            const response = await axios.post(`${BASE_URL}/matches/search`, payload, { headers });
            return response.data;
        } catch (error) {
            console.error("MatchService.searchMatches Error:", error);
            throw error;
        }
    }
};

export default MatchService;
