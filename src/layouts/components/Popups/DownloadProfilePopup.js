import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import FileViewer from 'react-native-file-viewer';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';

const { width } = Dimensions.get('window');

const DownloadProfilePopup = ({ visible, onClose }) => {
    const { userToken } = useAuth();
    const [downloading, setDownloading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [savedPath, setSavedPath] = React.useState(null);

    // Reset state when opening
    React.useEffect(() => {
        if (visible) {
            setIsSuccess(false);
            setDownloading(false);
        }
    }, [visible]);

    const handleClose = () => {
        setIsSuccess(false);
        onClose();
    };

    const handleDownload = async () => {
        if (!userToken) return;
        setDownloading(true);

        try {
            // Permission checks
            if (Platform.OS === 'android' && Platform.Version < 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("Permission Denied", "Storage permission required.");
                    setDownloading(false);
                    return;
                }
            }

            const fileName = `MyProfile_${new Date().getTime()}.pdf`;
            const localPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

            const options = {
                fromUrl: `${BASE_URL}/user/download-profile`,
                toFile: localPath,
                headers: { Authorization: `Bearer ${userToken}` },
            };

            const response = await RNFS.downloadFile(options).promise;

            if (response.statusCode === 200) {
                setSavedPath(localPath);
                setIsSuccess(true); // Show Success UI
            } else {
                Alert.alert("Error", "Download failed. Status: " + response.statusCode);
                handleClose();
            }

        } catch (error) {
            console.error("Download Error:", error);
            Alert.alert("Error", "Something went wrong.");
            handleClose();
        } finally {
            setDownloading(false);
        }
    };

    const handleOpenPdf = async () => {
        if (!savedPath) return;
        try {
            await Share.open({
                url: `file://${savedPath}`,
                type: 'application/pdf',
                showAppsToView: true,
                title: 'Open PDF with'
            });
            handleClose();
        } catch (err) {
            console.log("Share error", err);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />

                <View style={styles.modalView}>
                    <View style={styles.dragHandle} />

                    {/* CLOSE BTN */}
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                        <Ionicons name="close" size={20} color="#888" />
                    </TouchableOpacity>

                    {isSuccess ? (
                        // SUCCESS VIEW
                        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark" size={40} color="#fff" />
                            </View>

                            <Text style={styles.modalTitle}>Download Successful!</Text>
                            <Text style={styles.modalSub}>Your profile has been saved to downloads.</Text>

                            <TouchableOpacity style={styles.downloadBtn} onPress={handleOpenPdf}>
                                <Ionicons name="document-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Open PDF</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.secondaryBtn]} onPress={handleClose}>
                                <Text style={styles.secondaryBtnText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // DOWNLOAD VIEW
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <View style={styles.headerIcon}>
                                <Ionicons name="cloud-download" size={36} color={COLORS.primary} />
                            </View>

                            <Text style={styles.modalTitle}>Download Profile</Text>
                            <Text style={styles.modalSub}>Save your profile as a PDF to share professionally.</Text>

                            <View style={styles.infoContainer}>
                                <InfoRow text="Share with prospects via WhatsApp, Email, or Chat." />
                                <InfoRow text="Ensure your details are up-to-date before downloading." />
                                <InfoRow text="Generated PDF includes your photos and bio." />
                            </View>

                            <TouchableOpacity
                                style={[styles.downloadBtn, downloading && styles.btnDisabled]}
                                onPress={downloading ? null : handleDownload}
                                disabled={downloading}
                                activeOpacity={0.8}
                            >
                                {downloading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="download-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.btnText}>Download PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.footerText}>
                                LyvBond System • Secure Download
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const InfoRow = ({ text }) => (
    <View style={styles.infoRow}>
        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
        <Text style={styles.infoText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject
    },
    modalView: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        paddingTop: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        marginBottom: 20
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 20
    },
    headerIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primary + '15', // 15% opacity hex
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    successIcon: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#4CAF50',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        color: '#222',
        fontFamily: FONTS.RobotoBold,
        marginBottom: 6
    },
    modalSub: {
        fontSize: 14,
        color: '#666',
        fontFamily: FONTS.RobotoRegular,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20
    },
    infoContainer: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#444',
        marginLeft: 10,
        fontFamily: FONTS.RobotoRegular,
        lineHeight: 20
    },
    downloadBtn: {
        width: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    btnDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.RobotoBold
    },
    secondaryBtn: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    secondaryBtnText: {
        color: '#666',
        fontSize: 16,
        fontFamily: FONTS.RobotoMedium
    },
    footerText: {
        marginTop: 20,
        fontSize: 11,
        color: '#aaa',
        fontFamily: FONTS.RobotoMedium
    }
});

export default DownloadProfilePopup;
