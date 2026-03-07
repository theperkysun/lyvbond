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

const InviteNameDobScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { chatId, inviterId, profileFor, gender, profileImage } = route.params || {};

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [pickerType, setPickerType] = useState(null);

    const nameTitleFontSize = 30;
    const dobTitleFontSize = 30;

    const handleSelect = (value) => {
        if (pickerType === 'year') {
            const val = String(value).padStart(4, '0');
            if (month === '02') {
                if (day > 29) setDay('');
                else if (day === '29' && !isLeap(val)) setDay('');
            }
            setYear(val);
        }
        if (pickerType === 'month') {
            setMonth(String(value).padStart(2, '0'));
            setDay('');
        }
        if (pickerType === 'day') setDay(String(value).padStart(2, '0'));
        setPickerType(null);
    };

    const isLeap = (yr) => (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);

    const getDaysInMonth = (m, y) => {
        if (!m || !y) return 31;
        return new Date(y, m, 0).getDate();
    };

    const getPickerData = (type) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const minAgeYear = currentYear - 14; // Let's allow slightly younger for family ? Or stick to 18

        if (type === 'year') {
            return Array.from({ length: 100 }, (_, i) => currentYear - i);
        }
        if (type === 'month') {
            return Array.from({ length: 12 }, (_, i) => i + 1);
        }
        if (type === 'day') {
            if (!year || !month) return [];
            let days = getDaysInMonth(parseInt(month), parseInt(year));
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

        navigation.navigate('InviteEmailPhoneScreen', {
            chatId,
            inviterId,
            profileFor,
            gender,
            firstName,
            lastName,
            day,
            month,
            year,
            profileImage
        });
    };

    return (
        <View style={styles.container}>
            <Header title="" onBackPress={() => navigation.goBack()} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Image source={require('../../../assets/images/details.png')} style={styles.detailsImage} resizeMode="contain" />
                        </View>
                    </View>

                    <Text style={[styles.labelTitle, { fontSize: nameTitleFontSize }]}>Your name</Text>

                    <CustomInput placeholder="First name" value={firstName} onChangeText={setFirstName} />
                    <CustomInput placeholder="Last name" value={lastName} onChangeText={setLastName} />

                    <Text style={[styles.labelTitle, { marginTop: 25, fontSize: dobTitleFontSize }]}>Date of birth</Text>

                    <View style={styles.dobContainer}>
                        <TouchableOpacity style={styles.dobBox} activeOpacity={0.8} onPress={() => openPicker('year')}>
                            <View style={styles.dateInputContainer}>
                                <Text style={[styles.dateText, { color: year ? COLORS.black : COLORS.grey }]}>{year || 'Year'}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dobBox} activeOpacity={0.8} onPress={() => openPicker('month')}>
                            <View style={styles.dateInputContainer}>
                                <Text style={[styles.dateText, { color: month ? COLORS.black : COLORS.grey }]}>{month || 'Month'}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dobBox} activeOpacity={0.8} onPress={() => openPicker('day')}>
                            <View style={styles.dateInputContainer}>
                                <Text style={[styles.dateText, { color: day ? COLORS.black : COLORS.grey }]}>{day || 'Day'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Modal visible={!!pickerType} transparent animationType="fade">
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <FlatList
                                    data={getPickerData(pickerType)}
                                    keyExtractor={(item) => item.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                                            <Text style={styles.itemText}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity onPress={() => setPickerType(null)} style={styles.cancelButton}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <CustomButton title="Continue" paddingVertical={15} borderRadius={25} marginTop={35} onPress={handleContinue} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgcolor },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
    iconContainer: { alignItems: 'center', marginVertical: 25 },
    iconCircle: {
        backgroundColor: COLORS.bgcolor, width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center',
        shadowColor: COLORS.primaryShadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4,
    },
    detailsImage: { width: 120, height: 120 },
    labelTitle: { fontSize: 20, fontFamily: FONTS.RobotoBold, color: COLORS.black, marginBottom: 10 },
    dobContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    dobBox: { width: '30%' },
    dateInputContainer: {
        borderWidth: 1.8, borderColor: COLORS.bordercolor, borderRadius: 16, backgroundColor: COLORS.white, height: 65,
        justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primaryShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    dateText: { fontSize: 18, fontFamily: FONTS.RobotoMedium },
    modalContainer: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' },
    pickerContainer: { backgroundColor: COLORS.white, borderRadius: 12, width: '70%', maxHeight: '50%' },
    item: { padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
    itemText: { fontSize: 18, color: COLORS.black },
    cancelButton: { padding: 15, alignItems: 'center' },
    cancelText: { color: 'red', fontSize: 16 },
});

export default InviteNameDobScreen;
