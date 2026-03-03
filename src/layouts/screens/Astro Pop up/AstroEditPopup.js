import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    ScrollView,
    FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS } from "../../../utlis/comon";

const { width, height } = Dimensions.get("window");

const STEPS = {
    TIME_OF_BIRTH: 1,
    PLACE_OF_BIRTH: 2,
    MANGLIK_DOSHA: 3,
    RAASHI: 4,
    NAKSHATRA: 5,
};

const TOTAL_STEPS = 5;
const ITEM_HEIGHT = 70;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const RAASHI_DATA = [
    { id: 'aries', name: 'Aries', hindi: '(Mesh)', icon: 'zodiac-aries' },
    { id: 'taurus', name: 'Taurus', hindi: '(Vrishabh)', icon: 'zodiac-taurus' },
    { id: 'gemini', name: 'Gemini', hindi: '(Mithun)', icon: 'zodiac-gemini' },
    { id: 'cancer', name: 'Cancer', hindi: '(Kark)', icon: 'zodiac-cancer' },
    { id: 'leo', name: 'Leo', hindi: '(Simha)', icon: 'zodiac-leo' },
    { id: 'virgo', name: 'Virgo', hindi: '(Kanya)', icon: 'zodiac-virgo' },
    { id: 'libra', name: 'Libra', hindi: '(Tula)', icon: 'zodiac-libra' },
    { id: 'scorpio', name: 'Scorpio', hindi: '(Vrishchik)', icon: 'zodiac-scorpio' },
    { id: 'sagittarius', name: 'Saggitarius', hindi: '(Dhanu)', icon: 'zodiac-sagittarius' },
    { id: 'capricorn', name: 'Capricorn', hindi: '(Makar)', icon: 'zodiac-capricorn' },
    { id: 'aquarius', name: 'Aquarius', hindi: '(Kumbh)', icon: 'zodiac-aquarius' },
    { id: 'pisces', name: 'Pisces', hindi: '(Meen)', icon: 'zodiac-pisces' },
];

const NAKSHATRA_DATA = [
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati"
];

