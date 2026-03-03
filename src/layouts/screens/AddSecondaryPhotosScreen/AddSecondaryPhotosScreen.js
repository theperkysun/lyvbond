import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS } from "../../../utlis/comon";
import CustomButton from "../../components/CommonComponents/CustomButton";
import Header from "../../components/CommonComponents/Header";
import { launchImageLibrary } from "react-native-image-picker";

const AddSecondaryPhotosScreen = ({ navigation }) => {
    const route = useRoute();
    const userData = route.params || {};

    // Store secondary images in an array
    const [secondaryImages, setSecondaryImages] = useState([]);

    const pickImages = () => {
        // Determine how many slots are left (max 5 slots since 1 is primary)
        const remainingSlots = 5 - secondaryImages.length;
        if (remainingSlots <= 0) return;

        launchImageLibrary(
            { mediaType: "photo", selectionLimit: remainingSlots, quality: 0.8 },
            (response) => {
                if (!response.didCancel && response.assets?.length > 0) {
                    const newUris = response.assets.map((asset) => asset.uri);
                    setSecondaryImages((prev) => [...prev, ...newUris].slice(0, 5));
                }
            }
        );
    };

    const removeImage = (indexToRemove) => {
        setSecondaryImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = () => {
        // Next screen
        const nextScreenPayload = {
            ...userData,
            images: secondaryImages, // Pass secondary images Array
        };
        navigation.navigate("AboutYourselfScreen", nextScreenPayload);
    };

    return (
        <View style={styles.container}>
            <Header
                title="Add More Photos"
                logo={require("../../../assets/images/LyvBondLogo.png")}
                rightText="Skip →"
                onRightPress={handleSubmit}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Boost Your Matches!</Text>
                <Text style={styles.subText}>Profiles with 3+ photos get 80% more attention.</Text>

                <View style={styles.gridContainer}>
                    {/* Slot 1: Primary Image */}
                    <View style={styles.imageSlot}>
                        {userData.profileImage ? (
                            <Image source={{ uri: userData.profileImage }} style={styles.imageFull} />
                        ) : (
                            <View style={[styles.imageFull, { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }]}>
                                <MaterialCommunityIcons name="account" size={40} color="#ccc" />
                            </View>
                        )}
                        <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                    </View>

                    {/* Slots 2-6: Secondary Images */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        const hasImage = !!secondaryImages[index];

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.imageSlot}
                                onPress={hasImage ? null : pickImages}
                                activeOpacity={hasImage ? 1 : 0.7}
                            >
                                {hasImage ? (
                                    <>
                                        <Image source={{ uri: secondaryImages[index] }} style={styles.imageFull} />
                                        <TouchableOpacity
                                            style={styles.removeBtn}
                                            onPress={() => removeImage(index)}
                                        >
                                            <MaterialCommunityIcons name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.emptySlotContent}>
                                        <MaterialCommunityIcons name="plus" size={30} color={COLORS.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </ScrollView>

            <View style={styles.bottomButtonContainer}>
                {secondaryImages.length > 0 ? (
                    <CustomButton
                        title="Continue"
                        paddingVertical={16}
                        borderRadius={30}
                        onPress={handleSubmit}
                    />
                ) : (
                    <TouchableOpacity style={styles.skipLater} onPress={handleSubmit}>
                        <Text style={styles.skipLaterText}>I only have one photo for now →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default AddSecondaryPhotosScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    content: { padding: 20, paddingBottom: 100 },
    title: { textAlign: "center", fontSize: 24, color: "#2d2d2d", fontFamily: FONTS.RobotoBold, marginBottom: 8 },
    subText: { textAlign: "center", fontSize: 14, color: COLORS.grey, fontFamily: FONTS.RobotoRegular, marginBottom: 30 },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    imageSlot: {
        width: "31%", // 3 columns
        aspectRatio: 0.75, // taller than wide
        backgroundColor: "#F4F6F8",
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E0E0E0",
        overflow: "hidden",
        position: "relative",
    },
    imageFull: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    emptySlotContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    removeBtn: {
        position: "absolute",
        bottom: -5,
        right: -5,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    primaryBadge: {
        position: "absolute",
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderTopRightRadius: 8,
    },
    primaryBadgeText: {
        color: "#FFF",
        fontSize: 10,
        fontFamily: FONTS.RobotoMedium,
    },
    bottomButtonContainer: { position: "absolute", bottom: 20, width: "90%", alignSelf: "center" },
    skipLater: { alignSelf: "center", paddingVertical: 15 },
    skipLaterText: { color: COLORS.grey, fontSize: 14, fontFamily: FONTS.RobotoMedium },
});
