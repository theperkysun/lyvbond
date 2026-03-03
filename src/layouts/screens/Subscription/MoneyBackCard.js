import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function MoneyBackCard() {
    return (
        <View style={styles.card}>

            <Image
                source={require('../../../assets/images/money_back.png')}
                style={styles.icon}
            />

            <Text style={styles.title}>Money Back Guarantee</Text>

            <Text style={styles.desc}>
                If you do not find a match within 30 days, get a full refund without any questions asked
            </Text>

            <View style={styles.featuresRow}>
                <View style={styles.feat}>
                    <Image source={require('../../../assets/images/best_matches.png')} style={styles.featIcon} />
                    <Text style={styles.featText}>Best Matches</Text>
                </View>

                <View style={styles.feat}>
                    <Image source={require('../../../assets/images/verified_profiles.png')} style={styles.featIcon} />
                    <Text style={styles.featText}>Verified Profiles</Text>
                </View>

                <View style={styles.feat}>
                    <Image source={require('../../../assets/images/privacy_lock.png')} style={styles.featIcon} />
                    <Text style={styles.featText}>100% Privacy</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 20,
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
        backgroundColor: '#FFF',
        elevation: 5,
    },
    icon: {
        width: 110,
        height: 110,
        alignSelf: 'center',
    },
    title: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 20,
        fontWeight: '700',
    },
    desc: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 25,
    },
    feat: {
        alignItems: 'center',
    },
    featIcon: {
        width: 40,
        height: 40,
    },
    featText: {
        marginTop: 6,
        fontSize: 13,
        color: '#444',
    },
});
