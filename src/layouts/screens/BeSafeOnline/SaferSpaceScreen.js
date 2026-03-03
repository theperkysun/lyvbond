import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function SaferSpaceScreen() {
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

                <Text style={styles.pageTitle}>Find out how LyvBond builds a safer space for love.</Text>

                <Text style={styles.introText}>
                    At LyvBond.com, your safety is never left to chance. Here's how
                </Text>

                {/* Main Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/safer space.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Content Sections */}
                {renderSection(
                    "Early Detection of Suspicious Profiles",
                    "Our AI powered safety algorithms work quietly in the background to support genuine connections while filtering out suspicious behavior."
                )}

                {renderSection(
                    "Secure ID and Mobile Number Checks",
                    "We offer a verification system where users can verify their information using Government-issued IDs and authenticate mobile numbers via OTP. Look for Profiles with the blue verification tick—these members have taken extra steps to build trust."
                )}

                {renderSection(
                    "Smart Profile and Photo Screening",
                    "We combine AI tools with decades of matchmaking experience to screen every profile and photo. Only verified users earn the Blue Tick, a mark of authenticity that helps keep our platform safe and trustworthy."
                )}

                {/* Second Image - Collaboration */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/colabsecurity.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {renderSection(
                    "Collaboration with Law Enforcement Agencies",
                    "We collaborate with law enforcement agencies to safeguard our users, promptly addressing any instances of misrepresentation, commercial misuse, or unauthorized marriage bureaus to ensure user safety."
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
        fontSize: 22, // Matches screenshot
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        fontFamily: FONTS.RobotoBold,
        lineHeight: 30,
    },
    introText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        fontFamily: FONTS.RobotoRegular,
    },
    imageContainer: {
        height: 200,
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
