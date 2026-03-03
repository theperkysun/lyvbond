import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../../utlis/comon';
import DropdownPicker from '../../components/DropdownPicker/DropdownPicker';
import CustomButton from '../../components/CommonComponents/CustomButton';
import { STATES, CITIES, COMMUNITIES } from '../BasicDetails/data';

const { width } = Dimensions.get('window');

export default function CityStateSelect({ onPress }) {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [subcommunity, setSubcommunity] = useState('');
  const [noCasteBar, setNoCasteBar] = useState(false);

  // Filter out "Open for all" for creation flow
  const stateOptions = STATES.filter(i => i !== "Open for all");
  const cityOptions = CITIES.filter(i => i !== "Open for all");
  const communityOptions = COMMUNITIES.filter(i => i !== "Open for all");

  const handleContinue = () => {
    if (state && city && subcommunity) {
      alert(`Profile: ${state}, ${city}, ${subcommunity}`);
    } else {
      alert('Please fill all fields');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationIcon}>
            <Image
              source={require('../../../assets/images/location.png')}
              style={styles.headerImage}
            />
          </View>
        </View>

        {/* State Field */}
        <View style={styles.section}>
          <Text style={styles.label}>State</Text>
          <DropdownPicker
            label="State"
            items={stateOptions}
            value={state}
            onSelect={setState}
            placeholder="State you live in"
          />
        </View>

        {/* City Field */}
        <View style={styles.section}>
          <Text style={styles.label}>City</Text>
          <DropdownPicker
            label="City"
            items={cityOptions}
            value={city}
            onSelect={setCity}
            placeholder="City you live in"
            disabled={!state}
          />
        </View>

        {/* Sub-community Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Sub-community</Text>
          <DropdownPicker
            label="Sub-community"
            items={communityOptions}
            value={subcommunity}
            onSelect={setSubcommunity}
            placeholder="Your Sub-community"
          />
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setNoCasteBar(!noCasteBar)}
        >
          <View style={[styles.checkbox, noCasteBar && styles.checkboxChecked]}>
            {noCasteBar && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.checkboxText}>
            Not particular about my partner's community (Caste no bar)
          </Text>
        </TouchableOpacity>

        <CustomButton
          title={'Continue'}
          paddingVertical={12}
          borderRadius={40}
          onPress={() => onPress({ state, city, subcommunity, noCasteBar })}
        />
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 30,
  },
  headerImage: {
    width: 130,
    height: 130,
  },
  section: {
    marginBottom: 18,
  },
  label: {
    fontSize: 20,
    fontFamily: FONTS.RobotoMedium,
    color: '#333333',
    marginBottom: 12,
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
    fontFamily: FONTS.RobotoRegular,
  },
  spacer: {
    height: 20,
  },
  locationIcon: {
    // optional styling if needed
  }
});
