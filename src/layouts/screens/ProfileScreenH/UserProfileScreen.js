import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
const { width } = Dimensions.get("window");
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/CommonComponents/Header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../../utlis/comon';
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

// IMPORT PROFILE DATA FILE
import { userProfileData } from '../../components/CommonComponents/profileUserData';

const HOBBY_ICONS = {
    // Creative
    'Writing': 'pencil', 'Cooking': 'silverware-fork-knife', 'Singing': 'microphone',
    'Photography': 'camera', 'Playing instruments': 'guitar-acoustic', 'Painting': 'brush',
    'DIY Crafts': 'scissors-cutting', 'Calligraphy': 'pen', 'Acting': 'drama-masks',
    'Dance': 'dance-ballroom', 'Designing': 'palette',
    // Fun
    'Movies': 'filmstrip', 'Music': 'music', 'Travelling': 'airplane',
    'Reading': 'book-open', 'Sports': 'basketball', 'Social media': 'account-group',
    'Gaming': 'gamepad-variant', 'Nightlife': 'glass-cocktail', 'Shopping': 'shopping',
    'Comedy': 'emoticon-happy',
    // Fitness
    'Running': 'run', 'Cycling': 'bike', 'Yoga': 'yoga', 'Meditation': 'meditation',
    'Walking': 'walk', 'Workout': 'weight-lifter', 'Trekking': 'hiking', 'Gym': 'dumbbell',
    // Others
    'Pets': 'dog', 'Foodie': 'food', 'Vegan': 'leaf', 'News & Politics': 'newspaper',
    'Social Service': 'handshake', 'Entrepreneurship': 'briefcase', 'Home Decor': 'sofa',
    'Technology': 'laptop', 'Crypto': 'bitcoin', 'Cars': 'car', 'Fashion': 'tshirt-crew'
};

