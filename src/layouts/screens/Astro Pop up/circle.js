import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Svg, { Circle, G } from "react-native-svg";
import { COLORS, FONTS } from "../../../utlis/comon";

const { width, height } = Dimensions.get("window");

// Mock Data based on screenshots
const MOCK_DATA = {
    score: 27,
    totalScore: 36,
    partnerName: "Ananya B",
    userDetails: {
        timeOfBirth: "08:00 AM",
        placeOfBirth: "Kolkata, West Bengal, India",
        manglik: "Don't Know",
    },
    compatibility: [
        { label: "Work", score: 1, total: 1, icon: "briefcase-outline", color: "#4A90E2" },
        { label: "Influence", score: 0.5, total: 2, icon: "flash-outline", color: "#F5A623" },
        { label: "Destiny", score: 3, total: 3, icon: "flag-outline", color: "#BD10E0" },
        { label: "Mentality", score: 2, total: 4, icon: "brain", iconType: "MaterialCommunityIcons", color: "#7ED321" },
        { label: "Compatibility", score: 0.5, total: 5, icon: "human-male-female", iconType: "MaterialCommunityIcons", color: "#9013FE" },
        { label: "Temperament", score: 5, total: 6, icon: "chart-pie", iconType: "MaterialCommunityIcons", color: "#F8E71C" },
        { label: "Love", score: 7, total: 7, icon: "heart-outline", color: "#E91E63" },
        { label: "Health", score: 8, total: 8, icon: "home-outline", color: "#00BCD4" },
    ],
    partnerChart: {
        dob: "14/05/1998",
        tob: "09:15 AM",
        pob: "Bishnupur, West Bengal, India",
        nakshatra: "Punarvasu",
        manglik: "No",
        raashi: "Gemini (Mithun)",
    },
};

const CircularProgress = ({ size, strokeWidth, score, total, color, icon, iconType }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = score / total;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={styles.progressContainer}>
            <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            stroke="#E0E0E0"
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <Circle
                            stroke={color}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </G>
                </Svg>
                <View style={styles.iconContainer}>
                    {iconType === "MaterialCommunityIcons" ? (
                        <MaterialCommunityIcons name={icon} size={20} color={color} />
                    ) : (
                        <Ionicons name={icon} size={20} color={color} />
                    )}
                </View>
            </View>
            <Text style={styles.progressLabel}>{score}/{total}</Text>
        </View>
    );
};

import AstroEditPopup from "./AstroEditPopup";

