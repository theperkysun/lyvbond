import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Share,
    Animated,
    Modal,
    Pressable,
    Vibration
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { COLORS, FONTS } from '../../../utlis/comon';
import ChatService from '../../../services/ChatService';
import { useAuth } from '../../../context/AuthContext';
import Header from '../../components/Header';

export default function FamilyGroupDetailsScreen({ route, navigation }) {

    const { chatId, groupName } = route.params || {};
    const { userInfo } = useAuth();

    const [loading, setLoading] = useState(true);
    const [groupInfo, setGroupInfo] = useState(null);
    const [isMyStatusMember, setIsMyStatusMember] = useState(false);

    const [removeModal, setRemoveModal] = useState(false);
    const [targetUser, setTargetUser] = useState(null);

    const screenFade = useRef(new Animated.Value(0)).current;
    const screenTranslate = useRef(new Animated.Value(40)).current;

    const inviteScale = useRef(new Animated.Value(1)).current;

    const modalScale = useRef(new Animated.Value(0.6)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchGroupInfo();

        Animated.parallel([
            Animated.timing(screenFade, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true
            }),
            Animated.timing(screenTranslate, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true
            })
        ]).start();

    }, [chatId]);

    const fetchGroupInfo = async () => {

        try {

            setLoading(true);

            const res = await ChatService.getFamilyGroupInfo(chatId);

            if (res.success && res.conversation) {

                setGroupInfo(res.conversation);

                const meId = userInfo?._id || userInfo?.id;

                const me = res.conversation.participants.find(
                    p => p.userId && (p.userId._id === meId || p.userId.id === meId)
                );

                if (me && !me.userId?.familyRelation) {
                    setIsMyStatusMember(true);
                }

            }

        }
        finally {
            setLoading(false);
        }
 
    };

    const handleShareLink = async () => {

        try {

            const link = `https://lyvbond.com/family-chat/${chatId}/${userInfo?._id}`;

            await Share.share({
                message:
                    `👨‍👩‍👧‍👦 Join our Family Group on LyvBond!\n\n` +
                    `Stay connected with your family members, chat together, and share moments privately.\n\n` +
                    `Tap here to join:\n${link}`
            });

        } catch { }

    };

    const openRemoveModal = (user) => {

        Vibration.vibrate(40);

        setTargetUser(user);
        setRemoveModal(true);

        Animated.parallel([
            Animated.spring(modalScale, {
                toValue: 1,
                useNativeDriver: true
            }),
            Animated.timing(modalOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            })
        ]).start();

    };

    const closeRemoveModal = () => {

        Animated.parallel([
            Animated.timing(modalScale, {
                toValue: 0.6,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(modalOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            })
        ]).start(() => setRemoveModal(false));

    };

    const confirmRemove = async () => {

        if (!targetUser) return;

        try {

            const res = await ChatService.removeUserFromGroup(chatId, targetUser._id);

            if (res.success) {

                setGroupInfo(prev => ({
                    ...prev,
                    participants: prev.participants.filter(
                        p => p.userId && p.userId._id !== targetUser._id
                    )
                }));

            }

        } catch { }

        closeRemoveModal();

    };

    const renderParticipant = ({ item, index }) => {

        if (!item.userId) return null;

        const meId = userInfo?._id || userInfo?.id;

        const isMe = item.userId._id === meId || item.userId.id === meId;

        const relationText = !item.userId.familyRelation
            ? "Group Member"
            : item.userId.familyRelation;

        const userName = isMe
            ? "You"
            : (item.userId.name ||
                `${item.userId.firstName || ''} ${item.userId.lastName || ''}`);

        const canRemove = isMyStatusMember && !isMe && item.userId.familyRelation;

        const itemAnim = new Animated.Value(40);

        Animated.timing(itemAnim, {
            toValue: 0,
            duration: 400,
            delay: index * 70,
            useNativeDriver: true
        }).start();

        return (

            <Animated.View
                style={[
                    styles.participantCard,
                    { transform: [{ translateY: itemAnim }] }
                ]}
            >

                <View style={styles.participantRow}>

                    <Image
                        source={{
                            uri:
                                item.userId.profileImage ||
                                `https://ui-avatars.com/api/?name=${userName}`
                        }}
                        style={styles.avatar}
                    />

                    <View style={styles.participantInfo}>

                        <Text style={styles.participantName}>{userName}</Text>

                        <Text style={styles.relationText}>{relationText}</Text>

                    </View>

                    {canRemove && (

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => openRemoveModal(item.userId)}
                        >

                            <Ionicons name="trash-outline" size={20} color={COLORS.white} />

                        </TouchableOpacity>

                    )}

                </View>

            </Animated.View>

        );

    };

    const participants =
        groupInfo?.participants?.filter(p => p && p.userId) || [];

    return (

        <SafeAreaView style={styles.container}>

            <StatusBar barStyle="dark-content" />

            <Header title="Group Details" onBack={() => navigation.goBack()} />

            {loading ? (
                <View style={styles.centerLoad}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (

                <Animated.View
                    style={{
                        flex: 1,
                        opacity: screenFade,
                        transform: [{ translateY: screenTranslate }]
                    }}
                >

                    <FlatList
                        data={participants}
                        keyExtractor={item => item.userId._id}
                        renderItem={renderParticipant}
                        showsVerticalScrollIndicator={false}

                        ListHeaderComponent={

                            <View style={styles.headerSection}>

                                <Image
                                    source={{
                                        uri: "https://ui-avatars.com/api/?name=Family+Group&size=256"
                                    }}
                                    style={styles.groupAvatar}
                                />

                                <Text style={styles.groupNameText}>
                                    {groupName}
                                </Text>

                                <Text style={styles.participantsCount}>
                                    {participants.length} Members
                                </Text>

                                {isMyStatusMember && (

                                    <Animated.View
                                        style={{ transform: [{ scale: inviteScale }] }}
                                    >

                                        <TouchableOpacity
                                            style={styles.inviteCard}
                                            activeOpacity={0.9}
                                            onPress={handleShareLink}

                                            onPressIn={() => Animated.spring(inviteScale, {
                                                toValue: 0.95,
                                                useNativeDriver: true
                                            }).start()}

                                            onPressOut={() => Animated.spring(inviteScale, {
                                                toValue: 1,
                                                useNativeDriver: true
                                            }).start()}

                                        >

                                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 50 }}>
                                                <Ionicons name="share-social" size={24} color={COLORS.white} />
                                            </View>

                                            <View style={{ flex: 1, marginLeft: 12 }}>

                                                <Text style={styles.inviteTitle}>
                                                    Share Invite Link
                                                </Text>

                                                <Text style={styles.inviteDesc}>
                                                    Tap here to share the link & invite family members to this group.
                                                </Text>

                                            </View>

                                        </TouchableOpacity>

                                    </Animated.View>

                                )}

                                <Text style={styles.sectionTitle}>
                                    Members
                                </Text>

                            </View>

                        }

                    />

                </Animated.View>

            )}

            {/* REMOVE MODAL */}

            <Modal visible={removeModal} transparent animationType="none">

                <Pressable style={styles.modalOverlay} onPress={closeRemoveModal}>

                    <Animated.View
                        style={[
                            styles.modalBox,
                            {
                                opacity: modalOpacity,
                                transform: [{ scale: modalScale }]
                            }
                        ]}
                    >

                        <Ionicons name="person-remove" size={42} color={COLORS.primary} />

                        <Text style={styles.modalTitle}>
                            Remove Member
                        </Text>

                        <Text style={styles.modalText}>
                            Are you sure you want to remove this member from the family group?
                        </Text>

                        <View style={styles.modalActions}>

                            <TouchableOpacity style={styles.cancelBtn} onPress={closeRemoveModal}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.removeBtn} onPress={confirmRemove}>
                                <Text style={styles.removeText}>Remove</Text>
                            </TouchableOpacity>

                        </View>

                    </Animated.View>

                </Pressable>

            </Modal>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.bgcolor
    },

    centerLoad: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    headerSection: {
        alignItems: 'center',
        padding: 25
    },

    groupAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 12,
        elevation: 8
    },

    groupNameText: {
        fontSize: 22,
        fontFamily: FONTS.RobotoBold,
        color: COLORS.black
    },

    participantsCount: {
        color: COLORS.textSecondary
    },

    inviteCard: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 16,
        elevation: 4,
        width: '90%'
    },

    inviteTitle: {
        fontFamily: FONTS.RobotoBold,
        fontSize: 16,
        color: COLORS.white
    },

    inviteDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2
    },

    sectionTitle: {
        marginTop: 30,
        alignSelf: 'flex-start',
        fontSize: 18,
        fontFamily: FONTS.RobotoBold
    },

    participantCard: {
        marginHorizontal: 15,
        marginBottom: 12,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 15,
        elevation: 3
    },

    participantRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 12
    },

    participantInfo: {
        flex: 1
    },

    participantName: {
        fontSize: 16,
        fontFamily: FONTS.RobotoBold
    },

    relationText: {
        fontSize: 13,
        color: '#777'
    },

    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modalBox: {
        width: '85%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center'
    },

    modalTitle: {
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        marginTop: 10
    },

    modalText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 10
    },

    modalActions: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12
    },

    cancelBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#eee'
    },

    removeBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.primary
    },

    cancelText: {
        fontFamily: FONTS.RobotoBold
    },

    removeText: {
        color: COLORS.white,
        fontFamily: FONTS.RobotoBold
    }

});