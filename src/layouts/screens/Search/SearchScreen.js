import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput,
  Switch,
} from "react-native";

import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS } from "../../../utlis/comon";
import { SELECTION_DATA } from "../../components/CommonComponents/selectionboxdata";

const { width } = Dimensions.get("window");

export default function SearchScreen({ navigation }) {
  // ----------------- STATES -----------------
  const [searchText, setSearchText] = useState("");

  // Dual sliders
  const [ageRange, setAgeRange] = useState([18, 40]);
  const [heightRange, setHeightRange] = useState([54, 84]);

  // Quick filters - NOW ARRAYS
  const [maritalStatus, setMaritalStatus] = useState(["Open for all"]);
  const [haveChildren, setHaveChildren] = useState(["Open for all"]);
  const [religion, setReligion] = useState(["Hindu"]);
  const [community, setCommunity] = useState(["Open for all"]);
  const [motherTongue, setMotherTongue] = useState(["Open for all"]);
  const [manglik, setManglik] = useState(["Open for all"]);

  // The 4 original items
  const [countryLiving, setCountryLiving] = useState(["Open for all"]);
  const [countryGrew, setCountryGrew] = useState(["Open for all"]);
  const [residencyStatus, setResidencyStatus] = useState(["Open for all"]);
  const [photoSettings, setPhotoSettings] = useState(["Open for all"]);

  // More options visibility
  const [showMore, setShowMore] = useState(false);

  // More-options states
  const [qualification, setQualification] = useState(["Open for all"]);
  const [educationArea, setEducationArea] = useState(["Open for all"]);
  const [workingWith, setWorkingWith] = useState(["Open for all"]);
  const [professionArea, setProfessionArea] = useState(["Open for all"]);

  const [incomeOption, setIncomeOption] = useState("open"); // 'open' or 'range'
  const [incomeRange, setIncomeRange] = useState([0, 0]);

  const [diet, setDiet] = useState(["Open for all"]);
  const [profileManagedBy, setProfileManagedBy] = useState(["Open for all"]);
  const [hasHoroscope, setHasHoroscope] = useState(["Open for all"]);

  // switches
  const [includeFilteredMe, setIncludeFilteredMe] = useState(false);
  const [includeAlreadyViewed, setIncludeAlreadyViewed] = useState(true);

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

  // Open Option Screen
  const openOptionScreen = (title, field, currentSelection, setSelection) => {
    let options = [];
    switch (field) {
      case "maritalStatus": options = SELECTION_DATA.maritalStatus; break;
      case "haveChildren": options = SELECTION_DATA.haveChildren; break;
      case "religion": options = SELECTION_DATA.religion; break;
      case "community": options = SELECTION_DATA.community; break;
      case "motherTongue": options = SELECTION_DATA.motherTongue; break;
      case "manglik": options = SELECTION_DATA.manglik; break;
      case "countryLiving": options = SELECTION_DATA.country; break;
      case "countryGrew": options = SELECTION_DATA.grewUpIn; break;
      case "residencyStatus": options = SELECTION_DATA.residencyStatus; break;
      case "photoSettings": options = SELECTION_DATA.photoSettings; break;
      case "qualification": options = SELECTION_DATA.qualification; break;
      case "educationArea": options = SELECTION_DATA.educationArea; break;
      case "workingWith": options = SELECTION_DATA.workingWith; break;
      case "professionArea": options = SELECTION_DATA.professionArea; break;
      case "diet": options = SELECTION_DATA.diet; break;
      case "profileManagedBy": options = SELECTION_DATA.profileManagedBy; break;
      case "hasHoroscope": options = SELECTION_DATA.hasHoroscope; break;
      default: options = [];
    }

    navigation.navigate("SearchOptionScreen", {
      title,
      options,
      selectedOptions: currentSelection,
      onSelect: (newSelection) => setSelection(newSelection),
    });
  };


  const Row = ({ label, value, onPress }) => {
    // Value is now an array, join it
    const displayValue = Array.isArray(value) ? value.join(", ") : value;
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue} numberOfLines={1}>{displayValue}</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#bdbdbd" />
      </TouchableOpacity>
    );
  };

  const handleSearchNow = () => {
    // Build payload
    const payload = {
      searchText,
      ageRange: { min: minAge, max: maxAge },
      heightRange: { min: minHeight, max: maxHeight },
      filters: {
        maritalStatus,
        haveChildren,
        religion,
        community,
        motherTongue,
        manglik,
        countryLiving,
        countryGrew,
        residencyStatus,
        photoSettings,
      },
      more: {
        educationProfession: {
          qualification,
          educationArea,
          workingWith,
          professionArea,
        },
        annualIncome: { option: incomeOption, range: incomeRange },
        lifestyle: { diet },
        other: { profileManagedBy, hasHoroscope, includeFilteredMe, includeAlreadyViewed },
      },
    };

    console.log("Search payload:", payload);
    // Navigate to results or handle search
    navigation.navigate("SearchResult", { searchPayload: payload });
  };

  // ----------------- UI -----------------
  return (
    <SafeAreaView style={styles.safe}>
      {/* StatusBar spacer for Android */}
      <View
        style={{
          height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          backgroundColor: "#fff",
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>

        {/* SEARCH BOX */}
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#444" style={{ marginRight: 8 }} />
          </TouchableOpacity>

          <TextInput
            placeholder="Search by name, college, city..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <Text style={styles.heading}>Personalize your search</Text>

        {/* AGE DUAL SLIDER */}
        <View style={styles.sliderBlock}>
          <View style={styles.sliderHeader}>
            <Text style={styles.smallLabel}>Age</Text>
            <Text style={styles.sliderValue}>Min {minAge} yrs   Max {maxAge} yrs</Text>
          </View>

          <MultiSlider
            values={ageRange}
            onValuesChange={setAgeRange}
            min={18}
            max={71}
            step={1}
            sliderLength={width - 40}
            selectedStyle={{ backgroundColor: COLORS.primary }}
            trackStyle={{ height: 6, borderRadius: 10, backgroundColor: "#eaeaea" }}
            markerStyle={styles.thumb}
          />
        </View>

        {/* HEIGHT DUAL SLIDER */}
        <View style={styles.sliderBlock}>
          <View style={styles.sliderHeader}>
            <Text style={styles.smallLabel}>Height</Text>
            <Text style={styles.sliderValue}>
              Min {formatHeight(minHeight)}   Max {formatHeight(maxHeight)}
            </Text>
          </View>

          <MultiSlider
            values={heightRange}
            onValuesChange={setHeightRange}
            min={48}
            max={84}
            step={1}
            sliderLength={width - 40}
            selectedStyle={{ backgroundColor: COLORS.primary }}
            trackStyle={{ height: 6, borderRadius: 10, backgroundColor: "#eaeaea" }}
            markerStyle={styles.thumb}
          />
        </View>

        {/* ------------------ FILTERS ------------------ */}
        <Row label="Marital Status" value={maritalStatus} onPress={() => openOptionScreen("Marital Status", "maritalStatus", maritalStatus, setMaritalStatus)} />
        <Row label="Have Children" value={haveChildren} onPress={() => openOptionScreen("Have Children", "haveChildren", haveChildren, setHaveChildren)} />
        <Row label="Religion" value={religion} onPress={() => openOptionScreen("Religion", "religion", religion, setReligion)} />
        <Row label="Community" value={community} onPress={() => openOptionScreen("Community", "community", community, setCommunity)} />
        <Row label="Mother Tongue" value={motherTongue} onPress={() => openOptionScreen("Mother Tongue", "motherTongue", motherTongue, setMotherTongue)} />
        <Row label="Manglik / Chevvai Dosham" value={manglik} onPress={() => openOptionScreen("Manglik", "manglik", manglik, setManglik)} />

        <Row label="Country living in" value={countryLiving} onPress={() => openOptionScreen("Country Living In", "countryLiving", countryLiving, setCountryLiving)} />
        <Row label="Country grew up in" value={countryGrew} onPress={() => openOptionScreen("Country Grew Up In", "countryGrew", countryGrew, setCountryGrew)} />
        <Row label="Residency Status" value={residencyStatus} onPress={() => openOptionScreen("Residency Status", "residencyStatus", residencyStatus, setResidencyStatus)} />
        <Row label="Photo Settings" value={photoSettings} onPress={() => openOptionScreen("Photo Settings", "photoSettings", photoSettings, setPhotoSettings)} />

        {/* ------------------ More Search Options ------------------ */}
        {!showMore && (
          <TouchableOpacity style={styles.moreRow} onPress={() => setShowMore(true)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="expand-more" size={20} color={COLORS.primary} />
              <Text style={styles.moreText}>More Search Options</Text>
            </View>
          </TouchableOpacity>
        )}

        {showMore && (
          <View style={styles.morePanelContainer}>
            <Text style={styles.sectionTitle}>Education & Profession Details</Text>
            <Row label="Qualification" value={qualification} onPress={() => openOptionScreen("Qualification", "qualification", qualification, setQualification)} />
            <Row label="Education Area" value={educationArea} onPress={() => openOptionScreen("Education Area", "educationArea", educationArea, setEducationArea)} />
            <Row label="Working With" value={workingWith} onPress={() => openOptionScreen("Working With", "workingWith", workingWith, setWorkingWith)} />
            <Row label="Profession Area" value={professionArea} onPress={() => openOptionScreen("Profession Area", "professionArea", professionArea, setProfessionArea)} />

            <Text style={styles.sectionTitle}>Annual Income</Text>
            <TouchableOpacity style={styles.radioRow} onPress={() => setIncomeOption("open")}>
              <Icon name={incomeOption === "open" ? "radio-button-checked" : "radio-button-unchecked"} size={20} color={incomeOption === "open" ? COLORS.primary : "#777"} />
              <Text style={styles.radioLabel}>Open to all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioRow} onPress={() => setIncomeOption("range")}>
              <Icon name={incomeOption === "range" ? "radio-button-checked" : "radio-button-unchecked"} size={20} color={incomeOption === "range" ? COLORS.primary : "#777"} />
              <Text style={styles.radioLabel}>Specify an Income range</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Lifestyle & Appearance</Text>
            <Row label="Diet" value={diet} onPress={() => openOptionScreen("Diet", "diet", diet, setDiet)} />

            <Text style={styles.sectionTitle}>Other Details</Text>
            <Row label="Profile Managed By" value={profileManagedBy} onPress={() => openOptionScreen("Profile Managed By", "profileManagedBy", profileManagedBy, setProfileManagedBy)} />
            <Row label="Has Horoscope" value={hasHoroscope} onPress={() => openOptionScreen("Has Horoscope", "hasHoroscope", hasHoroscope, setHasHoroscope)} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Include profiles that have filtered me out as well</Text>
              <Switch value={includeFilteredMe} onValueChange={setIncludeFilteredMe} trackColor={{ false: "#ccc", true: COLORS.primary }} thumbColor={includeFilteredMe ? "#fff" : "#fff"} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Include profiles that I have already viewed</Text>
              <Switch value={includeAlreadyViewed} onValueChange={setIncludeAlreadyViewed} trackColor={{ false: "#ccc", true: COLORS.primary }} thumbColor={includeAlreadyViewed ? "#fff" : "#fff"} />
            </View>
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* FIXED SEARCH BUTTON */}
      <View style={styles.fixedBottom}>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.9} onPress={handleSearchNow}>
          <Text style={styles.searchBtnText}>Search Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ----------------- STYLES -----------------
const styles = StyleSheet.create({
  safe:
  {
    flex: 1,
    backgroundColor: "#fff"
  },
  container:
  {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40
  },
  searchContainer:
  {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18
  },
  searchInput:
  {
    flex: 1,
    fontSize: 15,
    color: "#333"
  },
  heading:
  {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#333"
  },
  sliderBlock:
  {
    marginBottom: 18
  },
  sliderHeader:
  {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  smallLabel:
  {
    color: "#555",
    fontSize: 14

  },
  sliderValue:
  {
    color: COLORS.primary,
    fontWeight: "600"

  },
  thumb:
  {
    height: 26,
    width: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 3
  },
  row:
  {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  rowLabel:
  {
    fontSize: 15,
    color: "#444"

  },
  rowValue:
  {
    color: "#777",
    marginTop: 4

  },
  moreRow:
  {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"

  },
  moreText:
  {
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 15

  },
  morePanelContainer:
  {
    marginTop: 10,
    backgroundColor: "#fff"

  },
  sectionTitle:
  {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#333"

  },
  radioRow:
  {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12

  },
  radioLabel:
  {
    marginLeft: 10,
    fontSize: 15,
    color: "#444"

  },
  switchRow:
  {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  switchLabel:
  {
    fontSize: 15,
    color: "#444",
    flex: 1,
    paddingRight: 10

  },
  fixedBottom:
  {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: "center"

  },
  searchBtn:
  {
    width: width - 40,
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6
  },
  searchBtnText:
  {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700"

  },
});
