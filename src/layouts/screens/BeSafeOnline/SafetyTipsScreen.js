import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function SafetyTipsScreen() {
    const navigation = useNavigation();

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderSection = (title, description) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionDescription}>{description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.pageTitle}>Safety Tips</Text>

                <Text style={styles.introText}>
                    Follow these practical guidelines to protect yourself while connecting with potential Matches.
                </Text>

                {/* First Image - On the Platform */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/safty one.png')} // Using the requested image path
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    {/* Optional: Add caption if needed, though screenshot doesn't show explicit caption for first image, mostly contextual */}
                </View>

                {renderSection(
                    "Verify Before You Trust",
                    "Engage in conversations, ask questions, and verify details before taking the next step. Move from chat to video calls to confirm their identity before agreeing to meet in person."
                )}

                {renderSection(
                    "Keep Conversations Within the LyvBond App",
                    "Start with our in-app chat, voice/video call features before sharing personal contact details or moving conversations offline."
                )}

                {renderSection(
                    "Be Cautious While Chatting",
                    "Never share financial details & avoid sharing personal details with matches you don't know well enough."
                )}

                {renderSection(
                    "Protect Your Privacy",
                    "Manage your privacy settings to control who can view your profile and contact you. Use these settings, to stay in control and ensure a safer experience."
                )}

                {/* Second Image - Offline Meetings */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/safty two.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    {/* <View style={styles.imageCaptionOverlay}>
                        <Text style={styles.imageCaptionText}>Meeting in-person (Offline)</Text>
                    </View> */}
                </View>

                {renderSection(
                    "Meet in Public",
                    "If you decide to take the conversation offline, choose a safe public space for your first meeting. Always inform a family member or a close friend about your plans and location."
                )}

                {renderSection(
                    "Move at your own pace",
                    "Take your time to truly know someone. Ask questions, stay alert, and trust your instincts to spot anything that doesn't feel right."
                )}

                {renderSection(
                    "Know When to Walk Away",
                    "Your safety and comfort come first. If you ever feel uneasy or simply don't want to continue the meeting, it's okay to politely walk away."
                )}

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
        height: 200,
        marginBottom: 30,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    imageCaptionOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 8,
        alignItems: 'center',
    },
    imageCaptionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        fontFamily: FONTS.RobotoMedium,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        fontFamily: FONTS.RobotoRegular,
    },
});
