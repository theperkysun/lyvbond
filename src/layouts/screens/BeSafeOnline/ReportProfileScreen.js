import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../../utlis/comon';

export default function ReportProfileScreen() {
    const navigation = useNavigation();

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
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

                <Text style={styles.pageTitle}>Report a Profile</Text>

                <Text style={styles.introText}>
                    Report any suspicious or inappropriate behavior immediately—especially requests for money, unsolicited contact, or blackmail threats.
                </Text>
                <Text style={styles.introText}>
                    Reporting helps us investigate inappropriate behavior, while blocking prevents all future contact.
                </Text>

                <Text style={styles.subHeader}>Take Action When Needed</Text>

                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/privacy1.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Report a Profile */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>To Report a Profile</Text>
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepText}>1. Visit the <Text style={styles.boldText}>Profile</Text></Text>
                        <Text style={styles.stepText}>2. Click on the <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={16} color="#666" /> <Text style={styles.boldText}>menu</Text></Text>
                        <Text style={styles.stepText}>3. Select <Text style={styles.boldText}>Report this Profile</Text></Text>
                        <Text style={styles.stepText}>4. Choose the <Text style={styles.boldText}>reason</Text></Text>
                        <Text style={styles.stepText}>5. Submit</Text>
                    </View>
                </View>

                {/* Block a Profile */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>To Block a Profile</Text>
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepText}>1. Visit the <Text style={styles.boldText}>Profile</Text></Text>
                        <Text style={styles.stepText}>2. Click on the <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={16} color="#666" /> <Text style={styles.boldText}>menu</Text></Text>
                        <Text style={styles.stepText}>3. Select <Text style={styles.boldText}>Block this Profile</Text></Text>
                    </View>
                </View>

                {renderInfoBlock(
                    "After Reporting",
                    "Our team will review the report within 24 hours and take appropriate action"
                )}

                {renderInfoBlock(
                    "Your Privacy",
                    "All reports are confidential, and the reported person will not know who reported them"
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
        marginBottom: 10,
        fontFamily: FONTS.RobotoRegular,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
        fontFamily: FONTS.RobotoMedium,
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
