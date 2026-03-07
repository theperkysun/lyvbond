import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../utlis/comon';

export default function FamilyInviteIntermediate() {
    const route = useRoute();
    const navigation = useNavigation();
    const { userToken } = useAuth();

    // The deep link is /family-chat/:chatId/:isInvite
    const { chatId, isInvite } = route.params || {};

    useEffect(() => {
        if (!chatId) {
            navigation.goBack();
            return;
        }

        if (userToken) {
            // Logged in user: Redirect to ChatView
            // For now, replacing to prevent back loops
            navigation.replace('ChatView', {
                chatId: chatId,
                isFamilyGroup: true,
                isInvite: isInvite
            });
        } else {
            // Not logged in: Redirect to Sign Up Flow
            navigation.replace('YouAreInvitedScreen', {
                chatId: chatId,
                isInvite: isInvite
            });
        }
    }, [userToken, chatId, isInvite, navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgcolor }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );
}
