import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function SafetyCentreScreen() {
    const navigation = useNavigation();

    // --- Handlers ---
    const handleOpenLink = (url) => {
        // In a real app, this would open a browser or deep link
        console.log("Opening Link: ", url);
        // Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const handleCall = (number) => {
        // Linking.openURL(`tel:${number}`);
        console.log("Calling: ", number);
    };

    const handleEmail = (email) => {
        // Linking.openURL(`mailto:${email}`);
        console.log("Emailing: ", email);
    };


    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderListItem = (icon, title, description, onPress) => (
        <View style={styles.listItem}>
            <View style={styles.listItemIconContainer}>
                {icon}
            </View>
            <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{title}</Text>
                <Text style={styles.listItemDescription}>{description}</Text>
                <TouchableOpacity onPress={onPress}>
                    <Text style={styles.knowMoreText}>Know More</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSupportItem = (icon, label, value, onPress) => (
        <TouchableOpacity style={styles.supportItem} onPress={onPress}>
            <View style={styles.supportIcon}>{icon}</View>
            <Text style={styles.supportText}>
                {label}: <Text style={styles.supportValue}>{value}</Text>
            </Text>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.pageTitle}>Safety Centre</Text>

                <Text style={styles.introText}>
                    Your safety matters deeply at LyvBond.com. Our team works with advanced tools to ensure your matchmaking journey remains secure and safe.
                </Text>

                {/* Hero Card */}
                <TouchableOpacity style={styles.heroCard} activeOpacity={0.9} onPress={() => navigation.navigate('SaferSpaceScreen')}>
                    <View style={styles.heroImageContainer}>
                        <Image
                            source={require('../../../assets/images/safer space.png')}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.heroTextContainer}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.heroText}>Find out how LyvBond builds a safer space for love.</Text>
                        </View>
                        <View style={styles.heroArrowContainer}>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* List Items */}
                <View style={styles.listContainer}>
                    {renderListItem(
                        <MaterialCommunityIcons name="shield-check-outline" size={24} color="#333" />,
                        "Safety Tips",
                        "Follow these practical guidelines to protect yourself while connecting with potential Matches.",
                        () => navigation.navigate('SafetyTipsScreen')
                    )}

                    {renderListItem(
                        <MaterialIcons name="report-problem" size={24} color="#333" />,
                        "Report a Profile",
                        "Report any suspicious or inappropriate behavior immediately—especially requests for money, unsolicited contact, or blackmail threats.",
                        () => navigation.navigate('ReportProfileScreen')
                    )}

                    {renderListItem(
                        <Ionicons name="settings-outline" size={24} color="#333" />,
                        "Privacy Settings",
                        "Manage who sees your photos, contact info, & profile and always be in control.",
                        () => navigation.navigate('PrivacyTipsScreen') // Link to new Privacy Tips Screen
                    )}

                    {renderListItem(
                        <MaterialCommunityIcons name="head-heart-outline" size={24} color="#333" />,
                        "Mental Wellbeing",
                        "Here's how you can prioritize your mental well-being while making this life-changing decision.",
                        () => navigation.navigate('MentalWellbeingScreen')
                    )}
                </View>

                {/* Support Section */}
                <View style={styles.supportSection}>
                    <Text style={styles.supportTitle}>We're Here For You!</Text>

                    <Text style={styles.subHeader}>LyvBond Support</Text>
                    {renderSupportItem(<Ionicons name="call-outline" size={18} color="#666" />, "Helpline", "+91-XXXXXXXXXX", () => handleCall('+918095031111'))}
                    {renderSupportItem(<MaterialCommunityIcons name="email-outline" size={18} color="#666" />, "Email", "help@lyvbond.com", () => handleEmail('help@lyvbond.com'))}

                    <Text style={[styles.subHeader, { marginTop: 20 }]}>Cyber Crime Reporting</Text>
                    {renderSupportItem(<MaterialCommunityIcons name="web" size={18} color="#666" />, "Cyber Crime Portal", "cybercrime.gov.in", () => handleOpenLink('https://cybercrime.gov.in'))}
                    {renderSupportItem(<Ionicons name="call-outline" size={18} color="#666" />, "Helpline", "1930", () => handleCall('1930'))}
                    {renderSupportItem(<Ionicons name="call-outline" size={18} color="#666" />, "Women's Helpline", "181", () => handleCall('181'))}
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
        fontSize: 24,
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

    // Hero Card
    heroCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 2,
    },
    heroImageContainer: {
        height: 250,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
    },
    heroText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
    },
    heroArrowContainer: {
        marginLeft: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // List Items
    listContainer: {
        marginBottom: 30,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    listItemIconContainer: {
        marginTop: 2,
        marginRight: 15,
    },
    listItemContent: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        fontFamily: FONTS.RobotoBold,
    },
    listItemDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
        fontFamily: FONTS.RobotoRegular,
    },
    knowMoreText: {
        fontSize: 14,
        color: COLORS.chatme, // Teal
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },

    // Support Section
    supportSection: {
        marginTop: 10,
    },
    supportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        fontFamily: FONTS.RobotoBold,
    },
    subHeader: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
        fontWeight: '500',
        fontFamily: FONTS.RobotoMedium,
    },
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    supportIcon: {
        width: 24,
        alignItems: 'center',
        marginRight: 10,
    },
    supportText: {
        fontSize: 14,
        color: '#666',
        fontFamily: FONTS.RobotoRegular,
    },
    supportValue: {
        color: COLORS.chatme,
        fontWeight: '500',
    },
});
