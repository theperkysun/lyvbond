import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Platform,
    Image,
} from "react-native";
import Header from "../../components/CommonComponents/Header";
import { COLORS, FONTS } from "../../../utlis/comon";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomCard from "../../screens/HobbiesInterest/CustomCard";
import AstroEditPopup from "../Astro Pop up/AstroEditPopup"; // Import Popup
import { launchImageLibrary } from "react-native-image-picker";
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';
import { ActivityIndicator, Alert } from "react-native";
import { COMMUNITIES, SUB_COMMUNITIES, GOTHRAS } from '../../../utils/religiousData';

const SECTION_TITLES = {
    profileHeader: "Edit Profile Header",
    basicInfo: "Edit Basic Info",
    religiousInfo: "Edit Religious Background",
    family: "Edit Family Details",
    locationEducationCareer: "Edit Location, Education & Career",
    lifestyle: "Edit Lifestyle",
    hobbies: "Edit Hobbies & Interests",
    partnerBasicInfo: "Edit Partner Basic Info",
    partnerLocationDetails: "Edit Partner Location Details",
    partnerEducationCareer: "Edit Partner Education & Career",
    partnerOtherDetails: "Edit Partner Other Details",
    aboutMyself: "Edit About Myself",
    astro: "Edit Astro Details",
};

/**
 * 🔥 ALL SELECT OPTIONS
 * Keys here MUST match what you pass to select("Label", "key")
 * in the RENDER sections below.
 */
const OPTIONS = {
    // BASIC
    postedBy: ["Self", "Sibling", "Friend", "Parent", "Other"],
    age: [
        "Open for all",
        "18 - 21",
        "22 - 25",
        "26 - 30",
        "31 - 35",
        "36 - 40",
        "41+",
    ],
    height: [
        "Open for all",
        "Below 5'0\"",
        "5'0\" - 5'3\"",
        "5'4\" - 5'7\"",
        "5'8\" - 5'11\"",
        "6'0\" and above",
    ],
    maritalStatus: [
        "Open for all",
        "Single",
        "Married",
        "Divorced",
        "Widowed",
    ],
    anyDisability: ["No", "Partial", "Complete", "Open for all"],

    // RELIGIOUS
    religion: [
        "Open for all",
        "Hindu",
        "Muslim",
        "Christian",
        "Sikh",
        "Jain",
        "Buddhist",
    ],
    motherTongue: [
        "Open for all",
        "Hindi",
        "Bengali",
        "English",
        "Gujarati",
        "Tamil",
    ],
    community: ["Open for all", "General", "OBC", "SC", "ST", "Other"],
    casteNoBar: ["Yes", "No", "Open for all"],

    // FAMILY
    motherDetails: [
        "Homemaker",
        "Service - Government",
        "Service - Private",
        "Business",
        "Retired",
        "Passed Away",
        "Other",
    ],
    fatherDetails: [
        "Service - Government",
        "Service - Private",
        "Business",
        "Retired",
        "Passed Away",
        "Other",
    ],
    sisters: ["0", "1", "2", "3", "4+", "Open for all"],
    brothers: ["0", "1", "2", "3", "4+", "Open for all"],
    financialStatus: [
        "Lower",
        "Middle",
        "Upper Middle",
        "Well-Off",
        "Affluent",
        "Open for all",
    ],

    // LOCATION / EDUCATION / CAREER
    country: [
        "Open for all",
        "India",
        "USA",
        "UK",
        "Canada",
        "Australia",
        "UAE",
        "Other",
    ],
    state: [
        "Open for all",
        "West Bengal",
        "Maharashtra",
        "Delhi / NCR",
        "Karnataka",
        "Tamil Nadu",
        "Uttar Pradesh",
        "Gujarat",
        "Rajasthan",
        "Punjab",
        "Other",
    ],
    grewUpIn: ["India", "Abroad", "Open for all"],
    residencyStatus: ["Citizen", "Permanent Resident", "Work Permit", "Student Visa", "Temporary Visa", "Other"], // Added Missing Option

    highestQualification: [
        "Less than Graduate",
        "Graduate",
        "Post Graduate",
        "Doctorate",
        "Professional Degree",
        "Diploma",
        "Open for all",
    ],
    qualification: [
        // used in partnerEducationCareer
        "Less than Graduate",
        "Graduate",
        "Post Graduate",
        "Doctorate",
        "Professional Degree",
        "Diploma",
        "Open for all",
    ],

    workingWith: [
        "Government",
        "Private",
        "Business",
        "Self-employed",
        "Not Working",
        "Other",
        "Open for all",
    ],
    professionArea: [
        "IT",
        "Finance",
        "Medical",
        "Education",
        "Business",
        "Engineering",
        "Other",
        "Open for all",
    ],
    workingAs: [
        "Software Professional",
        "Engineer",
        "Doctor",
        "Teacher",
        "Business Owner",
        "CA / Finance Professional",
        "Not Working",
        "Other",
        "Open for all",
    ],
    annualIncome: [
        "Open for all",
        "Up to ₹2,50,000",
        "₹2,50,001 – ₹5,00,000",
        "₹5,00,001 – ₹7,50,000",
        "₹7,50,001 – ₹10,00,000",
        "₹10,00,001 – ₹15,00,000",
        "₹15,00,001 – ₹20,00,000",
        "₹20,00,001 – ₹30,00,000",
        "₹30,00,001 – ₹50,00,000",
        "₹50,00,001 and above",
    ],

    // PARTNER
    religionCommunity: [
        "Open for all",
        "Hindu - General",
        "Hindu - Brahmin",
        "Hindu - Kshatriya",
        "Muslim - Sunni",
        "Muslim - Shia",
        "Christian - Catholic",
        "Christian - Protestant",
        "Other",
    ],
    profileManagedBy: ["Self", "Parents", "Sibling", "Relative", "Friend", "Other"],
    children: ["No", "Yes, living together", "Yes, not living together", "Open for all"], // Added Missing Option

    // LIFESTYLE
    diet: [
        "Open for all",
        "Veg",
        "Non-veg",
        "Egg",
        "Vegan",
        "Occasionally Non-veg",
    ],

    // ASTRO
    manglik: ["Yes", "No", "Doesn't Matter", "Open for all"],
};

