import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function MentalWellbeingScreen() {
    const navigation = useNavigation();

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderSectionTitle = (title) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    const renderDescription = (text) => (
        <Text style={styles.sectionDescription}>{text}</Text>
    );

    const renderBulletPoint = (text) => (
        <View style={styles.bulletContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.pageTitle}>Mental Wellbeing</Text>

                <Text style={styles.introText}>
                    Here's how you can prioritize your mental well-being while making this life-changing decision.
                </Text>

                {/* First Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/mentalwelbing1.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Finding "The One" Takes Time */}
                <View style={styles.section}>
                    {renderSectionTitle('Finding "The One" Takes Time')}
                    {renderDescription('Finding your Perfect Match on LyvBond takes effort, but here\'s how you can improve your chances:')}

                    {renderBulletPoint('Keep your Profile updated with the latest information')}
                    {renderBulletPoint('Get verified to show you are a genuine member.')}
                    {renderBulletPoint('Keep your preferences flexible to explore a wider range of profiles.')}
                </View>

                {/* Handle Rejections Positively */}
                <View style={styles.section}>
                    {renderSectionTitle('Handle Rejections Positively')}
                    {renderDescription('Rejections are a natural part of the journey where everyone has their own expectations and preferences.')}

                    {renderBulletPoint('Declined/Cancelled Interest: It\'s all part of the journey! Every cancelled interest brings you one step closer to finding the right Match.')}
                    {renderBulletPoint('No Response: If someone hasn\'t replied, send a polite follow-up asking them to accept or decline for better clarity.')}
                </View>

                {/* Second Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/mentalwelbing2.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Enjoy a Stress-Free Experience */}
                <View style={styles.section}>
                    {renderSectionTitle('Enjoy a Stress-Free Experience')}
                    {renderDescription('Finding the right partner should be an exciting journey, not a stressful one. Keep these things in mind:')}

                    {renderBulletPoint('Talk to family or friends as they can help with your decisions and doubts.')}
                    {renderBulletPoint('Stay positive and take breaks when needed.')}
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
        marginBottom: 25,
        borderRadius: 10,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    section: {
        marginBottom: 20,
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
        marginBottom: 10,
        fontFamily: FONTS.RobotoRegular,
    },
    bulletContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingRight: 10,
    },
    bullet: {
        fontSize: 18,
        lineHeight: 20,
        color: '#666',
        marginRight: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        fontFamily: FONTS.RobotoRegular,
    },
});