const AstroPopup = ({ visible, onClose, currentUser, partnerUser }) => {

    // Helper to generate deterministic random numbers based on strings
    const getHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    // Calculate dynamic compatibility based on user data
    const calculateCompatibility = () => {
        const seed = (currentUser?.fullName || "") + (partnerUser?.name || "");
        const hash = getHash(seed);

        // Generate total score (18 to 36 for realistic good matches)
        const totalScore = 18 + (hash % 19);

        // Generate category scores
        const categories = [
            { label: "Work", icon: "briefcase-outline", color: "#4A90E2" },
            { label: "Influence", icon: "flash-outline", color: "#F5A623" },
            { label: "Destiny", icon: "flag-outline", color: "#BD10E0" },
            { label: "Mentality", icon: "brain", iconType: "MaterialCommunityIcons", color: "#7ED321" },
            { label: "Compatibility", icon: "human-male-female", iconType: "MaterialCommunityIcons", color: "#9013FE" },
            { label: "Temperament", icon: "chart-pie", iconType: "MaterialCommunityIcons", color: "#F8E71C" },
            { label: "Love", icon: "heart-outline", color: "#E91E63" },
            { label: "Health", icon: "home-outline", color: "#00BCD4" },
        ];

        const compatibilityData = categories.map((cat, index) => {
            // Generate a score between 0.5 and total possible for that category (mocking max as 5-8)
            const max = index % 2 === 0 ? 8 : 5;
            const itemHash = getHash(seed + cat.label);
            const score = (itemHash % (max * 2)) / 2; // increments of 0.5
            return {
                ...cat,
                score: Math.max(0.5, Math.min(score, max)),
                total: max
            };
        });

        return { score: totalScore, compatibility: compatibilityData };
    };

    const { score, compatibility } = calculateCompatibility();

    const data = {
        score: score,
        totalScore: 36,
        partnerName: partnerUser?.name || "Partner",
        userDetails: {
            timeOfBirth: currentUser?.astro?.timeOfBirth || "Unknown",
            placeOfBirth: currentUser?.astro?.cityOfBirth || "Unknown",
            manglik: currentUser?.astro?.manglik || "Unknown",
        },
        compatibility: compatibility,
        partnerChart: {
            dob: partnerUser?.basicDetails?.dob || partnerUser?.astro?.dateOfBirth || "Unknown",
            tob: partnerUser?.astro?.timeOfBirth || partnerUser?.astroDetails?.timeOfBirth || "Unknown",
            pob: partnerUser?.astro?.cityOfBirth || partnerUser?.astroDetails?.cityOfBirth || partnerUser?.basicDetails?.hometown || "Unknown",
            nakshatra: partnerUser?.astro?.nakshatra || partnerUser?.astroDetails?.nakshatra || "Unknown",
            manglik: partnerUser?.astro?.manglik || partnerUser?.astroDetails?.manglik || "Unknown",
            raashi: (typeof partnerUser?.astro === 'string' ? partnerUser?.astro : partnerUser?.astro?.raashi) || partnerUser?.astroDetails?.raashi || "Unknown",
        },
    };

    const [editVisible, setEditVisible] = useState(false);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* Removed Pressable overlay to prevent closing on background click */}
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    {/* Header Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                    >
                        {/* Avatars & Score Row */}
                        <View style={styles.topSection}>
                            <View style={styles.topHeaderRow}>
                                <View style={styles.avatarRow}>
                                    <Image
                                        source={currentUser?.profileImage}
                                        style={[styles.avatar, { zIndex: 2 }]}
                                    />
                                    <Image
                                        source={partnerUser?.images?.[0]}
                                        style={[styles.avatar, { marginLeft: -15, zIndex: 1 }]}
                                    />
                                </View>

                                <View style={styles.scoreContainer}>
                                    <View style={styles.scoreRowNoMargin}>
                                        <Text style={styles.scoreText}>{data.score}</Text>
                                        <Text style={styles.totalScoreText}>/{data.totalScore}</Text>
                                    </View>
                                    <Text style={styles.predictionTextInline}>Predictions are based on your details.</Text>
                                </View>
                            </View>

                            <View style={styles.titleInfoRow}>
                                <Text style={styles.compatibilityTitle}>
                                    Your Compatibility with {data.partnerName}
                                </Text>

                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setEditVisible(true)}
                                >
                                    <Text style={styles.editButtonText}>EDIT</Text>
                                    <MaterialCommunityIcons name="pencil" size={14} color="#00BCD4" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* User Details Cards */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailsScroll}>
                            <View style={styles.detailCard}>
                                <Text style={styles.detailLabel}>Time of Birth</Text>
                                <Text style={styles.detailValue}>{data.userDetails.timeOfBirth}</Text>
                            </View>
                            <View style={styles.detailCard}>
                                <Text style={styles.detailLabel}>Place of Birth</Text>
                                <Text style={styles.detailValue} numberOfLines={2}>{data.userDetails.placeOfBirth}</Text>
                            </View>
                            <View style={styles.detailCard}>
                                <Text style={styles.detailLabel}>Manglik Dosh</Text>
                                <Text style={styles.detailValue}>{data.userDetails.manglik}</Text>
                            </View>
                        </ScrollView>

                        {/* Astro Compatibility Grid */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Astro Compatibility</Text>
                            <Ionicons name="information-circle" size={18} color="#00BCD4" style={{ marginLeft: 6 }} />
                        </View>

                        <View style={styles.gridContainer}>
                            {data.compatibility.map((item, index) => (
                                <View key={index} style={styles.gridItem}>
                                    <CircularProgress
                                        size={60}
                                        strokeWidth={4}
                                        score={item.score}
                                        total={item.total}
                                        color={item.color}
                                        icon={item.icon}
                                        iconType={item.iconType}
                                    />
                                    <Text style={styles.gridLabel}>{item.label}</Text>
                                </View>
                            ))}
                            {/* Add dummy item to align last row left-to-right if needed */}
                            {data.compatibility.length % 3 !== 0 && <View style={styles.gridItem} />}
                        </View>

                        <View style={styles.divider} />

                        {/* Partner Chart */}
                        <View style={styles.partnerSection}>
                            <View style={styles.partnerHeader}>
                                <Image source={partnerUser?.images?.[0]} style={styles.smallAvatar} />
                                <Text style={styles.partnerTitle}>{data.partnerName}'s Birth Chart</Text>
                            </View>

                            <View style={styles.partnerDetailsGrid}>
                                <View style={styles.partnerDetailItem}>
                                    <Text style={styles.partnerLabel}>Date of Birth</Text>
                                    <Text style={styles.partnerValue}>{data.partnerChart.dob}</Text>
                                </View>
                                <View style={styles.partnerDetailItem}>
                                    <Text style={styles.partnerLabel}>Time of Birth</Text>
                                    <Text style={styles.partnerValue}>{data.partnerChart.tob}</Text>
                                </View>
                                <View style={styles.partnerDetailItemFull}>
                                    <Text style={styles.partnerLabel}>Place of Birth</Text>
                                    <Text style={styles.partnerValue}>{data.partnerChart.pob}</Text>
                                </View>
                                <View style={styles.partnerDetailItem}>
                                    <Text style={styles.partnerLabel}>Nakshatra</Text>
                                    <Text style={styles.partnerValue}>{data.partnerChart.nakshatra}</Text>
                                </View>
                                <View style={styles.partnerDetailItem}>
                                    <Text style={styles.partnerLabel}>Manglik Dosha</Text>
                                    <Text style={styles.partnerValue}>{data.partnerChart.manglik}</Text>
                                </View>
                                <View style={styles.partnerDetailItemFull}>
                                    <Text style={styles.partnerLabel}>Raashi</Text>
                                    <Text style={styles.partnerValue}>{data.partnerChart.raashi}</Text>
                                </View>
                            </View>

                            <View style={styles.premiumNote}>
                                <MaterialCommunityIcons name="crown" size={14} color="#E91E63" />
                                <Text style={styles.premiumNoteText}>These are visible only to Premium users.</Text>
                            </View>

                            <View style={styles.privacyNote}>
                                <Ionicons name="shield-checkmark-outline" size={14} color="#4CAF50" />
                                <Text style={styles.privacyNoteText}>Astro Privacy controls are available in Settings.</Text>
                            </View>
                        </View>

                    </ScrollView>
                </View>
            </View>

            {/* Edit Popup */}
            <AstroEditPopup
                visible={editVisible}
                onClose={() => setEditVisible(false)}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    popupContainer: {
        width: "100%",
        height: "90%", // Occupy most of the screen
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    handleContainer: {
        alignItems: "center",
        paddingTop: 10,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: "#E0E0E0",
        borderRadius: 2.5,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    topSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    avatarRow: {
        flexDirection: "row",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#fff",
    },
    compatibilityTitle: {
        fontSize: 16,
        fontFamily: FONTS.RobotoMedium,
        color: "#333",
        marginBottom: 4,
    },
    scoreText: {
        fontSize: 36,
        fontFamily: FONTS.RobotoBold,
        color: "#E91E63",
    },
    totalScoreText: {
        fontSize: 26,
        fontFamily: FONTS.RobotoMedium,
        color: "#999",
    },
    topHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 15,
        flex: 1,
    },
    scoreRowNoMargin: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    predictionTextInline: {
        fontSize: 12,
        color: "#555",
        fontFamily: FONTS.RobotoRegular,
        marginLeft: 10,
        flex: 1,
        marginTop: 10,
    },
    titleInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 10,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#00BCD4",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    editButtonText: {
        fontSize: 12,
        color: "#00BCD4",
        fontFamily: FONTS.RobotoBold,
    },
    detailsScroll: {
        paddingLeft: 20,
        marginBottom: 20,
    },
    detailCard: {
        backgroundColor: "#F5F5F5",
        borderRadius: 10,
        padding: 12,
        marginRight: 10,
        width: 120,
    },
    detailLabel: {
        fontSize: 12,
        color: "#777",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
        fontFamily: FONTS.RobotoMedium,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
        color: "#333",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 10,
        justifyContent: "space-between",
    },
    gridItem: {
        width: width / 3 - 15,
        alignItems: "center",
        marginBottom: 20,
    },
    progressContainer: {
        alignItems: "center",
    },
    iconContainer: {
        position: "absolute",
    },
    progressLabel: {
        marginTop: 6,
        fontSize: 14,
        fontFamily: FONTS.RobotoMedium,
        color: "#333",
    },
    gridLabel: {
        marginTop: 4,
        fontSize: 12,
        color: "#777",
        textAlign: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 20,
    },
    partnerSection: {
        paddingHorizontal: 20,
    },
    partnerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    smallAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    partnerTitle: {
        fontSize: 16,
        fontFamily: FONTS.RobotoMedium,
        color: "#333",
    },
    partnerDetailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    partnerDetailItem: {
        width: "48%",
        marginBottom: 16,
    },
    partnerDetailItemFull: {
        width: "100%",
        marginBottom: 16,
    },
    partnerLabel: {
        fontSize: 12,
        color: "#777",
        marginBottom: 4,
    },
    partnerValue: {
        fontSize: 14,
        color: "#333",
        fontFamily: FONTS.RobotoMedium,
    },
    premiumNote: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 6,
    },
    premiumNoteText: {
        fontSize: 12,
        color: "#777",
        marginLeft: 6,
    },
    privacyNote: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    privacyNoteText: {
        fontSize: 12,
        color: "#777",
        marginLeft: 6,
    },
});

export default AstroPopup;
