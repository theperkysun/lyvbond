import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  BackHandler,
} from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import CityStateSelect from './CityStateSelect';
import MaritalStatus from './MaritalStatus';
import EducationalDetails from './EducationalDetails';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WorkDetails from './WorkDetails';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/CommonComponents/Header';


const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const CITIES = {
  'West Bengal': ['Kolkata', 'Darjeeling', 'Siliguri', 'Asansol', 'Durgapur'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Aurangabad', 'Nashik'],
  Karnataka: ['Bangalore', 'Mysore', 'Mangalore', 'Belgaum', 'Hubli'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Jamnagar'],
};

const SUBCOMMUNITIES = [
  'Bengali',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Punjabi',
  'Odia',
];

export default function CreateProfileStep() {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [subcommunity, setSubcommunity] = useState('');
  const [activeTab, setActiveTab] = useState('CityStateSelect');
  const [progressBar, setProgressBar] = useState('50%');
  const navigation = useNavigation();
  const route = useRoute();

  // Destructure params to ensure they are passed back if needed, preserving the signup flow data
  const { gender, profileFor, firstName, lastName, day, month, year, email, phone } = route.params || {};

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('EmailPh', {
          // Pass back the data so the previous screen can maintain state if configured to do so
          gender, profileFor, firstName, lastName, day, month, year, email, phone
        });
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation, gender, profileFor, firstName, lastName, day, month, year, email, phone])
  );

  const availableCities = state && CITIES[state] ? CITIES[state] : [];

  const handleContinue = () => {
    if (state && city && subcommunity) {
      alert(`Profile: ${state}, ${city}, ${subcommunity}`);
    } else {
      alert('Please fill all fields');
    }
  };
  // Form State
  const [formData, setFormData] = useState({});

  const renderContent = () => {
    switch (activeTab) {
      case 'CityStateSelect':
        return (
          <CityStateSelect
            onPress={(data) => {
              setFormData((prev) => ({ ...prev, ...data }));
              setProgressBar('75%');
              setActiveTab('martiaStatus');
            }}
          />
        );

      case 'martiaStatus':
        return (
          <MaritalStatus
            onPress={(data) => {
              setFormData((prev) => ({ ...prev, ...data }));
              setProgressBar('85%');
              setActiveTab('educationalDetails');
            }}
          />
        );

      case 'educationalDetails':
        return (
          <EducationalDetails
            onPress={(data) => {
              setFormData((prev) => ({ ...prev, ...data }));
              setProgressBar('95%');
              setActiveTab('workDetails');
            }}
          />
        );

      case 'workDetails':
        return (
          <WorkDetails
            onPress={(data) => {
              setFormData((prev) => ({ ...prev, ...data }));
              setProgressBar('100%');
              navigation.navigate('AddPhotoScreen', {
                // Pass everything: route params + accumulated form data + new work data
                ...route.params,
                ...formData,
                ...data,
              });
            }}
          />
        );

      default:
        return null;
    }
  };


  return (
    <>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <SafeAreaProvider style={styles.container}>
        <Header
          title="Add Profile Details"
          onBackPress={() => navigation.navigate('EmailPh', {
            gender, profileFor, firstName, lastName, day, month, year
          })}
        // rightText="Skip →"
        // onRightPress={() => navigation.navigate("FamilyDetailsScreen2")}
        />

        {/* <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: progressBar.toString() }]} />
      </View> */}
        {renderContent()}
      </SafeAreaProvider>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  locationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.RobotoMedium,
    color: '#333333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  placeholder: {
    color: '#BFBFBF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#17C4CA',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  spacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#666666',
  },
  modalItemSelected: {
    color: '#17C4CA',
    fontWeight: '600',
  },
});
