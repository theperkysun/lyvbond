import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';

export default function SearchOptionScreen({ route, navigation }) {
    const { title, options, selectedOptions, onSelect } = route.params;
    const [currentSelection, setCurrentSelection] = useState(selectedOptions || []);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setCurrentSelection(selectedOptions || []);
    }, [selectedOptions]);

    // Filter selections based on search
    // Note: options is an array of strings
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchText.toLowerCase())
    );

    const toggleSelection = (option) => {
        let newSel = [...currentSelection];

        if (option === "Open for all") {
            // Uncheck everything else, just select "Open for all"
            newSel = ["Open for all"];
        } else {
            // If user selects something else...
            // 1. Remove "Open for all" if present
            newSel = newSel.filter(item => item !== "Open for all");

            // 2. Toggle the selected option
            if (newSel.includes(option)) {
                newSel = newSel.filter(item => item !== option);
            } else {
                newSel.push(option);
            }

            // 3. If nothing is left selected, revert to "Open for all"
            if (newSel.length === 0) {
                newSel = ["Open for all"];
            }
        }
        setCurrentSelection(newSel);
    };

    const handleApply = () => {
        onSelect(currentSelection);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>

            {/* Curved Header */}
            <Header
                title={title || "Select Options"}
                onBackPress={() => navigation.goBack()}
            />

            {/* SEARCH BAR */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={24} color="#999" style={{ marginLeft: 10 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search..."
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Icon name="close" size={20} color="#999" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* SELECTED CHIPS */}
                {currentSelection.length > 0 && (
                    <View style={styles.chipsWrapper}>
                        <Text style={styles.sectionLabel}>Selected</Text>
                        <View style={styles.chipsContainer}>
                            {currentSelection.map((item) => (
                                <LinearGradient
                                    key={item}
                                    colors={[COLORS.primary, COLORS.primary + 'E6']} // Slightly lighter end
                                    style={styles.chip}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.chipText}>{item}</Text>
                                    {item !== "Open for all" && (
                                        <TouchableOpacity onPress={() => toggleSelection(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <Icon name="close" size={16} color="#fff" style={{ marginLeft: 6 }} />
                                        </TouchableOpacity>
                                    )}
                                </LinearGradient>
                            ))}
                        </View>
                    </View>
                )}

                {/* OPTIONS LIST */}
                <Text style={styles.sectionLabel}>Available Options</Text>
                <View style={styles.listContainer}>
                    {filteredOptions.map((opt, index) => {
                        const isSelected = currentSelection.includes(opt);
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[
                                    styles.optionRow,
                                    isSelected && styles.optionRowSelected,
                                    index === filteredOptions.length - 1 && { borderBottomWidth: 0 }
                                ]}
                                onPress={() => toggleSelection(opt)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionContent}>
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {opt}
                                    </Text>
                                </View>

                                {/* Checkbox / Radio Visual */}
                                <View style={[styles.checkBox, isSelected && styles.checkBoxSelected]}>
                                    {isSelected && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {filteredOptions.length === 0 && (
                        <Text style={styles.noResultText}>No options found matching "{searchText}"</Text>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FLOATING APPLY BUTTON */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.shadowWrapper}
                    activeOpacity={0.8}
                    onPress={handleApply}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primary]}
                        style={styles.applyBtn}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.applyText}>Apply Selection ({currentSelection.length})</Text>
                        <MaterialCommunityIcons name="check-all" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },

    // SEARCH
    searchContainer: {
        paddingHorizontal: 16,
        marginTop: 20, // Push down below header curve
        marginBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoRegular
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    // CHIPS
    chipsWrapper: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        color: '#888',
        fontFamily: FONTS.RobotoBold,
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        elevation: 2
    },
    chipText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONTS.RobotoMedium
    },

    // LIST
    listContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionRowSelected: {
        backgroundColor: COLORS.primary + '08', // Very light tint when selected
        borderRadius: 10,
        marginVertical: 2,
        paddingVertical: 14,
        borderBottomWidth: 0
    },
    optionContent: {
        flex: 1,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        fontFamily: FONTS.RobotoRegular,
    },
    optionTextSelected: {
        color: COLORS.primary,
        fontFamily: FONTS.RobotoBold,
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    checkBoxSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    noResultText: {
        textAlign: 'center',
        padding: 20,
        color: '#999',
        fontFamily: FONTS.RobotoRegular
    },

    // FOOTER
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    shadowWrapper: {
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        borderRadius: 30,
    },
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 250,
        height: 56,
        borderRadius: 28,
    },
    applyText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
    }
});
