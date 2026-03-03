import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    Alert,
    ActivityIndicator
} from "react-native";
import Header from "../../components/CommonComponents/Header";
import { COLORS, FONTS } from "../../../utlis/comon";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomCard from "../../screens/HobbiesInterest/CustomCard";
import { launchImageLibrary } from "react-native-image-picker";
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';
import { COMMUNITIES, SUB_COMMUNITIES, GOTHRAS } from '../../../utils/religiousData';

const SECTION_TITLES = {
    profileHeader: "Add Profile Header",
    basicInfo: "Add Basic Info",
    religiousInfo: "Add Religious Background",
    family: "Add Family Details",
    locationEducationCareer: "Add Location, Education & Career",
    lifestyle: "Add Lifestyle",
    hobbies: "Add Hobbies & Interests",
    partnerBasicInfo: "Add Partner Basic Info",
    partnerLocationDetails: "Add Partner Location Details",
    partnerEducationCareer: "Add Partner Education & Career",
    partnerOtherDetails: "Add Partner Other Details",
    aboutMyself: "Add About Myself",
    astro: "Add Astro Details",
};

const OPTIONS = {
    // BASIC
    postedBy: ["Self", "Sibling", "Friend", "Parent", "Other"],
    age: ["Open for all", "18 - 21", "22 - 25", "26 - 30", "31 - 35", "36 - 40", "41+"],
    height: ["Open for all", "Below 5 ft", "5 ft - 5 ft 3 in", "5 ft 4 in - 5 ft 7 in", "5 ft 8 in - 5 ft 11 in", "6 ft and above"],
    maritalStatus: ["Open for all", "Single", "Married", "Divorced", "Widowed"],
    anyDisability: ["No", "Partial", "Complete", "Open for all"],

    // RELIGIOUS
    religion: ["Open for all", "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist"],
    motherTongue: ["Open for all", "Hindi", "Bengali", "English", "Gujarati", "Tamil"],
    community: ["Open for all", "General", "OBC", "SC", "ST", "Other"],
    casteNoBar: ["Yes", "No", "Open for all"],

    // FAMILY
    motherDetails: ["Homemaker", "Service - Government", "Service - Private", "Business", "Retired", "Passed Away", "Other"],
    fatherDetails: ["Service - Government", "Service - Private", "Business", "Retired", "Passed Away", "Other"],
    sisters: ["0", "1", "2", "3", "4+", "Open for all"],
    brothers: ["0", "1", "2", "3", "4+", "Open for all"],
    financialStatus: ["Lower", "Middle", "Upper Middle", "Well-Off", "Affluent", "Open for all"],

    // LOCATION / EDUCATION / CAREER
    country: ["Open for all", "India", "USA", "UK", "Canada", "Australia", "UAE", "Other"],
    state: ["Open for all", "West Bengal", "Maharashtra", "Delhi / NCR", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Rajasthan", "Punjab", "Other"],
    grewUpIn: ["India", "Abroad", "Open for all"],
    residencyStatus: ["Citizen", "Permanent Resident", "Work Permit", "Student Visa", "Temporary Visa", "Other"], // Added Missing Option
    highestQualification: ["Less than Graduate", "Graduate", "Post Graduate", "Doctorate", "Professional Degree", "Diploma", "Open for all"],
    qualification: ["Less than Graduate", "Graduate", "Post Graduate", "Doctorate", "Professional Degree", "Diploma", "Open for all"],
    workingWith: ["Government", "Private", "Business", "Self-employed", "Not Working", "Other", "Open for all"],
    professionArea: ["IT", "Finance", "Medical", "Education", "Business", "Engineering", "Other", "Open for all"],
    workingAs: ["Software Professional", "Engineer", "Doctor", "Teacher", "Business Owner", "CA / Finance Professional", "Not Working", "Other", "Open for all"],
    annualIncome: ["Open for all", "Up to ₹2,50,000", "₹2,50,001 – ₹5,00,000", "₹5,00,001 – ₹7,50,000", "₹7,50,001 – ₹10,00,000", "₹10,00,001 – ₹15,00,000", "₹15,00,001 – ₹20,00,000", "₹20,00,001 – ₹30,00,000", "₹30,00,001 – ₹50,00,000", "₹50,00,001 and above"],

    // PARTNER
    religionCommunity: ["Open for all", "Hindu - General", "Hindu - Brahmin", "Hindu - Kshatriya", "Muslim - Sunni", "Muslim - Shia", "Christian - Catholic", "Christian - Protestant", "Other"],
    profileManagedBy: ["Self", "Parents", "Sibling", "Relative", "Friend", "Other"],
    children: ["No", "Yes, living together", "Yes, not living together", "Open for all"], // Added Missing Option

    // LIFESTYLE
    diet: ["Open for all", "Veg", "Non-veg", "Egg", "Vegan", "Occasionally Non-veg"],

    // ASTRO
    manglik: ["Yes", "No", "Doesn't Matter", "Open for all"],
};

export default function AddProfileData({ route, navigation }) {
    const { section, profile } = route.params;
    const { userToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState(() => {
        if (section === 'profileHeader') {
            return {
                fullName: profile.fullName,
                useid: profile.useid,
                profileImage: profile.profileImage
            };
        }
        return profile[section] || {};
    });

    const [showPicker, setShowPicker] = useState(false);
    const [pickerField, setPickerField] = useState(null);

    // DOB
    const [showDOB, setShowDOB] = useState(false);
    const onDOBChange = (e, d) => {
        setShowDOB(false);
        if (d) setForm({ ...form, dateOfBirth: d.toISOString().split("T")[0] });
    };

    // Time
    const [showTime, setShowTime] = useState(false);
    const onTimeChange = (e, t) => {
        setShowTime(false);
        if (t) {
            const formatted = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setForm({ ...form, timeOfBirth: formatted });
        }
    };

    // Hobbies
    const [selectedHobbies, setSelectedHobbies] = useState([]);

    useEffect(() => {
        if (section === "hobbies") {
            // Pre-fill existing hobbies? Or blank if adding?
            // If user wants to ADD, they should see empty?
            // "those field only show which are not present" -> If hobbies list is not empty, this section might not even be accessible.
            // If it is accessible, show existing + allow adding?
            // Let's assume we show existing and allow adding more.
            setSelectedHobbies(profile.hobbies.map((h) => h.name));
        }
    }, []);

    const toggleHobby = (name) => {
        setSelectedHobbies((prev) =>
            prev.includes(name)
                ? prev.filter((n) => n !== name)
                : [...prev, name]
        );
    };

    const openPicker = (key) => {
        setPickerField(key);
        setShowPicker(true);
    };

    // Full hobbies data
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

    // 🔴 HELPER: Check if field is empty in the ORIGINAL profile data
    // We strictly verify 'profile' from params to decide visibility. 
    // This ensures fields don't disappear while typing.
    const isFilled = (key) => {
        let val;
        if (section === 'profileHeader') {
            if (key === 'fullName') val = profile.fullName;
            else if (key === 'useid') val = profile.useid;
            // image is separate
        } else {
            val = profile[section]?.[key];
        }
        // If data exists, we hide the field (return true).
        // If key is missing or empty, we return false (show field).
        return val && val !== "" && val !== "Select" && val !== "N/A";
    };

    const input = (label, key) => {
        if (isFilled(key)) return null; // Don't show if already filled
        return (
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={styles.input}
                    value={form?.[key] ?? ""}
                    onChangeText={(t) => setForm({ ...form, [key]: t })}
                    placeholder="Enter value"
                />
            </View>
        );
    };

    const select = (label, key) => {
        if (isFilled(key)) return null; // Don't show if already filled
        return (
            <TouchableOpacity style={styles.row} onPress={() => openPicker(key)}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.selector}>
                    <Text>{form?.[key] || "Select"}</Text>
                    <Icon name="chevron-down" size={18} />
                </View>
            </TouchableOpacity>
        );
    };

    // ========================= RENDER BY SECTION =========================
    // We copy RENDER from EditProfile but inputs use our new logic
    const RENDER = {
        profileHeader: (
            <>
                {/* Image always visible if we allow changing? User said "only those field show which are not present" */}
                {/* But if profileImage is present, maybe hide? Let's assume always show for header or skip */}
                {/* Skipping header logic for "Fill Now" usually imply text fields. */}
                {input("Full Name", "fullName")}
                {input("User Id", "useid")}
            </>
        ),

        basicInfo: (
            <>
                {select("Posted By", "postedBy")}
                {select("Age", "age")}
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
            // Always show hobbies picker if they clicked Fill Now? 
            // If they have NO hobbies, we show.
            <View>
                <CustomCard
                    title="Creative"
                    data={hobbyOptions.creative}
                    selected={selectedHobbies}
                    onSelect={toggleHobby}
                />
                <View style={{ height: 80 }} />
                {/* Simplified for AddProfile - assume they want to add */}
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
            <>
                {select("Manglik", "manglik")}
                {(!form.dateOfBirth || form.dateOfBirth === "") && (
                    <TouchableOpacity style={styles.row} onPress={() => setShowDOB(true)}>
                        <Text style={styles.label}>DOB</Text>
                        <View style={styles.selector}>
                            <Text>{form?.dateOfBirth ?? "Select"}</Text>
                            <Icon name="calendar-outline" size={18} />
                        </View>
                    </TouchableOpacity>
                )}

                {!isFilled("timeOfBirth") && (
                    <TouchableOpacity style={styles.row} onPress={() => setShowTime(true)}>
                        <Text style={styles.label}>Birth Time</Text>
                        <View style={styles.selector}>
                            <Text>{form?.timeOfBirth || "Select Time"}</Text>
                            <Icon name="time-outline" size={18} />
                        </View>
                    </TouchableOpacity>
                )}

                {input("Birth City", "cityOfBirth")}
            </>
        ),

        aboutMyself: (
            <View style={styles.textAreaBox}>
                <Text style={styles.label}>Write About Yourself</Text>
                <TextInput
                    multiline
                    numberOfLines={5}
                    placeholder="Write here..."
                    style={styles.textArea}
                    value={typeof form === 'string' ? form : ""}
                    onChangeText={(t) => setForm(t)}
                />
                {/* For strings, logic is simpler */}
            </View>
        ),
    };

    // ========================= SAVE (PATCH API) =========================
    // ========================= SAVE (PATCH API) =========================
    const SAVE = async () => {
        setLoading(true);
        try {
            const payload = {};

            // MAPPING LOGIC - Must match Backend Schema Structure
            switch (section) {
                case 'profileHeader':
                    if (form.fullName) payload.name = form.fullName;
                    if (form.useid) payload.userId = form.useid; // Read only usually, but if allowed
                    break;

                case 'basicInfo':
                    if (form.postedBy) payload.profileFor = form.postedBy;
                    payload.preferences = {
                        maritalStatus: form.maritalStatus,
                        height: form.height
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
                    payload.preferences = { noCasteBar: form.casteNoBar === 'Yes' };
                    break;

                case 'family':
                    payload.family = {
                        motherDetails: form.motherDetails,
                        fatherDetails: form.fatherDetails,
                        sistersCount: form.sisters,
                        brothersCount: form.brothers,
                        financialStatus: form.financialStatus,
                        liveWithFamily: form.liveWithFamily !== undefined ? form.liveWithFamily : "null"
                    };
                    break;

                case 'astro':
                    payload.astro = { ...form };
                    if (form.dateOfBirth) {
                        const [y, m, d] = form.dateOfBirth.split('-');
                        payload.dob = { day: d, month: m, year: y };
                    }
                    break;

                case 'locationEducationCareer':
                    // This section maps to MULTIPLE backend objects: location AND education
                    payload.location = {
                        country: form.country,
                        state: form.state,
                        city: form.city,
                        pinCode: form.pinCode,
                        grewUpIn: form.grewUpIn,
                        residencyStatus: form.residencyStatus
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
                    payload.preferences = { hobbies: selectedHobbies };
                    break;

                case 'aboutMyself':
                    payload.about = form;
                    break;

                // Partner Sections
                case 'partnerBasicInfo':
                case 'partnerLocationDetails':
                case 'partnerEducationCareer':
                case 'partnerOtherDetails':
                    const pp = {};
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

                    ['maritalStatus', 'children'].forEach(k => {
                        if (form[k]) pp[k] = [form[k]];
                    });

                    payload.partnerPreferences = pp;
                    break;

                default:
                    payload[section] = form;
            }

            console.log("Patching Payload:", JSON.stringify(payload, null, 2));

            const response = await axios.patch(`${BASE_URL}/user/update`, payload, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                Alert.alert("Success", "Profile details added successfully!");
                navigation.goBack(); // Use goBack to return to previous screen
            } else {
                Alert.alert("Error", response.data.message || "Failed to update");
            }

        } catch (error) {
            console.error("Patch Error:", error);
            Alert.alert("Error", "Something went wrong while updating.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Header
                title={SECTION_TITLES[section] || "Fill Details"}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
            >
                {RENDER[section]}

                {/* ⬇ Add update button here — after all data fields */}
                <TouchableOpacity style={styles.updateBtn} onPress={SAVE}>
                    <Text style={styles.updateText}>SAVE DETAILS</Text>
                </TouchableOpacity>
            </ScrollView>

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
                    value={form?.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
                    mode="date"
                    onChange={onDOBChange}
                />
            )}
            {showTime && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    onChange={onTimeChange}
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
