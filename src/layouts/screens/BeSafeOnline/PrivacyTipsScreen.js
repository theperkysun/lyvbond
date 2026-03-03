import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function PrivacyTipsScreen() {
    const navigation = useNavigation();

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderSection = (title, steps) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {steps.map((step, index) => (
                <Text key={index} style={styles.stepText}>{step}</Text>
            ))}
        </View>
    );

    const renderInfoBlock = (title, description) => (
        <View style={styles.section}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoDescription}>{description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.pageTitle}>Privacy Settings</Text>

                <Text style={styles.introText}>
                    Manage who sees your photos, contact info, & profile and always be in control.
                </Text>

                {/* First Image - Privacy Control */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/privacy 2.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Control Who Views Your Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Control Who Views Your Photos</Text>
                    <Text style={styles.sectionDescription}>
                        You can control who views your photos by showing them only to select members or even hide them completely.
                    </Text>
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepText}>1. Visit the <Text style={styles.boldText}>My Profile</Text> section of the profile</Text>
                        <Text style={styles.stepText}>2. Click on <Text style={styles.boldText}>My Photos</Text></Text>
                        <Text style={styles.stepText}>3. Click on <Text style={styles.linkText}>Adjust settings</Text>.</Text>
                    </View>
                </View>

                {/* Choose who sees your Phone Number */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Choose who sees your Phone Number</Text>
                    <Text style={styles.sectionDescription}>
                        Set your preferences to manage who can access your contact details.
                    </Text>
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepText}>1. Visit the <Text style={styles.boldText}>Account Settings</Text> section</Text>
                        <Text style={styles.stepText}>2. Scroll to <Text style={styles.boldText}>Contact Privacy</Text></Text>
                        <Text style={styles.stepText}>3. Adjust <Text style={styles.linkText}>phone privacy settings</Text></Text>
                    </View>
                </View>

                {/* Manage your Voice & Video call settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Manage your Voice & Video call settings</Text>
                    <Text style={styles.sectionDescription}>
                        Customize voice/video call settings, manage your availability, and decide who can contact you.
                    </Text>
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepText}>1. Visit the <Text style={styles.boldText}>Account Settings</Text> section</Text>
                        <Text style={styles.stepText}>2. Scroll to <Text style={styles.boldText}>Contact Privacy</Text></Text>
                        <Text style={styles.stepText}>3. Select Voice and Video call to <Text style={styles.linkText}>manage your call settings</Text>.</Text>
                    </View>
                </View>

                {/* Choose who sees your Horoscope details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Choose who sees your Horoscope details</Text>
                    <Text style={styles.sectionDescription}>
                        Control who can see your horoscope details—only members who have contacted you or responded to your interest, everyone, or no one at all.
                    </Text>
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepText}>1. Visit the <Text style={styles.boldText}>Account Settings</Text> section</Text>
                        <Text style={styles.stepText}>2. Scroll to <Text style={styles.boldText}>Astro Details</Text></Text>
                        <Text style={styles.stepText}>3. Select Select Astro Privacy Settings to <Text style={styles.linkText}>manage visibility</Text>.</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        fontFamily: FONTS.RobotoBold,
    },
    introText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
        fontFamily: FONTS.RobotoRegular,
    },
    imageContainer: {
        height: 180,
        marginBottom: 30,
        borderRadius: 10,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        fontFamily: FONTS.RobotoMedium,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
        fontFamily: FONTS.RobotoRegular,
    },
    stepsContainer: {
        marginLeft: 5,
    },
    stepText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 24,
        fontFamily: FONTS.RobotoRegular,
        marginBottom: 2,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
    },
    linkText: {
        color: COLORS.chatme, // Teal
        fontWeight: '500',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        fontFamily: FONTS.RobotoMedium,
    },
    infoDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: FONTS.RobotoRegular,
    },
});
