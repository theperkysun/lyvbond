import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Linking,
    Image,        // ✅ ADDED
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS, FONTS } from '../../../utlis/comon';
import { useNavigation } from '@react-navigation/native'; // Add Navigation for consistency if needed

export default function FooterSection() {
    // Navigation if passed prop isn't used or needed
    const navigation = useNavigation();

    // OPEN APP LINKS
    const openInstagram = () => Linking.openURL("https://www.instagram.com/");
    const openFacebook = () => Linking.openURL("https://www.facebook.com/");
    const openYoutube = () => Linking.openURL("https://www.youtube.com/");
    const openTwitterX = () => Linking.openURL("https://twitter.com/");

    return (
        <View style={styles.container}>

            {/* VIP Card */}
            <View style={styles.cardContainer}>
                <ImageBackground
                    source={require('../../../assets/images/vip_bg.png')}
                    style={styles.vipCard}
                    imageStyle={{ borderRadius: 24 }} // Match ProfileTopSection radius
                >
                    <TouchableOpacity
                        style={styles.knowMoreBtn}
                        onPress={() => navigation.navigate("SubscriptionScreen", { openTab: 'assisted' })}
                    >
                        <Text style={styles.knowMoreText}>Explore VIP Plans</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </ImageBackground>
            </View>

            {/* Follow Us Section */}
            <Text style={styles.followTitle}>Follow us on</Text>

            <View style={styles.iconRow}>

                {/* Instagram */}
                <TouchableOpacity style={styles.iconBox} onPress={openInstagram}>
                    <FontAwesome name="instagram" size={20} color="#333" />
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity style={styles.iconBox} onPress={openFacebook}>
                    <FontAwesome name="facebook" size={20} color="#333" />
                </TouchableOpacity>

                {/* YouTube */}
                <TouchableOpacity style={styles.iconBox} onPress={openYoutube}>
                    <FontAwesome name="youtube-play" size={20} color="#333" />
                </TouchableOpacity>

                {/* Replace X Icon with PNG Image */}
                <TouchableOpacity style={styles.iconBox} onPress={openTwitterX}>
                    <Image
                        source={require('../../../assets/images/twitter.png')}
                        style={{ width: 18, height: 18, resizeMode: 'contain' }}
                    />
                </TouchableOpacity>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 28,
        paddingHorizontal: 18,
        paddingBottom: 40,
    },

    vipCard: {
        height: 200, // Slightly compact
        borderRadius: 24,
        justifyContent: 'flex-end',
        padding: 20,
        overflow: 'hidden',
    },

    // Added container for shadow on the card itself since ImageBackground handles inner content
    cardContainer: {
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: '#fff', // needed for shadow on iOS
    },

    knowMoreBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30, // Pill shape
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 10
    },

    knowMoreText: {
        fontSize: 14,
        fontFamily: FONTS.RobotoBold,
        color: '#fff',
    },

    followTitle: {
        marginTop: 30,
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
        color: COLORS.black,
        letterSpacing: 0.5
    },

    iconRow: {
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    iconBox: {
        backgroundColor: '#fff',
        width: 48,
        height: 48,
        borderRadius: 16, // Sqircle
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        // Soft Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
});
