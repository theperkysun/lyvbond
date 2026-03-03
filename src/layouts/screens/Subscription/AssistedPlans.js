import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { COLORS, FONTS } from '../../../utlis/comon';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AssistedPlans({ plansData, logo }) {
    if (!plansData || plansData.length === 0) {
        return (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading Plans...</Text>
            </View>
        );
    }

    const plan = plansData[0];
    const price = plan.price;
    const title = plan.title;
    const features = plan.features || [];

    return (
        <View style={{ marginTop: 20 }}>

            <View style={styles.card}>
                <Image
                    source={logo ? { uri: logo } : require('../../../assets/images/LyvBondLogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.startingRow}>
                    <View style={styles.line} />

                    <Text style={styles.starting}>{title}</Text>

                    <View style={styles.line} />
                </View>


                <Text style={styles.price}>{price}</Text>

                <View style={styles.features}>
                    {features.map((f, i) => (
                        <Feature key={i} text={f.text} />
                    ))}
                </View>

                <TouchableOpacity style={styles.continueBtn}>
                    <Ionicons name="call" size={18} color="#fff" />
                    <Text style={styles.continueText}>Book FREE Consultation</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

function Feature({ text }) {
    return (
        <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center'
    },

    logo: {
        width: 140,
        height: 70,
        marginBottom: 8,
    },

    startingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginVertical: 12,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#e6e6e6',
        marginHorizontal: 10,
    },

    starting: {
        fontSize: 14,
        color: '#666',
        fontFamily: FONTS.RobotoMedium,
        textTransform: 'uppercase',
        letterSpacing: 1
    },

    price: {
        fontSize: 32,
        fontFamily: FONTS.RobotoBold,
        color: '#000',
        marginBottom: 20,
    },

    features: {
        width: '100%',
        marginVertical: 10,
    },

    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    featureText: {
        marginLeft: 12,
        fontSize: 15,
        color: '#444',
        fontFamily: FONTS.RobotoRegular,
    },

    continueBtn: {
        backgroundColor: COLORS.primary,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },

    continueText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
        marginLeft: 8,
    },
});
