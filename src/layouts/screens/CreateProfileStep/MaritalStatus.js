import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons'; // Not used in this snippet? Wait, imported in original file.
import { FONTS } from '../../../utlis/comon';
import DropdownPicker from '../../components/DropdownPicker/DropdownPicker';
import CustomButton from '../../components/CommonComponents/CustomButton';
import { MARITAL_STATUS, HEIGHT_RANGES, DIET } from '../BasicDetails/data';

const { width } = Dimensions.get('window');

export default function MaritalStatus({ onPress }) {
  const [maritalStatus, setMaritalStatus] = useState('');
  const [height, setHeight] = useState('');
  const [diet, setDiet] = useState('');

  // Filter out "Open for all"
  const maritalOptions = MARITAL_STATUS.filter(i => i !== "Open for all");
  const dietOptions = DIET.filter(i => i !== "Open for all");
  // Height ranges don't typically have "Open for all" in the data file viewed earlier, but IF they do, filter it.

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
              source={require('../../../assets/images/marage_status.png')}
              style={styles.headerImage}
            />
          </View>
        </View>

        {/* Marital Status Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Marital Status</Text>
          <DropdownPicker
            label="Marital Status"
            items={maritalOptions}
            value={maritalStatus}
            onSelect={setMaritalStatus}
            placeholder="Your marital status"
          />
        </View>

        {/* Height Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Height</Text>
          <DropdownPicker
            label="Height"
            items={HEIGHT_RANGES}
            value={height}
            onSelect={setHeight}
            placeholder="Your Height"
          />
        </View>

        {/* Diet Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Diet</Text>
          <DropdownPicker
            label="Diet"
            items={dietOptions}
            value={diet}
            onSelect={setDiet}
            placeholder="Your Diet"
          />
        </View>

        <CustomButton
          title={'Continue'}
          paddingVertical={12}
          borderRadius={40}
          onPress={() => onPress({ maritalStatus, height, diet })}
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
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    // width: 80,
    // height: 80,
    // borderRadius: 40,
    // backgroundColor: '#FFE8F0',
    // justifyContent: 'center',
    // alignItems: 'center',
    // marginBottom: 16,
  },
  headerImage: {
    width: 130,
    height: 130,
  },
  section: {
    marginBottom: 50,
  },
  label: {
    fontSize: 20,
    fontFamily: FONTS.RobotoMedium,
    color: '#333333',
    marginBottom: 15,
  },
  spacer: {
    height: 20,
  },
});
