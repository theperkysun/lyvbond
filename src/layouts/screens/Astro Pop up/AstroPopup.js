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
import Svg, { Path, G } from "react-native-svg";
import { COLORS, FONTS } from "../../../utlis/comon";

const { width, height } = Dimensions.get("window");

// Mock deleted

const PolygonProgress = ({ size, strokeWidth, score, total, color, icon, iconType }) => {
    // Determine sides directly from total score (min 3 to form a shape)
    const sides = total < 3 ? total === 2 ? 4 : 3 : total; // Fallback for small numbers if exist to square/triangle
    // However, user specified: 8 score -> 8 lines. 5 score -> 5 lines.
    // We'll trust total is >= 3 usually. If total=1 or 2, polygon math is weird.
    // Based on logic in calculateCompatibility, total is 5 or 8.

    // Math for regular polygon
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const angleStep = (2 * Math.PI) / sides;
    const startAngle = -Math.PI / 2; // Start from top (12 o'clock)

    let pathD = "";
    for (let i = 0; i < sides; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) pathD += `M ${x} ${y}`;
        else pathD += ` L ${x} ${y}`;
    }
    pathD += " Z"; // Close loop

    // Calculate perimeter for dasharray usage
    // Side length s = 2 * r * sin(PI/n)
    const sideLength = 2 * radius * Math.sin(Math.PI / sides);
    const perimeter = sideLength * sides;

    // Length to fill based on score
    // e.g., score 3/8 => 3/8 * perimeter
    const fillLength = (Math.min(score, total) / total) * perimeter;

    return (
        <View style={styles.progressContainer}>
            <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
                <Svg width={size} height={size}>
                    {/* Background Shape (Gray) */}
                    <Path
                        d={pathD}
                        stroke="#E0E0E0"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                    {/* Foreground Progress (Colored) */}
                    <Path
                        d={pathD}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={[fillLength, perimeter]}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
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

import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../../../config/apiConfig";
import { ActivityIndicator } from "react-native";
import AstroEditPopup from "./AstroEditPopup";

const AstroPopup = ({ visible, onClose, currentUser, partnerUser, isLocked }) => {
    const { userToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [matchData, setMatchData] = useState(null);
    const [editVisible, setEditVisible] = useState(false);

    // Local state for user's astro details to support immediate UI updates 
    const [myAstro, setMyAstro] = useState({});

    useEffect(() => {
        // Initialize from prop when available
        if (currentUser?.astro) {
            setMyAstro(currentUser.astro);
        } else if (currentUser?.astroDetails) {
            setMyAstro(currentUser.astroDetails);
        }
    }, [currentUser]);

    useEffect(() => {
        if (visible && partnerUser?._id) {
            fetchMatchData();
        }
    }, [visible, partnerUser]);

    const fetchMatchData = async () => {
        try {
            setMatchData(null); // Clear previous data
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/astro/match/${partnerUser._id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                setMatchData(response.data.data);
            }
        } catch (error) {
            console.error("Fetch Match Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare display data
    const displayData = {
        score: matchData?.total?.score || 0,
        totalScore: matchData?.total?.max || 36,
        isDefault: matchData?.isDefault || false,
        partnerName: partnerUser?.name || "Partner",
        userDetails: {
            // Read primarily from local refreshed state 'myAstro'
            timeOfBirth: myAstro?.timeOfBirth || currentUser?.timeOfBirth || "Not Set",
            placeOfBirth: myAstro?.cityOfBirth || myAstro?.placeOfBirth || currentUser?.cityOfBirth || "Not Set",
            manglik: myAstro?.manglik || currentUser?.manglik || "Not Set",
            raashi: myAstro?.raashi || myAstro?.rashi || currentUser?.raashi || "pisces",
            nakshatra: myAstro?.nakshatra || currentUser?.nakshatra || "Uttara Bhadrapada"
        },
        compatibility: matchData?.breakdown || [],
        partnerChart: {
            dob: isLocked ? "** / ** / ****" : (partnerUser?.basicDetails?.dob || partnerUser?.astro?.dateOfBirth || "Unknown"),
            tob: isLocked ? "** : ** | **" : (partnerUser?.astro?.timeOfBirth || partnerUser?.astroDetails?.timeOfBirth || "Unknown"),
            pob: isLocked ? "****" : (partnerUser?.astro?.cityOfBirth || partnerUser?.astroDetails?.cityOfBirth || partnerUser?.basicDetails?.hometown || "Unknown"),
            nakshatra: isLocked ? "****" : (partnerUser?.astro?.nakshatra || partnerUser?.astroDetails?.nakshatra || "Unknown"),
            manglik: isLocked ? "****" : (partnerUser?.astro?.manglik || partnerUser?.astroDetails?.manglik || "Unknown"),
            raashi: isLocked ? "****" : ((typeof partnerUser?.astro === 'string' ? partnerUser?.astro : partnerUser?.astro?.raashi) || partnerUser?.astroDetails?.raashi || "Unknown"),
        },
    };

    const handleSaveAstro = async (updatedData) => {
        try {
            setLoading(true);
            const response = await axios.patch(`${BASE_URL}/astro/update`, updatedData, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                // Update local state immediately
                setMyAstro(prev => ({
                    ...prev,
                    ...updatedData,
                    cityOfBirth: updatedData.placeOfBirth || prev.cityOfBirth // Backend uses cityOfBirth, Edit uses placeOfBirth
                }));
                // Refresh match data
                fetchMatchData();
            }
        } catch (error) {
            console.error("Update Astro Error:", error);
            setLoading(false);
        }
    };

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

                    {loading ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={{ marginTop: 10, color: "#666" }}>Updating Astro Details...</Text>
                        </View>
                    ) : (
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
                                            source={
                                                currentUser?.profileImage
                                                    ? (typeof currentUser.profileImage === 'string'
                                                        ? { uri: currentUser.profileImage }
                                                        : currentUser.profileImage)
                                                    : require('../../../assets/images/profileimage.png')
                                            }
                                            style={[styles.avatar, { zIndex: 2 }]}
                                        />
                                        <Image
                                            source={
                                                partnerUser?.images?.[0]
                                                    ? (typeof partnerUser.images[0] === 'string'
                                                        ? { uri: partnerUser.images[0] }
                                                        : partnerUser.images[0])
                                                    : require('../../../assets/images/profileimage.png')
                                            }
                                            style={[styles.avatar, { marginLeft: -15, zIndex: 1 }]}
                                        />
                                    </View>

                                    <View style={styles.scoreContainer}>
                                        <View style={styles.scoreRowNoMargin}>
                                            <Text style={styles.scoreText}>{displayData.score}</Text>
                                            <Text style={styles.totalScoreText}>/{displayData.totalScore}</Text>
                                        </View>
                                        <Text style={styles.predictionTextInline}>
                                            {!displayData.isDefault
                                                && "Predictions are based on your details."}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.titleInfoRow}>
                                    <View>
                                        <Text style={styles.compatibilityTitle}>
                                            Your Compatibility
                                        </Text>
                                        <Text style={{ fontSize: 13, color: '#555' }}>
                                            with {displayData.partnerName}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => setEditVisible(true)}
                                    >
                                        <Text style={styles.editButtonText}>EDIT</Text>
                                        <MaterialCommunityIcons name="pencil" size={14} color="#00BCD4" style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                </View>

                                {/* MISSING DETAILS WARNING */}
                                {displayData.isDefault && (
                                    <View style={{
                                        marginTop: 10,
                                        backgroundColor: 'rgba(255, 0, 0, 0.5)',
                                        borderRadius: 8,
                                        padding: 10,
                                        borderWidth: 1,
                                        borderColor: 'red'
                                    }}>
                                        <Text style={{ color: '#000', fontSize: 13, fontFamily: FONTS.RobotoMedium }}>
                                            ⚠️ Missing Details: <Text style={{ fontFamily: FONTS.RobotoBold }}>
                                                {(() => {
                                                    const isInvalid = (val) => !val || val === "Not Set" || val === "Unknown" || val === "" || val === null || val === undefined;

                                                    // 1. Current User
                                                    const { timeOfBirth, placeOfBirth, manglik, raashi, nakshatra } = displayData.userDetails;
                                                    const myDob = currentUser?.dob || currentUser?.dateOfBirth || currentUser?.basicDetails?.dob;

                                                    const myMissing = [
                                                        isInvalid(myDob) && "Date of Birth",
                                                        isInvalid(timeOfBirth) && "Time of Birth",
                                                        isInvalid(placeOfBirth) && "Place of Birth",
                                                        isInvalid(manglik) && "Manglik Status",
                                                        isInvalid(raashi) && "Raashi",
                                                        isInvalid(nakshatra) && "Nakshatra"
                                                    ].filter(Boolean);

                                                    if (myMissing.length > 0) return `Your ${myMissing.join(", ")}`;

                                                    // 2. Partner User
                                                    const { dob, tob, pob, manglik: pManglik, nakshatra: pNakshatra, raashi: pRaashi } = displayData.partnerChart;
                                                    const partnerMissing = [
                                                        isInvalid(dob) && "Date of Birth",
                                                        isInvalid(tob) && "Time of Birth",
                                                        isInvalid(pob) && "Place of Birth",
                                                        isInvalid(pManglik) && "Manglik Status",
                                                        isInvalid(pNakshatra) && "Nakshatra",
                                                        isInvalid(pRaashi) && "Raashi"
                                                    ].filter(Boolean);

                                                    if (partnerMissing.length > 0) return `${displayData.partnerName}'s ${partnerMissing.join(", ")}`;

                                                    return "Astro Details";
                                                })()}
                                            </Text>
                                        </Text>
                                        <Text style={{ color: '#000', fontSize: 12, marginTop: 4 }}>
                                            {(() => {
                                                const isInvalid = (val) => !val || val === "Not Set" || val === "Unknown" || val === "" || val === null || val === undefined;

                                                const { timeOfBirth, placeOfBirth, manglik, raashi, nakshatra } = displayData.userDetails;
                                                const myDob = currentUser?.dob || currentUser?.dateOfBirth || currentUser?.basicDetails?.dob;

                                                const myMissingCount = [myDob, timeOfBirth, placeOfBirth, manglik, raashi, nakshatra].filter(isInvalid).length;

                                                if (myMissingCount > 0) return "Please update your details for accurate compatibility.";
                                                return `These details are missing in ${displayData.partnerName}'s profile.`;
                                            })()}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* User Details Cards */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailsScroll}>
                                <View style={styles.detailCard}>
                                    <Text style={styles.detailLabel}>Time of Birth</Text>
                                    <Text style={styles.detailValue}>{displayData.userDetails.timeOfBirth}</Text>
                                </View>
                                <View style={styles.detailCard}>
                                    <Text style={styles.detailLabel}>Place of Birth</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>{displayData.userDetails.placeOfBirth}</Text>
                                </View>
                                <View style={styles.detailCard}>
                                    <Text style={styles.detailLabel}>Manglik Dosh</Text>
                                    <Text style={styles.detailValue}>{displayData.userDetails.manglik}</Text>
                                </View>
                            </ScrollView>

                            {/* Astro Compatibility Grid */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Astro Compatibility</Text>
                                <Ionicons name="information-circle" size={18} color="#00BCD4" style={{ marginLeft: 6 }} />
                            </View>

                            {displayData.compatibility.length === 0 ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#888', textAlign: 'center' }}>
                                        Astro details are missing for you or this user. Please edit your details to see compatibility.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.gridContainer}>
                                    {displayData.compatibility.map((item, index) => (
                                        <View key={index} style={styles.gridItem}>
                                            <PolygonProgress
                                                size={60}
                                                strokeWidth={4}
                                                score={item.score}
                                                total={item.max || item.total} // Backend sends max
                                                color={item.color}
                                                icon={item.icon}
                                                iconType={item.iconType}
                                            />
                                            <Text style={styles.gridLabel}>{item.label}</Text>
                                        </View>
                                    ))}
                                    {/* dummy item align */}
                                    {displayData.compatibility.length % 3 !== 0 && <View style={styles.gridItem} />}
                                </View>
                            )}

                            <View style={styles.divider} />

                            {/* Partner Chart */}
                            <View style={styles.partnerSection}>
                                <View style={styles.partnerHeader}>
                                    <Image
                                        source={
                                            partnerUser?.images?.[0]
                                                ? (typeof partnerUser.images[0] === 'string'
                                                    ? { uri: partnerUser.images[0] }
                                                    : partnerUser.images[0])
                                                : require('../../../assets/images/profileimage.png')
                                        }
                                        style={styles.smallAvatar}
                                    />
                                    <Text style={styles.partnerTitle}>{displayData.partnerName}'s Birth Chart</Text>
                                </View>

                                <View style={styles.partnerDetailsGrid}>
                                    <View style={styles.partnerDetailItem}>
                                        <Text style={styles.partnerLabel}>Date of Birth</Text>
                                        <Text style={styles.partnerValue}>{displayData.partnerChart.dob}</Text>
                                    </View>
                                    <View style={styles.partnerDetailItem}>
                                        <Text style={styles.partnerLabel}>Time of Birth</Text>
                                        <Text style={styles.partnerValue}>{displayData.partnerChart.tob}</Text>
                                    </View>
                                    <View style={styles.partnerDetailItemFull}>
                                        <Text style={styles.partnerLabel}>Place of Birth</Text>
                                        <Text style={styles.partnerValue}>{displayData.partnerChart.pob}</Text>
                                    </View>
                                    <View style={styles.partnerDetailItem}>
                                        <Text style={styles.partnerLabel}>Nakshatra</Text>
                                        <Text style={styles.partnerValue}>{displayData.partnerChart.nakshatra}</Text>
                                    </View>
                                    <View style={styles.partnerDetailItem}>
                                        <Text style={styles.partnerLabel}>Manglik Dosha</Text>
                                        <Text style={styles.partnerValue}>{displayData.partnerChart.manglik}</Text>
                                    </View>
                                    <View style={styles.partnerDetailItemFull}>
                                        <Text style={styles.partnerLabel}>Raashi</Text>
                                        <Text style={styles.partnerValue}>{displayData.partnerChart.raashi}</Text>
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
                    )}
                </View>
            </View>

            {/* Edit Popup */}
            <AstroEditPopup
                visible={editVisible}
                onClose={() => setEditVisible(false)}
                initialData={displayData.userDetails}
                onSave={handleSaveAstro}
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
        backgroundColor: COLORS.white,
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
        borderColor: COLORS.white,
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
