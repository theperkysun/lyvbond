import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FONTS, COLORS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomButton from '../../components/CommonComponents/CustomButton';
import InviteImageSection from './InviteImageSection';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomSelectionButton from '../../components/CommonComponents/CustomSelectionButton';
import GenderSelection from '../UploadPhoto/GenderSelection'; // reuse if possible or inline a simple one

const options = [
    { label: 'Father', icon: 'man' },
    { label: 'Mother', icon: 'woman' },
    { label: 'Sister', icon: 'female' },
    { label: 'Brother', icon: 'male' },
    { label: 'Relatives', icon: 'people-circle' },
];

const InviteProfileForScreen = ({ navigation, route }) => {
    const { chatId, inviterId, inviterName } = route.params || {};
    const [selectedProfileFor, setSelectedProfileFor] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);

    const handleNext = () => {
        if (!selectedProfileFor) {
            Alert.alert('Error', 'Please select your relationship.');
            return;
        }

        let gender = selectedGender;
        if (selectedProfileFor === 'Father' || selectedProfileFor === 'Brother') {
            gender = 'Male';
        } else if (selectedProfileFor === 'Mother' || selectedProfileFor === 'Sister') {
            gender = 'Female';
        }

        if (!gender) {
            Alert.alert('Error', 'Please select a gender.');
            return;
        }

        navigation.navigate('InviteNameDobScreen', {
            chatId,
            inviterId,
            profileFor: selectedProfileFor,
            gender,
            profileImage
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Upload Your Data" onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <InviteImageSection
                    imageUri={profileImage?.uri}
                    onImageSelect={(asset) => setProfileImage(asset)}
                />

                <Text style={styles.titleText}>
                    {inviterName ? `Your relationship with ${inviterName}` : `Your relationship`}
                </Text>

                <View style={styles.optionContainer}>
                    {options.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedProfileFor(item.label);
                                setSelectedGender(null); // reset gender when changing relation
                            }}
                        >
                            <CustomSelectionButton
                                style={[
                                    styles.option,
                                    selectedProfileFor === item.label && styles.optionSelected,
                                ]}
                            >
                                <Icon
                                    name={item.icon}
                                    size={18}
                                    color={selectedProfileFor === item.label ? COLORS.white : COLORS.primary}
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedProfileFor === item.label && styles.optionTextSelected,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </CustomSelectionButton>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedProfileFor === 'Relatives' && (
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.subTitleText}>Select Gender</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            {['Male', 'Female'].map(g => (
                                <TouchableOpacity key={g} onPress={() => setSelectedGender(g)} style={{ flex: 1 }}>
                                    <CustomSelectionButton
                                        style={[selectedGender === g && styles.optionSelected]}
                                    >
                                        <Icon
                                            name={g === 'Male' ? 'male' : 'female'}
                                            size={18}
                                            color={selectedGender === g ? COLORS.white : COLORS.primary}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={[styles.optionText, selectedGender === g && styles.optionTextSelected]}>
                                            {g}
                                        </Text>
                                    </CustomSelectionButton>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <CustomButton
                    title="Next"
                    paddingVertical={15}
                    borderRadius={25}
                    marginTop={35}
                    onPress={handleNext}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgcolor },
    scrollContent: { paddingTop: 10, paddingBottom: 30, paddingHorizontal: 20 },
    titleText: {
        fontSize: 24, paddingRight: 15, color: COLORS.black,
        fontFamily: FONTS.RobotoBold, marginTop: 10, marginBottom: 25, textAlign: 'left',
    },
    subTitleText: {
        fontSize: 20, color: COLORS.black, fontFamily: FONTS.RobotoMedium,
    },
    optionContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
    option: {},
    optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    optionText: { fontSize: 16, color: COLORS.grey },
    optionTextSelected: { color: COLORS.selecttxtcolor },
});

export default InviteProfileForScreen;
