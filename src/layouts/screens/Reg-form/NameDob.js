import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomInput from '../../components/CommonComponents/CustomInput';
import CustomButton from '../../components/CommonComponents/CustomButton';

const NameDob = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gender, profileFor, googleData } = route.params || {};

  // Auto-fill names if googleData exists, but allow editing
  // googleData.name contains full name from AuthContext
  const initialFirstName = googleData?.name ? googleData.name.split(' ')[0] : '';
  const initialLastName = googleData?.name && googleData.name.split(' ').length > 1
    ? googleData.name.split(' ').slice(1).join(' ')
    : '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [pickerType, setPickerType] = useState(null); // "day" | "month" | "year"

  // FONT SIZE VARIABLES
  const nameTitleFontSize = 30;
  const dobTitleFontSize = 30;

  // Handle value selection
  const handleSelect = (value) => {
    if (pickerType === 'year') {
      const val = String(value).padStart(4, '0');
      // Reset month/day if year changes to ensure validity (e.g. leap year edge case)
      if (month === '02') {
        if (day > 29) setDay(''); // Reset day if invalid in new year
        else if (day === '29' && !isLeap(val)) setDay('');
      }
      setYear(val);
    }
    if (pickerType === 'month') {
      setMonth(String(value).padStart(2, '0'));
      setDay(''); // Reset day when month changes to avoid invalid dates like Feb 31
    }
    if (pickerType === 'day') setDay(String(value).padStart(2, '0'));

    setPickerType(null);
  };

  const isLeap = (yr) => {
    return (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);
  };

  const getDaysInMonth = (m, y) => {
    if (!m || !y) return 31;
    return new Date(y, m, 0).getDate();
  };

  // Modal Picker Data
  const getPickerData = (type) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Latest eligible birth date for 18+
    const minAgeYear = currentYear - 18;

    if (type === 'year') {
      // Show years from minAgeYear downwards (e.g. 2008, 2007...)
      return Array.from({ length: 100 }, (_, i) => minAgeYear - i);
    }

    if (type === 'month') {
      // If selected year is the limit year (e.g. 2008), limit months
      if (year && parseInt(year) === minAgeYear) {
        return Array.from({ length: currentMonth }, (_, i) => i + 1);
      }
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }

    if (type === 'day') {
      if (!year || !month) return []; // Should not happen due to validation

      let days = getDaysInMonth(parseInt(month), parseInt(year));

      // If selected year AND month are the limit (e.g. 2008-01-31), limit days
      if (year && month && parseInt(year) === minAgeYear && parseInt(month) === currentMonth) {
        // Can only select up to current day (e.g. only born before today 18 years ago)
        // Actually, if born ON today 18 years ago, they are 18. So <= currentDay.
        if (days > currentDay) days = currentDay;
      }

      return Array.from({ length: days }, (_, i) => i + 1);
    }

    return [];
  };

  const openPicker = (type) => {
    if (type === 'month' && !year) {
      Alert.alert("Sequence", "Please select Year first.");
      return;
    }
    if (type === 'day' && (!year || !month)) {
      Alert.alert("Sequence", "Please select Year and Month first.");
      return;
    }
    setPickerType(type);
  };

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Info', 'Please enter both first and last name.');
      return;
    }
    if (!day || !month || !year) {
      Alert.alert('Missing Info', 'Please select your full date of birth.');
      return;
    }

    // 18+ Validation
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      Alert.alert(
        "Not Eligible",
        "You must be at least 18 years old to use this platform.",
        [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]
      );
      return;
    }

    navigation.navigate('EmailPh', {
      gender,
      profileFor,
      firstName,
      lastName,
      day,
      month,
      year,
      googleData,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/images/details.png')}
                style={styles.detailsImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Heading */}
          <Text style={[styles.labelTitle, { fontSize: nameTitleFontSize }]}>
            {profileFor ? `${profileFor}'s name` : 'Your name'}
          </Text>

          {/* Name Inputs */}
          <CustomInput
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <CustomInput
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* DOB Section */}
          <Text
            style={[
              styles.labelTitle,
              { marginTop: 25, fontSize: dobTitleFontSize },
            ]}
          >
            Date of birth
          </Text>

          {/* Three separate pickers */}
          <View style={styles.dobContainer}>
            {/* Year */}
            <TouchableOpacity
              style={styles.dobBox}
              activeOpacity={0.8}
              onPress={() => openPicker('year')}
            >
              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateText,
                    { color: year ? COLORS.black : COLORS.grey },
                  ]}
                >
                  {year || 'Year'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Month */}
            <TouchableOpacity
              style={styles.dobBox}
              activeOpacity={0.8}
              onPress={() => openPicker('month')} // Use validated opener
            >
              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateText,
                    { color: month ? COLORS.black : COLORS.grey },
                  ]}
                >
                  {month || 'Month'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Day */}
            <TouchableOpacity
              style={styles.dobBox}
              activeOpacity={0.8}
              onPress={() => openPicker('day')} // Use validated opener
            >
              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateText,
                    { color: day ? COLORS.black : COLORS.grey },
                  ]}
                >
                  {day || 'Day'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Picker */}
          <Modal visible={!!pickerType} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.pickerContainer}>
                <FlatList
                  data={getPickerData(pickerType)}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.item}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.itemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  onPress={() => setPickerType(null)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Continue Button */}
          <CustomButton
            title="Continue"
            paddingVertical={15}
            borderRadius={25}
            marginTop={35}
            onPress={handleContinue}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgcolor,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  iconCircle: {
    backgroundColor: COLORS.bgcolor,
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  detailsImage: {
    width: 120,
    height: 120,
  },
  labelTitle: {
    fontSize: 20,
    fontFamily: FONTS.RobotoBold,
    color: COLORS.black,
    marginBottom: 10,
  },
  dobContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dobBox: {
    width: '30%',
  },
  dateInputContainer: {
    borderWidth: 1.8,
    borderColor: COLORS.bordercolor,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontFamily: FONTS.RobotoMedium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '70%',
    maxHeight: '50%',
  },
  item: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 18,
    color: COLORS.black,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
  },
});

export default NameDob;
