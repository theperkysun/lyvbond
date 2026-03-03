import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

const getPlans = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/plan`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Get Plans Error", error);
        return { success: false, error: error.message };
    }
};

const getMySubscription = async () => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(`${BASE_URL}/subscription/me`, headers);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Get My Sub Error", error);
        return { success: false, error: error.message };
    }
};

const unlockContact = async (targetUserId) => {
    try {
        const headers = await getHeaders();
        const response = await axios.post(`${BASE_URL}/subscription/unlock-contact`, { targetUserId }, headers);
        return { success: true, data: response.data };
    } catch (error) {
        // Return structured error for UI handling
        if (error.response) {
            return { success: false, error: error.response.data };
        }
        return { success: false, error: { message: "Network error" } };
    }
};

const buySubscription = async (planId) => {
    try {
        const headers = await getHeaders();
        // Payment processing would happen here or before this call
        const response = await axios.post(`${BASE_URL}/subscription/buy`, { planId }, headers);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response ? error.response.data : error.message };
    }
};

const calculatePaymentSummary = async (planId, addonIds) => {
    try {
        const headers = await getHeaders();
        const response = await axios.post(`${BASE_URL}/payment/calculate`, { planId, addonIds }, headers);
        return { success: true, data: response.data.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const getAddons = async () => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(`${BASE_URL}/payment/addons`, headers);
        return { success: true, data: response.data.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const processUPIPayment = async (planId, addonIds, upiId) => {
    try {
        const headers = await getHeaders();
        const response = await axios.post(`${BASE_URL}/payment/upi`, { planId, addonIds, upiId }, headers);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export default {
    getPlans,
    getMySubscription,
    unlockContact,
    buySubscription,
    calculatePaymentSummary,
    getAddons,
    processUPIPayment
};
