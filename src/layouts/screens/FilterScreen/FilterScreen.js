// src/layouts/screens/FilterScreen/FilterScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../../../utlis/comon";

const { width } = Dimensions.get("window");

// --------------------------------------
// FILTER CONFIG
// --------------------------------------
const FILTER_SECTIONS = [
  {
    id: "verificationStatus",
    title: "Verification Status",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "id_verified", label: "ID Verified Profiles" },
      { id: "phone_verified", label: "Phone Verified Profiles" },
      { id: "premium", label: "Premium Members" },
    ],
  },
  {
    id: "photoSettings",
    title: "Photo Settings",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "visible_all", label: "Visible to all" },
      { id: "visible_premium", label: "Visible to Premium Members" },
      { id: "protected_photo", label: "Protected Photo" },
      { id: "photo_request", label: "Photo request pending" },
    ],
  },
  {
    id: "recentlyJoined",
    title: "Recently Joined",
    multiple: false,
    options: [
      { id: "any", label: "Open to all" },
      { id: "7_days", label: "Within 7 days" },
      { id: "30_days", label: "Within 30 days" },
      { id: "90_days", label: "Within 3 months" },
      { id: "180_days", label: "Within 6 months" },
    ],
  },
  {
    id: "activeMembers",
    title: "Active Members",
    multiple: false,
    options: [
      { id: "any", label: "Open to all" },
      { id: "online_now", label: "Online now" },
      { id: "last_24_hours", label: "Active in last 24 hours" },
      { id: "last_week", label: "Active in last week" },
      { id: "last_month", label: "Active in last month" },
    ],
  },
  {
    id: "annualIncome",
    title: "Annual Income",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "no_income", label: "No Income" },
      { id: "lt_1l", label: "Upto ₹1 Lakh" },
      { id: "1_2l", label: "₹1 - 2 Lakh" },
      { id: "2_4l", label: "₹2 - 4 Lakh" },
      { id: "4_7_5l", label: "₹4 - 7.5 Lakh" },
      { id: "7_5_10l", label: "₹7.5 - 10 Lakh" },
      { id: "10_15l", label: "₹10 - 15 Lakh" },
      { id: "15_20l", label: "₹15 - 20 Lakh" },
      { id: "20_30l", label: "₹20 - 30 Lakh" },
      { id: "30_50l", label: "₹30 - 50 Lakh" },
      { id: "50_75l", label: "₹50 - 75 Lakh" },
      { id: "75_plus", label: "₹75 Lakh & above" },
      { id: "usd_25", label: "Upto US$ 25K" },
      { id: "usd_25_50", label: "US$ 25K - 50K" },
      { id: "usd_50_100", label: "US$ 50K - 100K" },
      { id: "usd_100_plus", label: "US$ 100K & above" },
    ],
  },
  {
    id: "maritalStatus",
    title: "Marital Status",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "never_married", label: "Never Married" },
      { id: "awaiting_divorce", label: "Awaiting Divorce" },
      { id: "divorced", label: "Divorced" },
      { id: "widowed", label: "Widowed" },
      { id: "annulled", label: "Annulled" },
    ],
  },
  {
    id: "religion",
    title: "Religion",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "hindu", label: "Hindu" },
      { id: "muslim", label: "Muslim" },
      { id: "christian", label: "Christian" },
      { id: "sikh", label: "Sikh" },
      { id: "jain", label: "Jain" },
      { id: "buddhist", label: "Buddhist" },
      { id: "parsi", label: "Parsi" },
      { id: "jewish", label: "Jewish" },
      { id: "spiritual", label: "Spiritual but not religious" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "motherTongue",
    title: "Mother Tongue",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "hindi", label: "Hindi" },
      { id: "bengali", label: "Bengali" },
      { id: "marathi", label: "Marathi" },
      { id: "telugu", label: "Telugu" },
      { id: "tamil", label: "Tamil" },
      { id: "urdu", label: "Urdu" },
      { id: "gujarati", label: "Gujarati" },
      { id: "kannada", label: "Kannada" },
      { id: "malayalam", label: "Malayalam" },
      { id: "punjabi", label: "Punjabi" },
      { id: "odia", label: "Odia" },
      { id: "assamese", label: "Assamese" },
      { id: "english", label: "English" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "countryLivingIn",
    title: "Country living in",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "india", label: "India" },
      { id: "usa", label: "United States" },
      { id: "uk", label: "United Kingdom" },
      { id: "canada", label: "Canada" },
      { id: "australia", label: "Australia" },
      { id: "uae", label: "United Arab Emirates" },
      { id: "singapore", label: "Singapore" },
      { id: "new_zealand", label: "New Zealand" },
      { id: "germany", label: "Germany" },
      { id: "france", label: "France" },
      { id: "other", label: "Other countries" },
    ],
  },
  {
    id: "countryGrewUpIn",
    title: "Country grew up in",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "india", label: "India" },
      { id: "middle_east", label: "Middle East" },
      { id: "usa", label: "United States" },
      { id: "uk", label: "United Kingdom" },
      { id: "canada", label: "Canada" },
      { id: "australia", label: "Australia" },
      { id: "africa", label: "Africa" },
      { id: "europe", label: "Europe" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "educationLevel",
    title: "Education level",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "less_than_hs", label: "Less than high school" },
      { id: "high_school", label: "High school" },
      { id: "diploma", label: "Diploma" },
      { id: "bachelors", label: "Bachelor's" },
      { id: "masters", label: "Master's" },
      { id: "doctorate", label: "Doctorate / PhD" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "educationArea",
    title: "Education area",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "engineering", label: "Engineering / Technology" },
      { id: "computers_it", label: "Computers / IT" },
      { id: "management", label: "Management" },
      { id: "medicine", label: "Medicine" },
      { id: "finance", label: "Finance / Commerce" },
      { id: "arts_science", label: "Arts / Science" },
      { id: "law", label: "Law" },
      { id: "architecture", label: "Architecture" },
      { id: "fashion", label: "Fashion / Design" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "workingWith",
    title: "Working with",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "private_company", label: "Private Company" },
      { id: "govt_psu", label: "Government / Public Sector" },
      { id: "business", label: "Business / Self Employed" },
      { id: "defence_civil", label: "Defense / Civil Services" },
      { id: "not_working", label: "Not working" },
    ],
  },
  {
    id: "professionArea",
    title: "Profession area",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "software_it", label: "Software / IT" },
      { id: "engineering", label: "Engineering" },
      { id: "medical", label: "Doctor / Medical" },
      { id: "finance", label: "Finance / Accounting" },
      { id: "sales_marketing", label: "Sales & Marketing" },
      { id: "hr_admin", label: "HR / Admin" },
      { id: "education", label: "Education / Training" },
      { id: "bpo_kpo", label: "BPO / KPO" },
      { id: "arts_media", label: "Arts / Media / Design" },
      { id: "other", label: "Other professions" },
    ],
  },
  {
    id: "profileManagedBy",
    title: "Profile managed by",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "self", label: "Self" },
      { id: "parent", label: "Parent / Guardian" },
      { id: "sibling", label: "Sibling" },
      { id: "relative_friend", label: "Relative / Friend" },
    ],
  },
  {
    id: "eatingHabits",
    title: "Eating habits",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "vegetarian", label: "Vegetarian" },
      { id: "non_veg", label: "Non-Vegetarian" },
      { id: "eggetarian", label: "Eggetarian" },
      { id: "jain", label: "Jain" },
      { id: "vegan", label: "Vegan" },
      { id: "occasionally_non_veg", label: "Occasionally Non-Veg" },
    ],
  },
  {
    id: "manglik",
    title: "Manglik / Chevvai Dosham",
    multiple: false,
    options: [
      { id: "any", label: "Open to all" },
      { id: "yes", label: "Manglik / Chevvai Dosham" },
      { id: "no", label: "Non-Manglik" },
      { id: "anshik", label: "Anshik / Partial Manglik" },
      { id: "doesnt_matter", label: "Doesn't matter" },
    ],
  },
  {
    id: "community",
    title: "Community",
    multiple: true,
    options: [
      { id: "any", label: "Open to all" },
      { id: "brahmin", label: "Brahmin" },
      { id: "kayastha", label: "Kayastha" },
      { id: "aggarwal", label: "Aggarwal" },
      { id: "maratha", label: "Maratha" },
      { id: "rajput", label: "Rajput" },
      { id: "gujarati", label: "Gujarati" },
      { id: "sindhi", label: "Sindhi" },
      { id: "punjabi", label: "Punjabi" },
      { id: "khatri", label: "Khatri" },
      { id: "yadav", label: "Yadav" },
      { id: "other", label: "Other communities" },
    ],
  },
];

