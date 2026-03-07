import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS, COLORS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import { BASE_URL } from '../../../config/apiConfig';

const YouAreInvitedScreen = ({ navigation, route }) => {
    const { chatId, isInvite } = route.params || {}; // isInvite is now the inviterId
    const [inviterId, setInviterId] = useState(isInvite || '');
    const [localChatId, setLocalChatId] = useState(chatId || '');
    const [inviterName, setInviterName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInviterInfo = async () => {
            if (!inviterId || inviterId === 'true') {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${BASE_URL}/signup/inviter/${inviterId}`);
                const data = await response.json();
                if (data.success && data.inviter) {
                    const name = data.inviter.firstName || data.inviter.name || 'someone';
                    setInviterName(name);
                }
            } catch (error) {
                console.error('Error fetching inviter info:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInviterInfo();
    }, [inviterId]);

    const handleNext = () => {
        if (!localChatId) {
            Alert.alert('Error', 'Please provide an Invitation ID.');
            return;
        }
        navigation.navigate('InviteProfileForScreen', {
            chatId: localChatId,
            inviterId: inviterId,
            inviterName: inviterName
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Family Group Invitation" onBackPress={() => navigation.goBack()} />
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <Text style={styles.titleText}>Welcome to LyvBond</Text>

                        <View style={styles.inviteBox}>
                            <Text style={styles.inviteText}>
                                {inviterName
                                    ? `You are invited by ${inviterName} as a family member.`
                                    : 'You are invited as a family member.'}
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Invitation ID</Text>
                            <TextInput
                                style={[styles.input, chatId ? styles.inputDisabled : null]}
                                value={localChatId}
                                onChangeText={setLocalChatId}
                                editable={!chatId}
                                placeholder="Enter Invitation ID"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <CustomButton
                            title="Next"
                            paddingVertical={15}
                            borderRadius={25}
                            marginTop={40}
                            onPress={handleNext}
                        />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgcolor },
    content: { padding: 20 },
    titleText: {
        fontSize: 28,
        color: COLORS.black,
        fontFamily: FONTS.RobotoBold,
        marginBottom: 20,
        textAlign: 'center',
    },
    inviteBox: {
        backgroundColor: '#fff3e0',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffb74d'
    },
    inviteText: {
        fontSize: 18,
        color: '#e65100',
        fontFamily: FONTS.RobotoMedium,
        textAlign: 'center',
        lineHeight: 26,
    },
    inputContainer: { marginTop: 10 },
    label: {
        fontSize: 16,
        color: COLORS.black,
        fontFamily: FONTS.RobotoMedium,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.white,
        fontFamily: FONTS.RobotoRegular,
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    }
});

export default YouAreInvitedScreen;
