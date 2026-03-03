import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';

export default function Calls() {
    const navigation = useNavigation();
    const { userToken } = useAuth(); // Correct variable name
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCalls = async () => {
        console.log("Fetching call history...");
        try {
            const res = await axios.get(`${BASE_URL}/calls/history`, {
                headers: { Authorization: `Bearer ${userToken}` },
                timeout: 10000 // 10s timeout
            });
            console.log("Calls fetched:", res.data?.length);
            setCalls(res.data);
        } catch (error) {
            console.error("Error fetching calls", error);
        } finally {
            console.log("Fetch calls finished");
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userToken) fetchCalls();
    }, [userToken]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCalls();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderItem = ({ item }) => {
        const isIncoming = item.direction === 'incoming';
        const isMissed = (item.status === 'missed' || item.status === 'rejected') && isIncoming;
        const isVideo = item.type === 'video';

        return (
            <View style={styles.itemContainer}>
                <Image
                    source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                />

                <View style={styles.info}>
                    <Text style={[styles.name, isMissed && { color: '#E53935' }]}>
                        {item.name}
                    </Text>

                    <View style={styles.subRow}>
                        <Ionicons
                            name={isIncoming ? "arrow-down" : "arrow-up"}
                            size={14}
                            color={isMissed ? '#E53935' : (isIncoming ? '#4CAF50' : '#2196F3')}
                        />
                        <Text style={styles.dateText}>
                            {formatDate(item.startTime)}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => {
                        // Redial logic
                        const screen = isVideo ? "VideoCallScreen" : "AudioCallScreen";
                        navigation.navigate(screen, {
                            isCaller: true,
                            userId: item.userId,
                            name: item.name,
                            profileImage: item.image
                        });
                    }}
                >
                    <Ionicons
                        name={isVideo ? "videocam" : "call"}
                        size={22}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={calls}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No recent calls</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 15 },

    itemContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#f5f5f5'
    },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },

    info: { flex: 1 },
    name: { fontSize: 16, fontFamily: FONTS.RobotoBold, color: '#333' },
    subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dateText: { marginLeft: 6, fontSize: 13, color: '#888', fontFamily: FONTS.RobotoRegular },

    callBtn: { padding: 10 },
    emptyText: { color: '#888', fontSize: 16 }
});
