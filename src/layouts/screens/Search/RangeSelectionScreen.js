import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { COLORS, FONTS } from '../../../utlis/comon';

const { width } = Dimensions.get('window');

export default function RangeSelectionScreen({ route, navigation }) {
    const { title, range, min, max, step, type, onSelect } = route.params;
    // Ensure range is an array. If string comes in (legacy), default to min/max to avoid crash.
    const initialRange = Array.isArray(range) ? range : [min, max];
    const [currentRange, setCurrentRange] = useState(initialRange);

    const formatValue = (val) => {
        if (type === 'height') {
            const ft = Math.floor(val / 12);
            const inch = val % 12;
            return `${ft}'${inch}"`;
        }
        return `${val} yrs`; // Default to Age (yrs)
    };

    // Helper text logic
    const helperText = type === 'height'
        ? "Select a minimum height range of 6 inches to get relevant matches"
        : "Select a minimum age range of 3 years to get relevant matches";

    const labelTitle = type === 'height' ? "Select Height Range" : "Select Age Range";

    const handleApply = () => {
        onSelect(currentRange);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#fff' }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* 1. Helper Text at Top */}
                <Text style={styles.topHelperText}>
                    {helperText}
                </Text>

                {/* 2. Select ... Range Label */}
                <Text style={styles.rangeLabelTitle}>
                    {labelTitle}
                </Text>

                {/* 3. Big Bold Values */}
                <Text style={styles.bigValueText}>
                    {formatValue(currentRange[0])} - {formatValue(currentRange[1])}
                </Text>

                {/* 4. Slider */}
                <View style={styles.sliderContainer}>
                    <MultiSlider
                        values={currentRange}
                        onValuesChange={setCurrentRange}
                        min={min}
                        max={max}
                        step={step || 1}
                        sliderLength={width - 60}
                        selectedStyle={{ backgroundColor: COLORS.primary }}
                        trackStyle={{ height: 6, borderRadius: 10, backgroundColor: "#eaeaea" }}
                        markerStyle={styles.thumb}
                    />
                </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                    <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: COLORS.primary,
    },
    backBtn: {
        padding: 4
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'flex-start', // Align items to top
    },
    topHelperText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
        marginBottom: 30, // Spacing below helper
        lineHeight: 20
    },
    rangeLabelTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontWeight: '500'
    },
    bigValueText: {
        fontSize: 24, // Bigger size
        color: COLORS.black,
        fontWeight: 'bold', // Bold
        marginBottom: 40, // Spacing before slider
    },
    sliderContainer: {
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 20
    },
    thumb: {
        height: 28,
        width: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: "#fff",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 }
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cancelBtn: {
        flex: 1,
        marginRight: 8,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    applyBtn: {
        flex: 1,
        marginLeft: 8,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555'
    },
    applyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff'
    }
});