const ScrollPicker = ({ data, selectedValue, onValueChange, label }) => {
    const flatListRef = useRef(null);

    useEffect(() => {
        if (flatListRef.current && selectedValue) {
            const index = data.indexOf(selectedValue);
            if (index !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index,
                        animated: false,
                        viewPosition: 0.5,
                    });
                }, 50);
            }
        }
    }, [selectedValue]);

    const onMomentumScrollEnd = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < data.length) {
            onValueChange(data[index]);
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
            <Text style={[
                styles.pickerText,
                item === selectedValue && styles.selectedPickerText
            ]}>
                {label === "period" && item === "AM" ? "AM" : label === "period" && item === "PM" ? "PM" : item}
            </Text>
        </View>
    );

    return (
        <View style={{ height: PICKER_HEIGHT, width: 90 }}>
            <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                bounces={false}
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                onMomentumScrollEnd={onMomentumScrollEnd}
                initialNumToRender={15}
                getItemLayout={(data, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
            />
        </View>
    );
};

const AstroEditPopup = ({ visible, onClose, initialData, onSave }) => {
    const [currentStep, setCurrentStep] = useState(STEPS.TIME_OF_BIRTH);

    // Form State
    const [time, setTime] = useState({ hour: "08", minute: "00", period: "AM" });
    const [place, setPlace] = useState("Kolkata, West Bengal, India");
    const [manglik, setManglik] = useState("Don't know");
    const [raashi, setRaashi] = useState("pisces"); // Default based on screenshot
    const [nakshatra, setNakshatra] = useState("Uttara Bhadrapada");

    useEffect(() => {
        if (visible) {
            setCurrentStep(STEPS.TIME_OF_BIRTH);
            if (initialData) {
                // Parse Time "08:00 AM"
                if (initialData.timeOfBirth) {
                    const [t, p] = initialData.timeOfBirth.split(' ');
                    const [h, m] = t.split(':');
                    setTime({ hour: h || "08", minute: m || "00", period: p || "AM" });
                }
                setPlace(initialData.placeOfBirth || initialData.cityOfBirth || "");
                setManglik(initialData.manglik || "Don't know");
                setRaashi(initialData.raashi || "pisces");
                setNakshatra(initialData.nakshatra || "Uttara Bhadrapada");
            }
        }
    }, [visible, initialData]);

    // Time Picker Data
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    const periods = ["AM", "PM"];

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            // Save and Close
            const formattedTime = `${time.hour}:${time.minute} ${time.period}`;
            const saveData = {
                timeOfBirth: formattedTime,
                placeOfBirth: place,
                manglik,
                raashi,
                nakshatra
            };
            if (onSave) onSave(saveData);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            onClose();
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
                <Text style={styles.stepText}>{currentStep}/{TOTAL_STEPS}</Text>
                <View style={styles.dotsContainer}>
                    {[...Array(TOTAL_STEPS)].map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index + 1 === currentStep ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );

    const renderTimeOfBirth = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Time of Birth</Text>
            <View style={styles.displayBox}>
                <Text style={styles.displayText}>{`${time.hour}:${time.minute} ${time.period === "AM" ? "am" : "pm"}`}</Text>
            </View>

            <View style={styles.pickerWrapper}>
                <View style={styles.pickerContainer}>
                    <ScrollPicker
                        data={hours}
                        selectedValue={time.hour}
                        onValueChange={(val) => setTime({ ...time, hour: val })}
                    />
                    <View style={{ height: PICKER_HEIGHT, justifyContent: "center", width: 30, alignItems: "center" }}>
                        <Text style={styles.separatorText}>:</Text>
                    </View>
                    <ScrollPicker
                        data={minutes}
                        selectedValue={time.minute}
                        onValueChange={(val) => setTime({ ...time, minute: val })}
                    />
                    <View style={{ width: 30 }} />
                    <ScrollPicker
                        data={periods}
                        selectedValue={time.period}
                        onValueChange={(val) => setTime({ ...time, period: val })}
                        label="period"
                    />
                </View>

                {/* Selection Lines Overlay */}
                <View style={styles.selectionOverlay} pointerEvents="none">
                    <View style={styles.line} />
                    <View style={{ height: ITEM_HEIGHT }} />
                    <View style={styles.line} />
                </View>
            </View>
        </View>
    );

    const renderPlaceOfBirth = () => (
        <ScrollView contentContainerStyle={styles.stepContainer}>
            <Text style={styles.title}>Place of Birth</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={place}
                    onChangeText={setPlace}
                    placeholder="Enter Place of Birth"
                    placeholderTextColor="#999"
                />
                {place.length > 0 && (
                    <TouchableOpacity onPress={() => setPlace("")}>
                        <Ionicons name="close" size={20} color="#333" />
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );

    const renderManglikDosha = () => (
        <ScrollView contentContainerStyle={styles.stepContainer}>
            <Text style={styles.title}>Manglik Dosha</Text>
            <View style={styles.radioGroup}>
                {["Don't know", "Yes", "No"].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={styles.radioButton}
                        onPress={() => setManglik(option)}
                    >
                        <Text style={styles.radioText}>{option}</Text>
                        <View style={[styles.radioCircle, manglik === option && styles.selectedRadioCircle]}>
                            {manglik === option && <View style={styles.radioInnerCircle} />}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderRaashi = () => (
        <ScrollView contentContainerStyle={styles.stepContainer}>
            <Text style={styles.title}>Raashi</Text>
            <Text style={styles.subtitle}>Selected based on your lunar star sign.</Text>
            <View style={styles.gridContainer}>
                {RAASHI_DATA.map((item) => {
                    const isSelected = raashi === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.gridItem,
                                isSelected && styles.selectedGridItem
                            ]}
                            onPress={() => setRaashi(item.id)}
                        >
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={32}
                                color={isSelected ? COLORS.primary : "#F57C00"} // Orange color for icons
                            />
                            <Text style={styles.gridItemName}>{item.name}</Text>
                            <Text style={styles.gridItemHindi}>{item.hindi}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );

    const renderNakshatra = () => (
        <ScrollView contentContainerStyle={styles.stepContainer}>
            <Text style={styles.title}>Nakshatra</Text>
            <Text style={styles.subtitle}>Selected based on your Raashi</Text>
            <View style={styles.radioGroup}>
                {NAKSHATRA_DATA.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={styles.radioButton}
                        onPress={() => setNakshatra(option)}
                    >
                        <Text style={styles.radioText}>{option}</Text>
                        <View style={[styles.radioCircle, nakshatra === option && styles.selectedRadioCircle]}>
                            {nakshatra === option && <View style={styles.radioInnerCircle} />}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderContent = () => {
        switch (currentStep) {
            case STEPS.TIME_OF_BIRTH:
                return renderTimeOfBirth();
            case STEPS.PLACE_OF_BIRTH:
                return renderPlaceOfBirth();
            case STEPS.MANGLIK_DOSHA:
                return renderManglikDosha();
            case STEPS.RAASHI:
                return renderRaashi();
            case STEPS.NAKSHATRA:
                return renderNakshatra();
            default:
                return <View />;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    {/* Header Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {renderHeader()}

                    <View style={styles.content}>
                        {renderContent()}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>
                                {currentStep === TOTAL_STEPS ? "Save" : "Next"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    popupContainer: {
        width: "100%",
        height: "90%",
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    handleContainer: {
        alignItems: "center",
        paddingTop: 10,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: "#E0E0E0",
        borderRadius: 2.5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    progressContainer: {
        alignItems: "flex-end",
    },
    stepText: {
        fontSize: 12,
        color: "#999",
        marginBottom: 4,
        fontFamily: FONTS.RobotoRegular,
    },
    dotsContainer: {
        flexDirection: "row",
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: 4,
    },
    activeDot: {
        backgroundColor: "#00C853",
    },
    inactiveDot: {
        backgroundColor: "#E0E0E0",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    stepContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontFamily: FONTS.RobotoRegular,
        color: "#333",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "#777",
        marginBottom: 20,
        fontFamily: FONTS.RobotoRegular,
    },
    // Time Picker Styles
    displayBox: {
        backgroundColor: "#F0F0F0",
        padding: 15,
        borderRadius: 8,
        marginBottom: 30,
    },
    displayText: {
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
        color: "#000",
    },
    pickerWrapper: {
        alignItems: "center",
        justifyContent: "center",
        height: PICKER_HEIGHT + 20,
    },
    pickerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: PICKER_HEIGHT,
    },
    pickerText: {
        fontSize: 20,
        color: "#999",
        fontFamily: FONTS.RobotoRegular,
    },
    selectedPickerText: {
        fontSize: 24,
        color: "#000",
        fontFamily: FONTS.RobotoBold,
    },
    separatorText: {
        fontSize: 24,
        color: "#000",
    },
    selectionOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    line: {
        width: 300,
        height: 1,
        backgroundColor: "#000",
    },

    // Place Input Styles
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        fontFamily: FONTS.RobotoRegular,
    },

    // Radio Button Styles
    radioGroup: {
        marginTop: 10,
    },
    radioButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
    },
    radioText: {
        fontSize: 16,
        color: "#333",
        fontFamily: FONTS.RobotoRegular,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#999",
        justifyContent: "center",
        alignItems: "center",
    },
    selectedRadioCircle: {
        borderColor: COLORS.primary,
    },
    radioInnerCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },

    // Raashi Grid Styles
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridItem: {
        width: "30%",
        backgroundColor: "#F9F9F9",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "transparent",
    },
    selectedGridItem: {
        backgroundColor: "rgba(233, 64, 87, 0.1)", // Light pink
        borderColor: COLORS.primary,
    },
    gridItemName: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: FONTS.RobotoMedium,
        color: "#333",
        textAlign: "center",
    },
    gridItemHindi: {
        fontSize: 12,
        color: "#777",
        textAlign: "center",
    },

    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    nextButtonText: {
        fontSize: 18,
        color: COLORS.white,
        fontFamily: FONTS.RobotoBold,
    },
});

export default AstroEditPopup;
