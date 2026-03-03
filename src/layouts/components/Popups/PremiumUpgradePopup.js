import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS } from '../../../utlis/comon';
import CustomButton from '../CommonComponents/CustomButton';

const { width } = Dimensions.get('window');

const PremiumUpgradePopup = ({ visible, onClose, user, onViewPlans }) => {
    // Fallback user if null (prevents Modal from not rendering)
    const displayUser = user || {
        name: "Unknown User",
        profileImage: null,
        gender: "Male"
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.container}>

                    {/* HEADER BACKGROUND */}
                    <View style={styles.headerBg}>
                        <View style={styles.headerRow}>
                            <Text style={styles.headerTitle}>
                                {displayUser.gender === 'Female' ? "Contact her directly," : "Contact him directly,"}{"\n"}Upgrade Now
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* FLOATING CARD */}
                    <View style={styles.card}>
                        <View style={styles.profileRow}>
                            <Image
                                source={{ uri: displayUser.profileImage || 'https://via.placeholder.com/150' }}
                                style={styles.avatar}
                            />
                            <View style={styles.infoCol}>
                                <Text style={styles.name}>{displayUser.name || displayUser.firstName || "Unknown User"}</Text>

                                {/* MASKED CONTACT INFO */}
                                <View style={styles.maskedRow}>
                                    <Text style={styles.maskedText}>+91-78********</Text>
                                </View>
                                <View style={styles.maskedRow}>
                                    <Text style={styles.maskedText}>********@gmail.com</Text>
                                </View>
                            </View>
                        </View>

                        {/* ACTION ICONS ROW */}
                        <View style={styles.iconsRow}>
                            <View style={styles.iconItem}>
                                <Ionicons name="chatbubble-ellipses" size={24} color="#2196F3" />
                                <Text style={styles.iconLabel}>Message</Text>
                            </View>
                            <View style={styles.iconItem}>
                                <Ionicons name="logo-whatsapp" size={24} color="#4CAF50" />
                                <Text style={styles.iconLabel}>WhatsApp</Text>
                            </View>
                            <View style={styles.iconItem}>
                                <Ionicons name="videocam" size={24} color="#2196F3" />
                                <Text style={styles.iconLabel}>Video</Text>
                            </View>
                            <View style={styles.iconItem}>
                                <Ionicons name="call" size={24} color="#00BCD4" />
                                <Text style={styles.iconLabel}>Call</Text>
                            </View>
                        </View>
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <View style={styles.saveTextContainer}>
                            <Text style={styles.saveText}>Save upto <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>85%</Text> today!</Text>
                        </View>

                        <CustomButton
                            title="View Plans"
                            onPress={() => {
                                onClose();
                                if (onViewPlans) onViewPlans();
                            }}
                            borderRadius={30}
                            paddingVertical={15}
                        />
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'visible',
    },
    headerBg: {
        backgroundColor: COLORS.primary,
        padding: 20,
        paddingBottom: 60, // Space for the overlapping card
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.RobotoBold,
        color: '#fff',
        lineHeight: 28,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: -40, // Overlap the header
        borderRadius: 15,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#fff',
    },
    infoCol: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        color: '#333',
        marginBottom: 4,
    },
    maskedRow: {
        marginTop: 2,
    },
    maskedText: {
        fontSize: 14,
        color: '#999',
        fontFamily: FONTS.RobotoMedium,
    },
    iconsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 15,
    },
    iconItem: {
        alignItems: 'center',
    },
    iconLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontFamily: FONTS.RobotoRegular,
    },
    footer: {
        padding: 20,
        paddingTop: 30, // Space below card
    },
    saveTextContainer: {
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    saveText: {
        fontSize: 16,
        fontFamily: FONTS.RobotoBold,
        color: '#333',
    },
});

export default PremiumUpgradePopup;