// --------------------------------------
// Helper: human readable summary
// --------------------------------------
const getSelectionSummary = (section, values = []) => {
  if (!values || values.length === 0 || values.includes("any")) {
    return "Open to all";
  }

  const labels = section.options
    .filter((o) => values.includes(o.id) && o.id !== "any")
    .map((o) => o.label);

  if (!labels.length) return "Open to all";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(", ");
  return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
};

// --------------------------------------
// Screen
// --------------------------------------
export default function FilterScreen({ navigation }) {
  const [activeFilterId, setActiveFilterId] = useState(null);
  const [selectedValues, setSelectedValues] = useState(() => {
    const initial = {};
    FILTER_SECTIONS.forEach((s) => {
      initial[s.id] = [];
    });
    return initial;
  });

  const activeSection = useMemo(
    () => FILTER_SECTIONS.find((s) => s.id === activeFilterId),
    [activeFilterId]
  );

  const openSheet = (id) => setActiveFilterId(id);
  const closeSheet = () => setActiveFilterId(null);

  const onToggleOption = (option) => {
    if (!activeSection) return;
    setSelectedValues((prev) => {
      const current = prev[activeSection.id] || [];
      // "Open to all" clears selection
      if (option.id === "any") {
        return { ...prev, [activeSection.id]: [] };
      }

      if (!activeSection.multiple) {
        return { ...prev, [activeSection.id]: [option.id] };
      }

      const exists = current.includes(option.id);
      const next = exists
        ? current.filter((v) => v !== option.id)
        : [...current.filter((v) => v !== "any"), option.id];
      return { ...prev, [activeSection.id]: next };
    });
  };

  const onClearFilter = () => {
    if (!activeSection) return;
    setSelectedValues((prev) => ({ ...prev, [activeSection.id]: [] }));
  };

  const onResetAll = () => {
    const cleared = {};
    FILTER_SECTIONS.forEach((s) => (cleared[s.id] = []));
    setSelectedValues(cleared);
  };

  const onApplyAll = () => {
    // Hook this to API / search later
    navigation.goBack?.();
  };

  // --------------- RENDER --------------

  const renderFilterRow = ({ item }) => {
    const value = selectedValues[item.id];
    const summary = getSelectionSummary(item, value);

    return (
      <TouchableOpacity
        style={styles.filterRow}
        onPress={() => openSheet(item.id)}
        activeOpacity={0.8}
      >
        <View>
          <Text style={styles.filterTitle}>{item.title}</Text>
          <Text style={styles.filterSummary}>{summary}</Text>
        </View>
        <MaterialIcons name="keyboard-arrow-right" size={22} color="#999" />
      </TouchableOpacity>
    );
  };

  const renderSheetOption = ({ item }) => {
    const currentVals = selectedValues[activeSection.id] || [];
    const selected =
      currentVals.length === 0 && item.id === "any"
        ? true
        : currentVals.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.optionRow, selected && styles.optionRowSelected]}
        onPress={() => onToggleOption(item)}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.optionLabel,
            selected && { color: COLORS.primary, fontWeight: "600" },
          ]}
        >
          {item.label}
        </Text>
        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={COLORS.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.goBack?.()}
        >
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Filters</Text>

        <TouchableOpacity onPress={onResetAll}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF FILTERS */}
      <FlatList
        data={FILTER_SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderFilterRow}
        contentContainerStyle={{ paddingBottom: 90 }}
      />

      {/* BOTTOM "SHOW RESULTS" BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.showButton}
          activeOpacity={0.85}
          onPress={onApplyAll}
        >
          <Text style={styles.showButtonText}>Show Results</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET MODAL */}
      <Modal
        transparent
        visible={!!activeSection}
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <Pressable style={styles.modalBg} onPress={closeSheet} />

        <View style={styles.sheet}>
          {activeSection && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{activeSection.title}</Text>

                <TouchableOpacity onPress={onClearFilter}>
                  <Text style={styles.sheetClear}>Clear</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <FlatList
                  data={activeSection.options}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSheetOption}
                  scrollEnabled={false}
                />
              </ScrollView>

              <TouchableOpacity
                style={styles.sheetApply}
                onPress={closeSheet}
                activeOpacity={0.85}
              >
                <Text style={styles.sheetApplyText}>Apply</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e4",
    backgroundColor: "#fff",
  },
  headerBack: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.RobotoMedium,
    color: "#111",
  },
  resetText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
  },

  filterRow: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTitle: {
    fontSize: 15,
    fontFamily: FONTS.RobotoMedium,
    color: "#222",
  },
  filterSummary: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e4",
  },
  showButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  showButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
  },

  // modal / sheet
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
    color: "#111",
  },
  sheetClear: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
  },

  optionRow: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRowSelected: {
    backgroundColor: "#f1f8ff",
  },
  optionLabel: {
    fontSize: 15,
    color: "#333",
  },

  sheetApply: {
    marginTop: 8,
    marginHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetApplyText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: FONTS.RobotoMedium,
  },
});
