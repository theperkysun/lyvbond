import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { COLORS } from '../../../utlis/comon';

const TermsConditionScreen = ({ navigation }) => {
    const [termsText, setTermsText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/settings`);
                if (response.data.success && response.data.settings) {
                    setTermsText(response.data.settings.termsAndConditions);
                }
            } catch (error) {
                console.log("Error fetching terms and conditions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={styles.backBtn} />{/* Spacer */}
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.paragraph}>
                        {termsText || "No terms available. Please check your internet connection."}
                    </Text>

                    <Text style={styles.footerText}>
                        Thank you for choosing LyvBond for your partner search journey.
                    </Text>
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 90,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        elevation: 4,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backBtn: {
        padding: 8,
        width: 40,
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    paragraph: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
        marginBottom: 10,
        textAlign: 'justify'
    },
    footerText: {
        fontSize: 16,
        color: COLORS.primary,
        marginTop: 30,
        textAlign: 'center',
        fontWeight: '600',
    }
});

export default TermsConditionScreen;
