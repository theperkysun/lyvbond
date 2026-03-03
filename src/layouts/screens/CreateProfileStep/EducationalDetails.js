import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../../utlis/comon';
import DropdownPicker from '../../components/DropdownPicker/DropdownPicker';
import CustomButton from '../../components/CommonComponents/CustomButton';

export default function EducationalDetails({ onPress }) {
  const [qualification, setQualification] = useState('');
  const [college, setCollege] = useState('');

  const QUALIFICATIONS = [
    'High School (10th)',
    'Higher Secondary (12th)',
    'Diploma',
    'B.A',
    'B.Sc',
    'B.Com',
    'B.E / B.Tech',
    'BCA',
    'BBA',
    'M.A',
    'M.Sc',
    'M.Com',
    'M.E / M.Tech',
    'MBA',
    'MCA',
    'PhD',
    'Other',
  ];

  const COLLEGES = [
    'IIT',
    'NIT',
    'BITS',
    'Delhi University',
    'Jadavpur University',
    'WBUT',
    'Amity University',
    'VIT',
    'SRM University',
    'Other',
  ];

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
              source={require('../../../assets/images/education.png')}
              style={styles.headerImage}
            //resizeMode="contain"
            />
          </View>

          {/* <Text style={styles.headerTitle}>Now let's build your Profile</Text> */}
        </View>

        {/* Qualification */}
        <View style={styles.section}>
          <Text style={styles.label}>Highest qualification</Text>
          <DropdownPicker
            label="Highest qualification"
            items={QUALIFICATIONS}
            value={qualification}
            onSelect={setQualification}
            placeholder="Select qualification"
          />
        </View>

        {/* College */}
        <View style={styles.section}>
          <Text style={styles.label}>College</Text>
          <DropdownPicker
            label="College"
            items={COLLEGES}
            value={college}
            onSelect={setCollege}
            placeholder="Select your college"
          />
        </View>

        {/* Continue Button */}
        <CustomButton
          title={'Continue'}
          paddingVertical={14}
          borderRadius={40}
          onPress={() => onPress({ qualification, college })}
        />

        <View style={{ height: 30 }} />

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
    marginBottom: 20,
    marginTop:20,
  },
  iconContainer: {
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
    marginBottom: 22,
  },
  label: {
    fontSize: 20,
    fontFamily: FONTS.RobotoMedium,
    color: '#333333',
    marginBottom: 12,
  },
  headerImage: {
    width: 130,
    height: 130,
  },
});