export default function UserProfileScreen({ navigation, route }) {
    const { userToken, setUserInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(userProfileData);

    useFocusEffect(
        useCallback(() => {
            if (userToken) {
                fetchProfile();
            }
        }, [userToken])
    );

    const fetchProfile = async () => {
        try {
            console.log("Fetching Profile with Token:", userToken);
            if (!userToken) {
                console.log("Skipping fetch - No Token");
                return;
            }

            // API INTEGRATED: GET /user/profile
            // PURPOSE: To fetch the authenticated user's profile data dynamically from MongoDB.
            const response = await axios.get(`${BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                const backendData = response.data.user;

                // Update Global Auth Context so MenuScreen & others see changes immediately
                setUserInfo(backendData);

                const mappedProfile = mapApiToUi(backendData);
                setProfile(mappedProfile);
            }
        } catch (error) {
            console.error("Profile Fetch Error:", error);
            // Fallback to static data on error is generic behavior, or alert user
        } finally {
            setLoading(false);
        }
    };

    const mapApiToUi = (user) => {
        // Calculate Age
        let age = "N/A";
        if (user.dob && user.dob.year) {
            const currentYear = new Date().getFullYear();
            age = (currentYear - parseInt(user.dob.year)).toString();
        }

        const formatLastSeen = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return "Just now";
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        };

        const formatPlanText = (type) => {
            if (!type || type.toLowerCase() === 'free') return 'Free Plan';
            // Capitalize first letter and append "Plan" if it doesn't already have it
            const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
            return capitalized.toLowerCase().includes('plan') ? capitalized : `${capitalized} Plan`;
        };

        return {
            fullName: user.name || "User",
            isOnline: user.isOnline, // Map isOnline
            lastSeen: formatLastSeen(user.lastSeen),
            useid: user.userId || "",
            acctype: formatPlanText(user.subscriptionType || user.accountType),

            // Handle Profile Image (Network or Fallback)
            // Log the image URL for debugging
            // console.log("Profile Image URL from DB:", user.profileImage);

            profileImage: (user.profileImage && user.profileImage.startsWith('http'))
                ? { uri: user.profileImage }
                : require("../../../assets/images/profilemain.png"),
            images: user.images || [],

            basicInfo: {
                postedBy: user.profileFor || "",
                gender: user.gender || "",
                age: age,
                maritalStatus: user.preferences?.maritalStatus || "",
                height: user.preferences?.height || "",
                anyDisability: user.basicInfo?.anyDisability || "",
                healthInfo: user.basicInfo?.healthInfo || "",
                email: user.email || "",
                mobile: user.phoneNumber || ""
            },

            aboutMyself: user.about || "",

            religiousInfo: {
                religion: user.partnerPreferences?.religion?.[0] || "",
                motherTongue: user.partnerPreferences?.motherTongue?.[0] || "",
                community: user.location?.subcommunity || "",
                subCommunity: user.religiousInfo?.subCommunity || "",
                casteNoBar: user.preferences?.noCasteBar ? "Yes" : "No",
                gothra: user.religiousInfo?.gothra || ""
            },

            family: {
                motherDetails: user.family?.motherDetails || "",
                fatherDetails: user.family?.fatherDetails || "",
                sisters: user.family?.sistersCount || "",
                brothers: user.family?.brothersCount || "",
                financialStatus: user.family?.financialStatus || ""
            },

            astro: {
                manglik: user.astro?.manglik || "",
                dateOfBirth: user.dob ? `${user.dob.day || ''}-${user.dob.month || ''}-${user.dob.year || ''}` : "",
                timeOfBirth: user.astro?.timeOfBirth || "",
                cityOfBirth: user.astro?.cityOfBirth || "",
                raashi: user.astro?.raashi || "",
                nakshatra: user.astro?.nakshatra || ""
            },

            locationEducationCareer: {
                country: user.location?.country || "",
                state: user.location?.state || "",
                city: user.location?.city || "",
                residencyStatus: user.location?.residencyStatus || "",
                pinCode: user.location?.pinCode || "",
                grewUpIn: user.location?.grewUpIn || "",
                highestQualification: user.education?.qualification || "",
                college: user.education?.college || "",
                workingWith: user.education?.workType || "",
                workingAs: user.education?.profession || "",
                annualIncome: user.education?.income || "",
                employerName: user.education?.organization || ""
            },

            lifestyle: {
                diet: user.preferences?.diet || ""
            },

            hobbies: user.preferences?.hobbies?.map(h => ({
                name: h,
                icon: HOBBY_ICONS[h] || 'star'
            })) || [],

            partnerBasicInfo: {
                age: user.partnerPreferences?.ageRange ? `${user.partnerPreferences.ageRange[0]} - ${user.partnerPreferences.ageRange[1]}` : "",
                height: (typeof user.partnerPreferences?.heightRange === 'string')
                    ? user.partnerPreferences.heightRange
                    : (Array.isArray(user.partnerPreferences?.heightRange)
                        ? `${user.partnerPreferences.heightRange[0]}" - ${user.partnerPreferences.heightRange[1]}"`
                        : ""),
                maritalStatus: user.partnerPreferences?.maritalStatus?.[0] || "",
                children: user.partnerPreferences?.children?.[0] || "",
                religionCommunity: user.partnerPreferences?.religion?.[0] || "",
                community: user.partnerPreferences?.community?.[0] || "",
                motherTongue: user.partnerPreferences?.motherTongue?.[0] || ""
            },

            partnerLocationDetails: {
                country: user.partnerPreferences?.country?.[0] || "",
                state: user.partnerPreferences?.state?.[0] || "",
                city: user.partnerPreferences?.city?.[0] || ""
            },

            partnerEducationCareer: {
                qualification: user.partnerPreferences?.qualification?.[0] || "",
                workingWith: user.partnerPreferences?.workingWith?.[0] || "",
                professionArea: user.partnerPreferences?.profession?.[0] || "",
                workingAs: user.partnerPreferences?.workingAs?.[0] || "",
                annualIncome: user.partnerPreferences?.income?.[0] || ""
            },

            partnerOtherDetails: {
                profileManagedBy: user.partnerPreferences?.profileManagedBy?.[0] || "",
                diet: user.partnerPreferences?.diet?.[0] || ""
            }
        };
    };


    // Small helper to go to Edit screen
    const goToEdit = (sectionKey) => {
        navigation.navigate('EditProfile', {
            section: sectionKey,
            profile: profile,
        });
    };

    const goToFill = (sectionKey) => {
        navigation.navigate('AddProfileData', {
            section: sectionKey,
            profile: profile,
        });
    };

    const checkMissing = (data) => {
        if (!data) return true;
        if (typeof data === 'string') return data.trim() === "";
        if (Array.isArray(data)) return data.length === 0;
        return Object.values(data).some(val => val === "" || val === null || val === undefined);
    };

    const SectionHeader = ({ title, icon, onEditPress }) => (
        <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={icon} size={20} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onEditPress} style={styles.editBtn}>
                <LinearGradient
                    colors={[COLORS.primary, '#FF8E53']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.editGradient}
                >
                    <FontAwesome6 name="pencil" size={14} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const Row = ({ label, value, onFillPress }) => (
        <View style={styles.row}>
            <Text style={styles.key}>{label}</Text>

            {(!value || value === "") && onFillPress ? (
                <TouchableOpacity onPress={onFillPress} style={styles.fillNowContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, '#FF512F']}
                        style={styles.fillNowBtn}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.fillNowText}>Fill Now</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            ) : (
                <Text style={styles.value}>{value}</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const imagesArray = [];
    if (profile.profileImage?.uri || typeof profile.profileImage === 'number') {
        imagesArray.push(profile.profileImage);
    }
    if (profile.images && Array.isArray(profile.images)) {
        profile.images.forEach(img => imagesArray.push({ uri: img }));
    }

    return (
        <View style={styles.container}>
            {/* 🔹 HEADER */}
            <Header title="My Profile" onBackPress={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>



                {/* 🔹 PROFILE IMAGE SECTION (MULTI-IMAGE SLIDER) */}
                <View style={styles.profileCardContainer}>
                    <View style={styles.imageSliderContainer}>
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.slider}>
                            {imagesArray.length > 0 ? (
                                imagesArray.map((imgObj, i) => (
                                    <View key={i} style={styles.imageContainer}>
                                        <Image source={imgObj} style={styles.sliderImg} />
                                        {i === 0 && (
                                            <View style={styles.primaryBadge}>
                                                <MaterialCommunityIcons name="star" size={14} color="#FFF" />
                                                <Text style={styles.primaryText}>Primary</Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <View style={[styles.sliderImg, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                                    <MaterialCommunityIcons name="account" size={80} color="#999" />
                                </View>
                            )}
                        </ScrollView>

                        {/* Gradient Overlay for Text */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,1)']}
                            style={styles.bottomGradient}
                        />

                        {/* User Info Overlaid on Image */}
                        <View style={styles.infoOverlay}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.nameText} numberOfLines={1}>
                                    {profile.fullName}
                                    {profile.basicInfo?.age && profile.basicInfo.age !== "N/A" ? `, ${profile.basicInfo.age}` : ''}
                                </Text>
                                <View style={[styles.onlineDot, { backgroundColor: profile.isOnline ? '#00E676' : 'gray' }]} />
                            </View>
                            <Text style={styles.idText}>ID: {profile.useid}</Text>

                            <View style={styles.membershipBadge}>
                                <MaterialCommunityIcons name="crown" size={14} color="#FFD700" />
                                <Text style={styles.membershipText}>{profile.acctype || "Free Plan"}</Text>
                            </View>
                        </View>

                        {/* Edit Float Button */}
                        <TouchableOpacity style={styles.editFloatButton} onPress={() => goToEdit('profileHeader')}>
                            <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* SECTION 1 – BASIC INFO */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Basic Info"
                        icon="account-circle"
                        onEditPress={() => goToEdit('basicInfo')}
                    />

                    <Row label="Posted By" value={profile.basicInfo.postedBy} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Gender" value={profile.basicInfo.gender} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Age" value={profile.basicInfo.age} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Marital Status" value={profile.basicInfo.maritalStatus} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Height" value={profile.basicInfo.height} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Any Disability?" value={profile.basicInfo.anyDisability} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Health Info" value={profile.basicInfo.healthInfo} onFillPress={() => goToFill('basicInfo')} />
                    <Row label="Email" value={profile.basicInfo.email} />
                    <Row label="Mobile" value={profile.basicInfo.mobile} />
                </View>

                {/* SECTION 2 – ABOUT MYSELF */}
                <View style={styles.card}>
                    <SectionHeader
                        title="About Myself"
                        icon="text-box-outline"
                        onEditPress={() => goToEdit('aboutMyself')}
                    />
                    <Text style={styles.description}>
                        {profile.aboutMyself || "Tell us something about yourself..."}
                    </Text>
                </View>

                {/* SECTION 3 – RELIGIOUS BACKGROUND */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Religious Background"
                        icon="hands-pray"
                        onEditPress={() => goToEdit('religiousInfo')}
                    />

                    <Row label="Religion" value={profile.religiousInfo.religion} onFillPress={() => goToFill('religiousInfo')} />
                    <Row label="Mother Tongue" value={profile.religiousInfo.motherTongue} onFillPress={() => goToFill('religiousInfo')} />
                    <Row label="Community" value={profile.religiousInfo.community} onFillPress={() => goToFill('religiousInfo')} />
                    <Row label="Sub Community" value={profile.religiousInfo.subCommunity} onFillPress={() => goToFill('religiousInfo')} />
                    <Row label="Caste No Bar" value={profile.religiousInfo.casteNoBar} onFillPress={() => goToFill('religiousInfo')} />
                    <Row label="Gothra" value={profile.religiousInfo.gothra} onFillPress={() => goToFill('religiousInfo')} />
                </View>

                {/* SECTION 4 – FAMILY */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Family Details"
                        icon="home-heart"
                        onEditPress={() => goToEdit('family')}
                    />

                    <Row label="Mother Details" value={profile.family.motherDetails} onFillPress={() => goToFill('family')} />
                    <Row label="Father Details" value={profile.family.fatherDetails} onFillPress={() => goToFill('family')} />
                    <Row label="No. of Sisters" value={profile.family.sisters} onFillPress={() => goToFill('family')} />
                    <Row label="No. of Brothers" value={profile.family.brothers} onFillPress={() => goToFill('family')} />
                    <Row label="Financial Status" value={profile.family.financialStatus} onFillPress={() => goToFill('family')} />
                </View>

                {/* SECTION 5 – ASTRO DETAILS */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Astro Details"
                        icon="zodiac-leo"
                        onEditPress={() => goToEdit('astro')}
                    />

                    <Row label="Manglik" value={profile.astro.manglik} onFillPress={() => goToEdit('astro')} />
                    <Row label="Date of Birth" value={profile.astro.dateOfBirth} onFillPress={() => goToEdit('astro')} />
                    <Row label="Time of Birth" value={profile.astro.timeOfBirth} onFillPress={() => goToEdit('astro')} />
                    <Row label="City of Birth" value={profile.astro.cityOfBirth} onFillPress={() => goToEdit('astro')} />
                    <Row label="Raashi" value={profile.astro.raashi} onFillPress={() => goToEdit('astro')} />
                    <Row label="Nakshatra" value={profile.astro.nakshatra} onFillPress={() => goToEdit('astro')} />
                </View>

                {/* SECTION 6 – LOCATION & CAREER */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Location & Career"
                        icon="briefcase-account"
                        onEditPress={() => goToEdit('locationEducationCareer')}
                    />

                    <Row label="Country" value={profile.locationEducationCareer.country} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="State" value={profile.locationEducationCareer.state} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="City" value={profile.locationEducationCareer.city} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Residency" value={profile.locationEducationCareer.residencyStatus} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Pin Code" value={profile.locationEducationCareer.pinCode} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Grew Up In" value={profile.locationEducationCareer.grewUpIn} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Highest Degree" value={profile.locationEducationCareer.highestQualification} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="College" value={profile.locationEducationCareer.college} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Working With" value={profile.locationEducationCareer.workingWith} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Profession" value={profile.locationEducationCareer.workingAs} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Annual Income" value={profile.locationEducationCareer.annualIncome} onFillPress={() => goToFill('locationEducationCareer')} />
                    <Row label="Employer" value={profile.locationEducationCareer.employerName} onFillPress={() => goToFill('locationEducationCareer')} />
                </View>

                {/* SECTION 7 – LIFESTYLE */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Lifestyle"
                        icon="glass-wine"
                        onEditPress={() => goToEdit('lifestyle')}
                    />
                    <Row label="Diet" value={profile.lifestyle.diet} onFillPress={() => goToFill('lifestyle')} />
                </View>

                {/* SECTION 8 – HOBBIES */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Hobbies"
                        icon="palette"
                        onEditPress={() => goToEdit('hobbies')}
                    />

                    <View style={styles.hobbyContainer}>
                        {profile.hobbies.map((item, i) => (
                            <LinearGradient
                                key={i}
                                colors={['#fff', '#f9f9f9']}
                                style={styles.hobbyPill}
                            >
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={16}
                                    color={COLORS.primary}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={styles.hobbyLabel}>{item.name}</Text>
                            </LinearGradient>
                        ))}
                        {profile.hobbies.length === 0 && (
                            <Text style={styles.noDataText}>No hobbies added yet.</Text>
                        )}
                    </View>
                </View>

                {/* 🔹 PARTNER PREFERENCES SECTION HEADER */}
                <Text style={styles.bigSectionHeader}>Partner Preferences</Text>

                {/* SECTION 9 – Partner Basic Info */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Partner Basics"
                        icon="account-heart"
                        onEditPress={() => goToEdit('partnerBasicInfo')}
                    />

                    <Row label="Age Range" value={profile.partnerBasicInfo.age} onFillPress={() => goToFill('partnerBasicInfo')} />
                    <Row label="Height" value={profile.partnerBasicInfo.height} onFillPress={() => goToFill('partnerBasicInfo')} />
                    <Row label="Marital Status" value={profile.partnerBasicInfo.maritalStatus} onFillPress={() => goToFill('partnerBasicInfo')} />
                    <Row label="Children" value={profile.partnerBasicInfo.children} onFillPress={() => goToFill('partnerBasicInfo')} />
                    <Row label="Religion" value={profile.partnerBasicInfo.religionCommunity} onFillPress={() => goToFill('partnerBasicInfo')} />
                    <Row label="Community" value={profile.partnerBasicInfo.community} onFillPress={() => goToFill('partnerBasicInfo')} />
                    <Row label="Mother Tongue" value={profile.partnerBasicInfo.motherTongue} onFillPress={() => goToFill('partnerBasicInfo')} />
                </View>

                {/* SECTION 10 – Partner Location Details */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Partner Location"
                        icon="map-marker-radius"
                        onEditPress={() => goToEdit('partnerLocationDetails')}
                    />

                    <Row label="Country" value={profile.partnerLocationDetails.country} onFillPress={() => goToFill('partnerLocationDetails')} />
                    <Row label="State" value={profile.partnerLocationDetails.state} onFillPress={() => goToFill('partnerLocationDetails')} />
                    <Row label="City" value={profile.partnerLocationDetails.city} onFillPress={() => goToFill('partnerLocationDetails')} />
                </View>

                {/* SECTION 11 – Partner Education & Career */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Partner Career"
                        icon="school"
                        onEditPress={() => goToEdit('partnerEducationCareer')}
                    />

                    <Row label="Qualification" value={profile.partnerEducationCareer.qualification} onFillPress={() => goToFill('partnerEducationCareer')} />
                    <Row label="Working With" value={profile.partnerEducationCareer.workingWith} onFillPress={() => goToFill('partnerEducationCareer')} />
                    <Row label="Profession" value={profile.partnerEducationCareer.professionArea} onFillPress={() => goToFill('partnerEducationCareer')} />
                    <Row label="Working As" value={profile.partnerEducationCareer.workingAs} onFillPress={() => goToFill('partnerEducationCareer')} />
                    <Row label="Income" value={profile.partnerEducationCareer.annualIncome} onFillPress={() => goToFill('partnerEducationCareer')} />
                </View>

                {/* SECTION 12 – Partner Other Details */}
                <View style={styles.card}>
                    <SectionHeader
                        title="Other Details"
                        icon="dots-horizontal-circle"
                        onEditPress={() => goToEdit('partnerOtherDetails')}
                    />

                    <Row label="Profile Managed By" value={profile.partnerOtherDetails.profileManagedBy} onFillPress={() => goToFill('partnerOtherDetails')} />
                    <Row label="Diet" value={profile.partnerOtherDetails.diet} onFillPress={() => goToFill('partnerOtherDetails')} />
                </View>

            </ScrollView>
        </View>
    );
}

/* ===================== MODERN STYLES ===================== */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FB" },



    // Profile Top Section
    // Profile Top Section (FUTURISTIC)
    profileCardContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 16
    },
    imageSliderContainer: {
        width: '100%',
        height: 500, // Increased height to prevent image cropping
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: '#fff',
    },
    slider: {
        width: '100%',
        height: '100%',
    },
    imageContainer: {
        width: width - 32, // container margin horizontal * 2
        height: '100%',
    },
    sliderImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    primaryBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },
    primaryText: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: FONTS.RobotoMedium,
        marginLeft: 4,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 150, // tall enough for blending
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15, 
    },
    nameText: {
        color: '#FFF',
        fontSize: 22,
        fontFamily: FONTS.RobotoBold,
        marginRight: 8,
    },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
    },
    idText: {
        color: '#EEE',
        fontSize: 13,
        fontFamily: FONTS.RobotoRegular,
        marginTop: 2,
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    membershipText: {
        color: '#FFD700',
        fontSize: 13,
        fontFamily: FONTS.RobotoBold,
        marginLeft: 4,
    },
    editFloatButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    // CARDS
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 }
    },
    cardTitle: {
        fontSize: 16,
        color: '#222',
        fontFamily: FONTS.RobotoBold,
        letterSpacing: 0.3
    },
    editBtn: {

    },
    editGradient: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ROWS
    row: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    key: {
        fontSize: 14,
        color: "#666",
        flex: 1,
        fontFamily: FONTS.RobotoRegular
    },
    value: {
        fontSize: 14,
        color: "#111",
        flex: 1,
        textAlign: 'right',
        fontFamily: FONTS.RobotoMedium
    },

    // FILL NOW BUTTON
    fillNowContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    fillNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fillNowText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: FONTS.RobotoBold,
        textTransform: 'uppercase',
        marginRight: 4
    },

    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 22,
        fontFamily: FONTS.RobotoRegular
    },

    // HOBBIES
    hobbyContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 5,
    },
    hobbyPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    hobbyLabel: {
        fontFamily: FONTS.RobotoMedium,
        fontSize: 13,
        color: '#444'
    },
    noDataText: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic'
    },

    // BIG HEADER
    bigSectionHeader: {
        marginTop: 30,
        marginLeft: 20,
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        color: '#222',
        marginBottom: 5,
        letterSpacing: 0.5
    }
});