export default function EditProfile({ route, navigation }) {
    const { section, profile } = route.params;
    const { userToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState(() => {
        if (section === 'profileHeader') {
            const initialImages = [];

            // Extract properly formatted string URI for primary image
            if (profile.profileImage) {
                if (typeof profile.profileImage === 'string') {
                    initialImages.push(profile.profileImage);
                } else if (typeof profile.profileImage === 'object' && profile.profileImage.uri) {
                    initialImages.push(profile.profileImage.uri);
                } else {
                    // Fallback for placeholder image (local require number)
                    initialImages.push(null);
                }
            } else {
                initialImages.push(null);
            }

            // Extract properly formatted string URIs for secondary images
            if (profile.images && Array.isArray(profile.images)) {
                profile.images.forEach(img => {
                    if (typeof img === 'string') initialImages.push(img);
                    else if (typeof img === 'object' && img.uri) initialImages.push(img.uri);
                });
            }

            return {
                fullName: profile.fullName,
                useid: profile.useid,
                images: initialImages
            };
        }
        if (section === 'family' && profile.family) {
            return {
                ...profile.family,
                sisters: profile.family.sistersCount,
                brothers: profile.family.brothersCount
            };
        }
        if (section === 'basicInfo') {
            return {
                ...profile[section],
                dob: profile.dob, // Pull DOB from root
                // Calculate initial age if dob exists
                age: profile.dob?.year ? (new Date().getFullYear() - parseInt(profile.dob.year)).toString() : ""
            };
        }
        return profile[section] || {};
    });
    const [showPicker, setShowPicker] = useState(false);
    const [pickerField, setPickerField] = useState(null);
    const [showAstroPopup, setShowAstroPopup] = useState(false); // Astro Logic
    const [primaryImagePopup, setPrimaryImagePopup] = useState({ visible: false, index: null }); // Make Primary Logic
    const [successPopup, setSuccessPopup] = useState(false); // Update Success Logic

    // DOB
    const [showDOB, setShowDOB] = useState(false);
    const onDOBChange = (e, d) => {
        setShowDOB(false);
        if (d) {
            const year = d.getFullYear().toString();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const currentYear = new Date().getFullYear();
            const age = (currentYear - parseInt(year)).toString();

            setForm({
                ...form,
                // Store as object for backend consistency
                dob: { day, month, year },
                // Also update age
                age: age
            });
        }
    };

    // Hobbies
    const [selectedHobbies, setSelectedHobbies] = useState([]);

    useEffect(() => {
        if (section === "hobbies") {
            setSelectedHobbies(profile.hobbies.map((h) => h.name));
        }
    }, []);

    const toggleHobby = (name) => {
        setSelectedHobbies((prev) => {
            if (prev.includes(name)) {
                return prev.filter((n) => n !== name);
            } else {
                if (prev.length >= 5) {
                    Alert.alert("Limit Reached", "You can only select up to 5 hobbies.");
                    return prev;
                }
                return [...prev, name];
            }
        });
    };

    const openPicker = (key) => {
        setPickerField(key);
        setShowPicker(true);
    };

    // Full hobbies data (from your HobbiesInterest screen)
    const hobbyOptions = {
        creative: [
            { name: "Writing", icon: "pencil" },
            { name: "Cooking", icon: "silverware-fork-knife" },
            { name: "Singing", icon: "microphone" },
            { name: "Photography", icon: "camera" },
            { name: "Playing instruments", icon: "guitar-acoustic" },
            { name: "Painting", icon: "brush" },
            { name: "DIY Crafts", icon: "scissors-cutting" },
            { name: "Calligraphy", icon: "pen" },
            { name: "Acting", icon: "drama-masks" },
            { name: "Dance", icon: "dance-ballroom" },
            { name: "Designing", icon: "palette" },
        ],
        fun: [
            { name: "Movies", icon: "filmstrip" },
            { name: "Music", icon: "music" },
            { name: "Travelling", icon: "airplane" },
            { name: "Reading", icon: "book-open" },
            { name: "Sports", icon: "basketball" },
            { name: "Social media", icon: "account-group" },
            { name: "Gaming", icon: "gamepad-variant" },
            { name: "Nightlife", icon: "glass-cocktail" },
            { name: "Shopping", icon: "shopping" },
            { name: "Comedy", icon: "emoticon-happy" },
        ],
        fitness: [
            { name: "Running", icon: "run" },
            { name: "Cycling", icon: "bike" },
            { name: "Yoga", icon: "yoga" },
            { name: "Meditation", icon: "meditation" },
            { name: "Walking", icon: "walk" },
            { name: "Workout", icon: "weight-lifter" },
            { name: "Trekking", icon: "hiking" },
            { name: "Gym", icon: "dumbbell" },
        ],
        others: [
            { name: "Pets", icon: "dog" },
            { name: "Foodie", icon: "food" },
            { name: "Vegan", icon: "leaf" },
            { name: "News & Politics", icon: "newspaper" },
            { name: "Social Service", icon: "handshake" },
            { name: "Entrepreneurship", icon: "briefcase" },
            { name: "Home Decor", icon: "sofa" },
            { name: "Technology", icon: "laptop" },
            { name: "Crypto", icon: "bitcoin" },
            { name: "Cars", icon: "car" },
            { name: "Fashion", icon: "tshirt-crew" },
        ],
    };

    const input = (label, key) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={form?.[key] ?? ""}
                onChangeText={(t) => setForm({ ...form, [key]: t })}
            />
        </View>
    );

    const select = (label, key) => (
        <TouchableOpacity style={styles.row} onPress={() => openPicker(key)}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.selector}>
                <Text>{form?.[key] || "Select"}</Text>
                <Icon name="chevron-down" size={18} />
            </View>
        </TouchableOpacity>
    );

    // ========================= RENDER BY SECTION =========================
    const RENDER = {
        profileHeader: (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
                {/* Modern Card Container */}
                <View style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 24,
                    padding: 24,
                    alignItems: 'center',
                    elevation: 5,
                    shadowColor: COLORS.primary,
                    shadowOpacity: 0.1,
                    shadowRadius: 15,
                    shadowOffset: { width: 0, height: 8 },
                    position: 'relative',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#f0f0f0'
                }}>
                    {/* Decorative Background Elements */}
                    <View style={{
                        position: 'absolute',
                        top: -40,
                        left: -40,
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: COLORS.primary + '10'
                    }} />
                    <View style={{
                        position: 'absolute',
                        bottom: -30,
                        right: -30,
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: '#FF8E5315'
                    }} />

                    {/* Manage Your Photos UI */}
                    <Text style={[styles.label, { marginBottom: 15, alignSelf: 'flex-start', fontSize: 16 }]}>Manage Your Photos</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                        {Array.from({ length: 6 }).map((_, index) => {
                            const hasImage = form?.images && !!form.images[index];
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        width: "31%",
                                        aspectRatio: 0.75,
                                        backgroundColor: "#F4F6F8",
                                        borderRadius: 12,
                                        marginBottom: 15,
                                        borderWidth: hasImage ? 0 : 2,
                                        borderStyle: hasImage ? "solid" : "dashed",
                                        borderColor: "#E0E0E0",
                                        overflow: "hidden",
                                        position: "relative",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    onPress={() => {
                                        if (hasImage && index === 0) return; // Prevent clicking entire primary area if has image
                                        if (hasImage) return; // Allow remove button instead for secondary
                                        const remainingSlots = 6 - (form?.images?.length || 0);
                                        if (remainingSlots <= 0) return;
                                        launchImageLibrary(
                                            { mediaType: "photo", selectionLimit: index === 0 ? 1 : remainingSlots, quality: 0.8 },
                                            (res) => {
                                                if (!res.didCancel && res.assets?.length > 0) {
                                                    const newUris = res.assets.map((a) => a.uri);
                                                    const currentImages = form.images || [];
                                                    if (index === 0) {
                                                        const newImages = [...currentImages];
                                                        newImages[0] = newUris[0];
                                                        setForm({ ...form, images: newImages });
                                                    } else {
                                                        const newImages = [...currentImages, ...newUris].slice(0, 6);
                                                        setForm({ ...form, images: newImages });
                                                    }
                                                }
                                            }
                                        );
                                    }}
                                    onLongPress={() => {
                                        if (hasImage && index !== 0) {
                                            setPrimaryImagePopup({ visible: true, index });
                                        }
                                    }}
                                    delayLongPress={300}
                                    activeOpacity={hasImage ? 1 : 0.7}
                                >
                                    {hasImage ? (
                                        <>
                                            <Image source={{ uri: form.images[index] }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
                                            {index === 0 ? (
                                                <>
                                                    <View style={{ position: "absolute", bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderTopRightRadius: 8 }}>
                                                        <Text style={{ color: "#FFF", fontSize: 10, fontFamily: FONTS.RobotoMedium }}>Primary</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={{ position: "absolute", top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" }}
                                                        onPress={() => {
                                                            launchImageLibrary({ mediaType: "photo", selectionLimit: 1, quality: 0.8 }, (res) => {
                                                                if (!res.didCancel && res.assets?.length > 0) {
                                                                    const newImages = [...(form.images || [])];
                                                                    newImages[0] = res.assets[0].uri;
                                                                    setForm({ ...form, images: newImages });
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <TouchableOpacity
                                                    style={{ position: "absolute", top: 5, right: 5, backgroundColor: COLORS.primary, borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center", zIndex: 10 }}
                                                    onPress={() => {
                                                        const updatedImages = form.images.filter((_, i) => i !== index);
                                                        setForm({ ...form, images: updatedImages });
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="close" size={16} color="white" />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    ) : (
                                        <MaterialCommunityIcons name="plus" size={30} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Name Input Field */}
                    <View style={{ width: '100%', marginBottom: 15 }}>
                        <Text style={[styles.label, { marginLeft: 4, color: '#666' }]}>Display Name</Text>
                        <TextInput
                            style={{
                                fontSize: 18,
                                fontFamily: FONTS.RobotoBold,
                                color: '#222',
                                borderBottomWidth: 1,
                                borderBottomColor: '#ddd',
                                paddingVertical: 8,
                                paddingHorizontal: 4
                            }}
                            value={form?.fullName ?? ""}
                            onChangeText={(t) => setForm({ ...form, fullName: t })}
                            placeholder="Enter your name"
                            placeholderTextColor="#ccc"
                        />
                    </View>

                    {/* User ID (Read Only) */}
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12 }}>
                        <Icon name="id-card-outline" size={18} color="#888" style={{ marginRight: 10 }} />
                        <View>
                            <Text style={{ fontSize: 11, color: '#888', fontFamily: FONTS.RobotoMedium }}>LYVBOND ID</Text>
                            <Text style={{ fontSize: 14, color: '#444', fontFamily: FONTS.RobotoBold, letterSpacing: 0.5 }}>{form.useid}</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                        <Icon name="lock-closed" size={14} color="#ccc" />
                    </View>
                </View>
            </View>
        ),

        basicInfo: (
            <>
                {select("Posted By", "postedBy")}

                {/* DOB Picker */}
                <TouchableOpacity style={styles.row} onPress={() => setShowDOB(true)}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <View style={styles.selector}>
                        <Text>{form?.dob && typeof form.dob === 'object' ? `${form.dob.day}/${form.dob.month}/${form.dob.year}` : form.dateOfBirth || "Select DOB"}</Text>
                        <Icon name="calendar" size={18} />
                    </View>
                </TouchableOpacity>

                {/* Read Only Age */}
                <View style={[styles.row, { opacity: 0.7 }]}>
                    <Text style={styles.label}>Age (Auto-calculated)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#f0f0f0', color: '#555' }]}
                        value={form?.age ? `${form.age} Years` : "N/A"}
                        editable={false}
                    />
                </View>

                {select("Marital Status", "maritalStatus")}
                {select("Height", "height")}
                {select("Any Disability", "anyDisability")}
                {input("Health Info", "healthInfo")}
            </>
        ),

        religiousInfo: (
            <>
                {select("Religion", "religion")}
                {select("Mother Tongue", "motherTongue")}
                {select("Community", "community")}
                {select("Sub-community", "subCommunity")}
                {select("Caste No Bar", "casteNoBar")}
                {select("Gothra / Gothram", "gothra")}
            </>
        ),

        family: (
            <>
                {select("Mother's Details", "motherDetails")}
                {select("Father's Details", "fatherDetails")}
                {select("No. of Sisters", "sisters")}
                {select("No. of Brothers", "brothers")}
                {select("Family Financial Status", "financialStatus")}
            </>
        ),

        locationEducationCareer: (
            <>
                {select("Country", "country")}
                {select("State", "state")}
                {input("City", "city")}
                {input("PIN Code", "pinCode")}
                {select("Grew Up In", "grewUpIn")}
                {select("Residency Status", "residencyStatus")}
                {select("Highest Qualification", "highestQualification")}
                {input("College", "college")}
                {select("Working With", "workingWith")}
                {select("Profession Area", "professionArea")}
                {select("Working As", "workingAs")}
                {select("Annual Income", "annualIncome")}
                {input("Employer Name", "employerName")}
            </>
        ),

        lifestyle: <>{select("Diet", "diet")}</>,

        hobbies: (
            <View>
                <CustomCard
                    title="Creative"
                    data={hobbyOptions.creative}
                    selected={selectedHobbies}
                    onSelect={toggleHobby}
                />
                <CustomCard
                    title="Fun"
                    data={hobbyOptions.fun}
                    selected={selectedHobbies}
                    onSelect={toggleHobby}
                />
                <CustomCard
                    title="Fitness"
                    data={hobbyOptions.fitness}
                    selected={selectedHobbies}
                    onSelect={toggleHobby}
                />
                <CustomCard
                    title="Other Interests"
                    data={hobbyOptions.others}
                    selected={selectedHobbies}
                    onSelect={toggleHobby}
                />
                <View style={{ height: 80 }} />
            </View>
        ),

        partnerBasicInfo: (
            <>
                {select("Age", "age")}
                {select("Height", "height")}
                {select("Marital Status", "maritalStatus")}
                {select("Children", "children")}
                {select("Religion / Community", "religionCommunity")}
                {select("Community", "community")}
                {select("Mother Tongue", "motherTongue")}
            </>
        ),

        partnerLocationDetails: (
            <>
                {select("Preferred Country", "country")}
                {select("Preferred State", "state")}
                {input("Preferred City", "city")}
            </>
        ),

        partnerEducationCareer: (
            <>
                {select("Qualification", "qualification")}
                {select("Working With", "workingWith")}
                {select("Profession Area", "professionArea")}
                {select("Working As", "workingAs")}
                {select("Annual Income", "annualIncome")}
            </>
        ),

        partnerOtherDetails: (
            <>
                {select("Profile Managed By", "profileManagedBy")}
                {select("Diet", "diet")}
            </>
        ),

        astro: (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <MaterialCommunityIcons name="zodiac-leo" size={60} color={COLORS.primary} />
                <Text style={{ fontSize: 18, fontFamily: FONTS.RobotoBold, marginVertical: 10, color: '#333' }}>
                    Edit Astro Details
                </Text>
                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20, paddingHorizontal: 20 }}>
                    Use our wizard to accurately set your birth time, place, and other astrological details.
                </Text>

                {/* Summary if data exists */}
                {form?.manglik && (
                    <View style={{ width: '100%', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 20 }}>
                        <Text style={{ color: '#444' }}>Manglik: <Text style={{ fontFamily: FONTS.RobotoBold }}>{form.manglik}</Text></Text>
                        <Text style={{ color: '#444' }}>Time: <Text style={{ fontFamily: FONTS.RobotoBold }}>{form.timeOfBirth || 'N/A'}</Text></Text>
                        <Text style={{ color: '#444' }}>City: <Text style={{ fontFamily: FONTS.RobotoBold }}>{form.cityOfBirth || 'N/A'}</Text></Text>
                    </View>
                )}

                <TouchableOpacity
                    style={{
                        backgroundColor: COLORS.primary,
                        paddingHorizontal: 30,
                        paddingVertical: 12,
                        borderRadius: 25,
                        elevation: 3
                    }}
                    onPress={() => setShowAstroPopup(true)}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: FONTS.RobotoBold }}>Open Astro Wizard</Text>
                </TouchableOpacity>
            </View>
        ),

        aboutMyself: (
            <View style={styles.textAreaBox}>
                <Text style={styles.label}>Write About Yourself</Text>
                <TextInput
                    multiline
                    numberOfLines={5}
                    placeholder="Write here..."
                    style={styles.textArea}
                    value={form}
                    onChangeText={(t) => setForm(t)}
                />
            </View>
        ),
    };

    // ========================= SAVE =========================
    const SAVE = async () => {
        setLoading(true);
        try {
            let payload = {};
            let isFormData = false;
            let formData = new FormData();

            // MAPPING LOGIC
            switch (section) {
                case 'profileHeader':
                    if (form.fullName) formData.append('name', form.fullName);

                    if (form.images && form.images.length > 0) {
                        const primaryImageUri = form.images[0];
                        if (primaryImageUri && !primaryImageUri.startsWith('http')) {
                            formData.append("profileImage", {
                                uri: primaryImageUri,
                                type: 'image/jpeg',
                                name: 'primary.jpg'
                            });
                        } else if (primaryImageUri && primaryImageUri.startsWith('http')) {
                            formData.append("profileImage", primaryImageUri);
                        }

                        const secondaryUris = form.images.slice(1);
                        const existingSecondaryUrls = [];

                        secondaryUris.forEach((uri, idx) => {
                            if (uri && !uri.startsWith('http')) {
                                formData.append("images", {
                                    uri: uri,
                                    type: 'image/jpeg',
                                    name: `secondary_${idx}.jpg`
                                });
                            } else if (uri && uri.startsWith('http')) {
                                existingSecondaryUrls.push(uri);
                            }
                        });

                        // Append as JSON string so backend parses into array of kept existing urls
                        formData.append("images", JSON.stringify(existingSecondaryUrls));
                    } else if (form.images && form.images.length === 0) {
                        // User deleted all images (if possible, though 1 primary might be required)
                        formData.append("images", JSON.stringify([]));
                    }

                    isFormData = true;
                    payload = formData;
                    break;

                case 'basicInfo':
                    if (form.postedBy) payload.profileFor = form.postedBy;
                    // Add DOB to payload (root level in DB)
                    if (form.dob) payload.dob = form.dob;

                    payload.preferences = {
                        maritalStatus: form.maritalStatus,
                        height: form.height
                        // age is likely calculated or handled by ageRange
                    };
                    payload.basicInfo = {
                        anyDisability: form.anyDisability,
                        healthInfo: form.healthInfo
                    };
                    break;

                case 'religiousInfo':
                    payload.partnerPreferences = {
                        religion: form.religion ? [form.religion] : [],
                        motherTongue: form.motherTongue ? [form.motherTongue] : []
                    };
                    payload.location = { subcommunity: form.community };
                    payload.religiousInfo = {
                        subCommunity: form.subCommunity,
                        gothra: form.gothra
                    };
                    // Map casteNoBar "Yes"/"No" to boolean
                    payload.preferences = { noCasteBar: form.casteNoBar === 'Yes' };
                    break;

                case 'family':
                    payload.family = {
                        motherDetails: form.motherDetails,
                        fatherDetails: form.fatherDetails,
                        sistersCount: form.sisters, // Map from UI 'sisters' to DB 'sistersCount'
                        brothersCount: form.brothers, // Map from UI 'brothers' to DB 'brothersCount'
                        financialStatus: form.financialStatus,
                        liveWithFamily: form.liveWithFamily !== undefined ? form.liveWithFamily : "null"
                    };
                    break;

                case 'astro':
                    // Send flat object for dedicated astro endpoint
                    Object.assign(payload, form);
                    // Ensure cityOfBirth is set if placeOfBirth is used
                    if (form.placeOfBirth) payload.cityOfBirth = form.placeOfBirth;
                    break;

                case 'locationEducationCareer':
                    payload.location = {
                        country: form.country,
                        state: form.state,
                        city: form.city,
                        pinCode: form.pinCode,
                        grewUpIn: form.grewUpIn,
                        residencyStatus: form.residencyStatus
                        // Maintain existing subcommunity if not editing it here? 
                        // Backend update helper merges objects, so it should be fine.
                    };
                    payload.education = {
                        qualification: form.highestQualification,
                        college: form.college,
                        workType: form.workingWith,
                        profession: form.workingAs,
                        income: form.annualIncome,
                        organization: form.employerName
                    };
                    break;

                case 'lifestyle':
                    payload.preferences = { diet: form.diet };
                    break;

                case 'hobbies':
                    // Map selectedHobbies (array of strings) to preferences.hobbies
                    payload.preferences = { hobbies: selectedHobbies };
                    break;

                case 'aboutMyself':
                    payload.about = form; // Form is string here
                    break;

                // Partner Sections - Simplification: send all as partnerPreferences arrays
                case 'partnerBasicInfo':
                case 'partnerLocationDetails':
                case 'partnerEducationCareer':
                case 'partnerOtherDetails':
                    const pp = {};
                    // Map known keys
                    if (form.religionCommunity) pp.religion = [form.religionCommunity];
                    if (form.community) pp.community = [form.community];
                    if (form.motherTongue) pp.motherTongue = [form.motherTongue];
                    if (form.country) pp.country = [form.country];
                    if (form.state) pp.state = [form.state];
                    if (form.city) pp.city = [form.city];
                    if (form.qualification) pp.qualification = [form.qualification];
                    if (form.workingWith) pp.workingWith = [form.workingWith];
                    if (form.professionArea) pp.profession = [form.professionArea];
                    if (form.workingAs) pp.workingAs = [form.workingAs];
                    if (form.annualIncome) pp.income = [form.annualIncome];
                    if (form.profileManagedBy) pp.profileManagedBy = [form.profileManagedBy];
                    if (form.diet) pp.diet = [form.diet];

                    // Simple arrays for other selects if they match
                    ['maritalStatus', 'children'].forEach(k => {
                        if (form[k]) pp[k] = [form[k]];
                    });

                    // Age/Height Ranges need parsing if string.
                    // PARSE AGE
                    if (form.age) {
                        if (form.age === "Open for all") {
                            pp.ageRange = [18, 100];
                        } else if (form.age.includes("+")) {
                            const min = parseInt(form.age);
                            pp.ageRange = [min, 100];
                        } else if (form.age.includes("-")) {
                            const parts = form.age.split("-").map(s => parseInt(s.trim()));
                            pp.ageRange = parts;
                        } else {
                            // Single value? unlikely based on options but safe fallback
                            pp.ageRange = [18, 100];
                        }
                    }

                    // SAVE HEIGHT STRING (No Parsing)
                    if (form.height) {
                        pp.heightRange = form.height;
                    }

                    payload.partnerPreferences = pp;
                    break;

                default:
                    // Fallback for direct section mapping
                    payload[section] = form;
            }

            console.log("Updating Profile Payload:", isFormData ? "FormData containing images" : JSON.stringify(payload, null, 2));

            const endpoint = section === 'astro'
                ? `${BASE_URL}/astro/update`
                : `${BASE_URL}/user/update`;

            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            };
            const response = await axios.patch(endpoint, payload, config);

            if (response.data.success) {
                setSuccessPopup(true);
                setTimeout(() => {
                    setSuccessPopup(false);
                    navigation.goBack();
                }, 2000);
            } else {
                Alert.alert("Error", response.data.message || "Failed to update profile");
            }

        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Header
                title={SECTION_TITLES[section]}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
            >
                {RENDER[section]}

                {/* ⬇ Add update button here — after all data fields */}
                <TouchableOpacity style={styles.updateBtn} onPress={SAVE}>
                    <Text style={styles.updateText}>UPDATE</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ==== ASTRO POPUP ==== */}
            <AstroEditPopup
                visible={showAstroPopup}
                onClose={() => setShowAstroPopup(false)}
                initialData={form}
                onSave={(data) => {
                    setForm(prev => ({
                        ...prev,
                        ...data,
                        cityOfBirth: data.placeOfBirth,
                    }));
                }}
            />

            {/* ==== SUCCESS POPUP ==== */}
            <Modal visible={successPopup} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "#fff", width: "80%", borderRadius: 24, padding: 30, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}>
                        <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#E8F5E9", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
                            <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
                        </View>
                        <Text style={{ fontSize: 22, fontFamily: FONTS.RobotoBold, color: "#222", marginBottom: 10, textAlign: "center" }}>
                            Success!
                        </Text>
                        <Text style={{ fontSize: 16, color: "#666", textAlign: "center", fontFamily: FONTS.RobotoMedium, lineHeight: 22 }}>
                            Profile updated successfully!
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* ==== MAKE PRIMARY POPUP ==== */}
            <Modal visible={primaryImagePopup.visible} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "#fff", width: "85%", borderRadius: 24, padding: 30, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 }}>
                        <MaterialCommunityIcons name="star-circle" size={54} color={COLORS.primary} style={{ marginBottom: 15 }} />
                        <Text style={{ fontSize: 22, fontFamily: FONTS.RobotoBold, color: "#222", marginBottom: 12, textAlign: "center" }}>
                            Make Primary Image?
                        </Text>
                        <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 30, fontFamily: FONTS.RobotoMedium, lineHeight: 22 }}>
                            Do you want to set this image as your primary profile picture?
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 14, backgroundColor: "#f0f0f0", borderRadius: 14, marginRight: 10, alignItems: "center" }}
                                onPress={() => setPrimaryImagePopup({ visible: false, index: null })}
                            >
                                <Text style={{ color: "#555", fontFamily: FONTS.RobotoBold, fontSize: 16 }}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 14, backgroundColor: COLORS.primary, borderRadius: 14, marginLeft: 10, alignItems: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
                                onPress={() => {
                                    const imgIndex = primaryImagePopup.index;
                                    if (imgIndex !== null && form?.images?.length > imgIndex) {
                                        const newImages = [...form.images];
                                        const temp = newImages[0];
                                        newImages[0] = newImages[imgIndex];
                                        newImages[imgIndex] = temp;
                                        setForm({ ...form, images: newImages });
                                    }
                                    setPrimaryImagePopup({ visible: false, index: null });
                                }}
                            >
                                <Text style={{ color: "#fff", fontFamily: FONTS.RobotoBold, fontSize: 16 }}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ==== BOTTOM PICKER ==== */}
            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {(() => {
                                let options = OPTIONS[pickerField] || [];
                                if (pickerField === 'community') options = COMMUNITIES;
                                if (pickerField === 'subCommunity') {
                                    options = SUB_COMMUNITIES[form?.community] || ["Others"];
                                }
                                if (pickerField === 'gothra') options = GOTHRAS;

                                // Hide "Open for all" unless it's a partner preference section
                                if (!section.startsWith('partner')) {
                                    options = options.filter(opt => opt !== "Open for all");
                                }

                                return options.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={styles.opt}
                                        onPress={() => {
                                            const updates = { [pickerField]: opt };
                                            // Reset dependents if community changes
                                            if (pickerField === 'community') {
                                                updates.subCommunity = '';
                                                updates.gothra = '';
                                            }
                                            setForm({ ...form, ...updates });
                                            setShowPicker(false);
                                        }}
                                    >
                                        <Text style={styles.optText}>{opt}</Text>
                                    </TouchableOpacity>
                                ));
                            })()}
                        </ScrollView>

                        <TouchableOpacity onPress={() => setShowPicker(false)}>
                            <Text
                                style={[
                                    styles.optText,
                                    { color: "red", marginTop: 8, textAlign: "center" },
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {showDOB && (
                <DateTimePicker
                    value={(() => {
                        if (form?.dob && typeof form.dob === 'object' && form.dob.year) {
                            return new Date(parseInt(form.dob.year), parseInt(form.dob.month) - 1, parseInt(form.dob.day));
                        }
                        if (form?.dateOfBirth) return new Date(form.dateOfBirth);
                        return new Date();
                    })()}
                    mode="date"
                    onChange={onDOBChange}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { marginTop: 12 },
    label: {
        fontSize: 14,
        fontFamily: FONTS.RobotoMedium,
        marginBottom: 4,
        color: "#111",
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        borderColor: "#ccc",
    },
    selector: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        borderColor: "#ccc",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    textAreaBox: { marginTop: 10 },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        borderColor: "#ccc",
        height: 120,
        textAlignVertical: "top",
    },

    updateBtn: {
        backgroundColor: COLORS.primary,
        padding: 15,
        alignItems: "center",
        position: "absolute",
        bottom: 10,
        left: 20,
        right: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    updateText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: FONTS.RobotoMedium,
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    opt: { paddingVertical: 12 },
    optText: { fontSize: 16, color: "#111" },
});
