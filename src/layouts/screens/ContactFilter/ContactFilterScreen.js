import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
    Platform,
    ActivityIndicator,
    Alert
} from "react-native";
import axios from 'axios';

import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { COLORS, FONTS } from "../../../utlis/comon";
import { SELECTION_DATA } from "../../components/CommonComponents/selectionboxdata";
import Header from "../../components/CommonComponents/Header";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../config/apiConfig";

const { width } = Dimensions.get("window");

export default function ContactFilterScreen({ navigation }) {
    const { userToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // ----------------- STATES -----------------
    const [ageRange, setAgeRange] = useState([18, 40]);
    const [heightRange, setHeightRange] = useState([54, 84]);

    const [maritalStatus, setMaritalStatus] = useState(["Open for all"]);
    const [religion, setReligion] = useState(["Hindu"]);
    const [community, setCommunity] = useState(["Open for all"]);
    const [annualIncome, setAnnualIncome] = useState(["Open for all"]);
    const [workingWith, setWorkingWith] = useState(["Open for all"]);

    const [showMore, setShowMore] = useState(false);
    const [motherTongue, setMotherTongue] = useState(["Open for all"]);
    const [countryLiving, setCountryLiving] = useState(["Open for all"]);

    // ----------------- HELPERS -----------------
    const minAge = ageRange[0];
    const maxAge = ageRange[1];
    const minHeight = heightRange[0];
    const maxHeight = heightRange[1];

    const formatHeight = (inches) => {
        const ft = Math.floor(inches / 12);
        const inch = inches % 12;
        return `${ft}'${inch}"`;
    };

    const openOptionScreen = (title, field, currentSelection, setSelection) => {
        let dataKey = field;
        if (field === "countryLiving") dataKey = "country";
        let options = SELECTION_DATA[dataKey] || [];
        navigation.navigate("SearchOptionScreen", {
            title,
            options,
            selectedOptions: currentSelection,
            onSelect: (newSelection) => setSelection(newSelection),
        });
    };

    // ----------------- API CALLS -----------------
    useEffect(() => {
        const fetchFilters = async () => {
            if (!userToken) return;
            try {
                const response = await axios.get(`${BASE_URL}/contact-filter`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });

                if (response.data && response.data.data) {
                    const data = response.data.data;
                    setAgeRange([data.ageMin || 18, data.ageMax || 40]);
                    setHeightRange([data.heightMin || 54, data.heightMax || 84]);
                    setMaritalStatus(data.maritalStatus?.length ? data.maritalStatus : ["Open for all"]);
                    setReligion(data.religion?.length ? data.religion : ["Hindu"]);
                    setCommunity(data.community?.length ? data.community : ["Open for all"]);
                    setAnnualIncome(data.annualIncome?.length ? data.annualIncome : ["Open for all"]);
                    setWorkingWith(data.workingWith?.length ? data.workingWith : ["Open for all"]);
                    setMotherTongue(data.motherTongue?.length ? data.motherTongue : ["Open for all"]);
                    setCountryLiving(data.countryLiving?.length ? data.countryLiving : ["Open for all"]);
                }
            } catch (error) {
                console.error("Error fetching filters:", error);
                // Alert.alert("Error", "Could not fetch saved filters.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilters();
    }, [userToken]);

    const handleSave = async () => {
        setIsSaving(true);
        const payload = {
            ageMin: ageRange[0],
            ageMax: ageRange[1],
            heightMin: heightRange[0],
            heightMax: heightRange[1],
            maritalStatus,
            religion,
            community,
            annualIncome,
            workingWith,
            motherTongue,
            countryLiving
        };

        try {
            const response = await axios.patch(`${BASE_URL}/contact-filter`, payload, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                Alert.alert("Success", "Contact filters updated successfully.");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error saving filters:", error);
            Alert.alert("Error", "Failed to save filters.");
        } finally {
            setIsSaving(false);
        }
    };

    const Row = ({ label, value, onPress, icon }) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return (
            <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
                <LinearGradient
                    colors={[COLORS.primary + '15', COLORS.primary + '05']}
                    style={styles.iconBox}
                >
                    <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
                </LinearGradient>

                <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowValue} numberOfLines={1}>{displayValue}</Text>
                </View>

                <View style={styles.arrowBox}>
                    <Icon name="chevron-right" size={20} color="#ccc" />
                </View>
            </TouchableOpacity>
        );
    };

    // ----------------- UI -----------------
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Curve */}
            <Header
                title="Contact Filters"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.infoText}>
                    Define who can contact you by setting detailed criteria below.
                </Text>

                {/* SLIDERS CARD */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="tune-vertical" size={20} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Basic Ranges</Text>
                    </View>

                    {/* AGE SLIDER */}
                    <View style={styles.sliderBlock}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.smallLabel}>Age Range</Text>
                            <Text style={styles.sliderValue}>{minAge} - {maxAge} yrs</Text>
                        </View>
                        <MultiSlider
                            values={ageRange}
                            onValuesChange={setAgeRange}
                            min={18} max={71} step={1}
                            sliderLength={width - 72} // card padding consideration
                            selectedStyle={{ backgroundColor: COLORS.primary }}
                            trackStyle={styles.track}
                            markerStyle={styles.thumb}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* HEIGHT SLIDER */}
                    <View style={styles.sliderBlock}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.smallLabel}>Height Range</Text>
                            <Text style={styles.sliderValue}>
                                {formatHeight(minHeight)} - {formatHeight(maxHeight)}
                            </Text>
                        </View>
                        <MultiSlider
                            values={heightRange}
                            onValuesChange={setHeightRange}
                            min={48} max={84} step={1}
                            sliderLength={width - 72}
                            selectedStyle={{ backgroundColor: COLORS.primary }}
                            trackStyle={styles.track}
                            markerStyle={styles.thumb}
                        />
                    </View>
                </View>

                {/* FILTERS CARD */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Preferences</Text>
                    </View>

                    <Row
                        label="Marital Status"
                        value={maritalStatus}
                        icon="ring"
                        onPress={() => openOptionScreen("Marital Status", "maritalStatus", maritalStatus, setMaritalStatus)}
                    />
                    <Row
                        label="Religion"
                        value={religion}
                        icon="hands-pray"
                        onPress={() => openOptionScreen("Religion", "religion", religion, setReligion)}
                    />
                    <Row
                        label="Community"
                        value={community}
                        icon="account-group-outline"
                        onPress={() => openOptionScreen("Community", "community", community, setCommunity)}
                    />
                    <Row
                        label="Annual Income"
                        value={annualIncome}
                        icon="wallet-outline"
                        onPress={() => openOptionScreen("Annual Income", "annualIncome", annualIncome, setAnnualIncome)}
                    />
                    <Row
                        label="Working With"
                        value={workingWith}
                        icon="office-building-outline"
                        onPress={() => openOptionScreen("Working With", "workingWith", workingWith, setWorkingWith)}
                    />
                </View>

                {/* MORE OPTIONS */}
                {!showMore ? (
                    <TouchableOpacity style={styles.moreBtn} onPress={() => setShowMore(true)}>
                        <Text style={styles.moreBtnText}>Show More Options</Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>More Details</Text>
                        </View>
                        <Row
                            label="Mother Tongue"
                            value={motherTongue}
                            icon="translate"
                            onPress={() => openOptionScreen("Mother Tongue", "motherTongue", motherTongue, setMotherTongue)}
                        />
                        <Row
                            label="Country living in"
                            value={countryLiving}
                            icon="earth"
                            onPress={() => openOptionScreen("Country Living In", "countryLiving", countryLiving, setCountryLiving)}
                        />
                        <TouchableOpacity style={styles.lessBtn} onPress={() => setShowMore(false)}>
                            <Text style={styles.lessBtnText}>Show Less</Text>
                            <MaterialCommunityIcons name="chevron-up" size={18} color="#999" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FLOATING SAVE BUTTON */}
            <View style={styles.fixedBottom}>
                <TouchableOpacity activeOpacity={0.8} onPress={handleSave} style={styles.shadowWrapper} disabled={isSaving}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primary]}
                        style={styles.searchBtn}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.searchBtnText}>Apply Filters</Text>
                                <MaterialCommunityIcons name="check" size={22} color="#fff" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ----------------- STYLES -----------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FB", // Modern Light Grey
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    infoText: {
        fontSize: 13,
        color: '#888',
        marginBottom: 20,
        fontFamily: FONTS.RobotoRegular,
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        paddingBottom: 10
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
        color: '#333',
        marginLeft: 10,
        letterSpacing: 0.5
    },
    sliderBlock: {
        marginBottom: 5,
        alignItems: 'center'
    },
    sliderHeader: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        alignItems: 'center'
    },
    smallLabel: {
        color: "#555",
        fontSize: 14,
        fontFamily: FONTS.RobotoMedium
    },
    sliderValue: {
        color: COLORS.primary,
        fontFamily: FONTS.RobotoBold,
        fontSize: 14
    },
    track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: "#eee"
    },
    thumb: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: 6,
        borderColor: COLORS.primary,
        elevation: 3
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 15
    },

    // Row Styles
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f9f9f9"
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    rowLabel: {
        fontSize: 12,
        color: "#999",
        fontFamily: FONTS.RobotoMedium,
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    rowValue: {
        color: "#333",
        fontSize: 15,
        fontFamily: FONTS.RobotoBold,
    },
    arrowBox: {
        backgroundColor: '#f5f5f5',
        padding: 4,
        borderRadius: 8
    },

    // More Button
    moreBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 40,
        elevation: 2,
        marginBottom: 20
    },
    moreBtnText: {
        color: COLORS.primary,
        fontFamily: FONTS.RobotoBold,
        fontSize: 14,
        marginRight: 5
    },
    lessBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5'
    },
    lessBtnText: {
        fontSize: 13,
        color: '#999',
        fontFamily: FONTS.RobotoMedium,
        marginRight: 4
    },

    // Floating Button
    fixedBottom: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 100
    },
    shadowWrapper: {
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        borderRadius: 30,
    },
    searchBtn: {
        width: width * 0.85,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
    },
    searchBtnText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        letterSpacing: 0.5
    },
});
