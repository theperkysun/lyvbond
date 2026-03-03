import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Platform, Modal, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

const ForgotPassword = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSendOTP = () => {
        setModalVisible(true);
        setModalVisible(true);
        setTimeout(() => {
            setModalVisible(false);
            navigation.navigate('OTPScreen');
        }, 0);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forgot Password</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Enter Mobile No. or Email ID</Text>
                <Text style={styles.subtitle}>
                    We will send you an OTP to reset your{'\n'}password
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile No. / Email ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Mobile No. / Email ID"
                        placeholderTextColor="#C7C7CD"
                    />
                </View>

                <TouchableOpacity style={styles.sendButton} onPress={handleSendOTP}>
                    <Text style={styles.sendButtonText}>Send OTP</Text>
                </TouchableOpacity>
            </View>


            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Image
                            source={require('../../../assets/images/tickmark.png')}
                            style={styles.successImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.primary,
        height: 60 + (Platform.OS === 'android' ? (StatusBar.currentHeight || 35) : 0),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 35) : 0,
        elevation: 4,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontFamily: FONTS.RobotoMedium,
        fontSize: 18,
        color: COLORS.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 80,
        alignItems: 'center',
    },
    title: {
        fontFamily: FONTS.RobotoRegular, // Looks slightly regular/medium in image
        fontSize: 22,
        color: '#4A4A4A',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: FONTS.RobotoRegular,
        fontSize: 14,
        color: COLORS.grey,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 50,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 50,
    },
    label: {
        color: COLORS.primary,
        fontSize: 12,
        fontFamily: FONTS.RobotoRegular,
        marginBottom: 5,
    },
    input: {
        borderBottomWidth: 1.5,
        borderBottomColor: COLORS.primary,
        fontSize: 16,
        fontFamily: FONTS.RobotoRegular,
        color: COLORS.black,
        paddingVertical: 5,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 180, // Looks smaller than full width
        height: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    sendButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.RobotoBold,
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 150,
        height: 150,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
    },
    successImage: {
        width: 80,
        height: 80,
    },
});

export default ForgotPassword;
