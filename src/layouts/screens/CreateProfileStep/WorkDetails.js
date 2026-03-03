import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../../utlis/comon';
import DropdownPicker from '../../components/DropdownPicker/DropdownPicker';
import CustomButton from '../../components/CommonComponents/CustomButton';

export default function WorkDetails({ onPress }) {
  const [income, setIncome] = useState('');
  const [workType, setWorkType] = useState('');
  const [profession, setProfession] = useState('');
  const [organization, setOrganization] = useState('');

  const INCOME_OPTIONS = [
    'Less than 1 Lakh',
    '1 Lakh to 3 Lakh',
    '3 Lakh to 5 Lakh',
    '5 Lakh to 7 Lakh',
    '7 Lakh to 10 Lakh',
    '10 Lakh to 15 Lakh',
    '15 Lakh to 20 Lakh',
    '20 Lakh to 30 Lakh',
    '30 Lakh to 50 Lakh',
    '50 Lakh+',
  ];

  const WORK_TYPES = [
    'Private Company',
    'Government Job',
    'Business / Self Employed',
    'Defence',
    'Not Working',
    'Other',
  ];

  const PROFESSIONS = [
    'Software Engineer',
    'Doctor',
    'Chartered Accountant',
    'Teacher',
    'Business Owner',
    'Banking Professional',
    'Self Employed',
    'Other',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header Icon */}
        <View style={styles.header}>
          <View style={styles.locationIcon}>
            <Image
              source={require('../../../assets/images/work.png')}
              style={styles.headerImage}
            //resizeMode="contain"
            />
          </View>

          {/* <Text style={styles.headerTitle}>Now let's build your Profile</Text> */}
        </View>

        {/* Income */}
        <View style={styles.section}>
          <DropdownPicker
            label="Annual Income"
            items={INCOME_OPTIONS}
            value={income}
            onSelect={setIncome}
            placeholder="Select your income"
          />
          <Text style={styles.helpText}>Why is income required?</Text>
        </View>

        {/* Work Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Work details</Text>
          <DropdownPicker
            label="Work Type"
            items={WORK_TYPES}
            value={workType}
            onSelect={setWorkType}
            placeholder="Select work type"
          />
        </View>

        {/* Profession */}
        <View style={styles.section}>
          <DropdownPicker
            label="Profession"
            items={PROFESSIONS}
            value={profession}
            onSelect={setProfession}
            placeholder="Select profession"
          />
        </View>

        {/* Organization */}
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            placeholder="Enter organization"
            value={organization}
            onChangeText={setOrganization}
          />
          <Text style={styles.smallText}>Specify current organization</Text>
        </View>

        <CustomButton
          title={'Create Profile'}
          paddingVertical={14}
          borderRadius={40}
          onPress={() => onPress({ income, workType, profession, organization })}
        />

        <View style={{ height: 40 }} />

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
    marginBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 22,
    fontFamily: FONTS.RobotoMedium,
    color: '#333',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  smallText: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
  headerImage: {
    width: 130,
    height: 130,
  },
});
