import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS } from "../../../utlis/comon";

import CustomButton from "../../components/CommonComponents/CustomButton";
import Header from "../../components/CommonComponents/Header";

import { launchCamera, launchImageLibrary } from "react-native-image-picker";

const AddPhotoScreen = ({ navigation }) => {
  const route = useRoute();
  const userData = route.params || {};

  const [selectedImage, setSelectedImage] = useState(null);

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.8 },
      (response) => {
        if (!response.didCancel && response.assets?.length > 0) {
          setSelectedImage(response.assets[0].uri);
        }
      }
    );
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: "photo", quality: 0.8 },
      (response) => {
        if (!response.didCancel && response.assets?.length > 0) {
          setSelectedImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleSubmit = () => {
    // PASS DATA TO NEXT SCREEN
    const nextScreenPayload = {
      ...userData,
      profileImage: selectedImage || null,
    };
    navigation.navigate("AddSecondaryPhotosScreen", nextScreenPayload);
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Header
        title=""
        logo={require("../../../assets/images/LyvBondLogo.png")}
        rightText="Skip →"
        onRightPress={handleSubmit}
      />

      <View style={styles.content}>

        {/* IMAGE CIRCLE */}
        <View style={styles.photoWrapper}>
          <View style={styles.dottedCircle}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={95}
                color="#9e9e9e"
              />
            )}
          </View>

          {/* (+) BUTTON */}
          <TouchableOpacity style={styles.addButton} onPress={openGallery}>
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* TEXT */}
        <Text style={styles.title}>Add Photos{"\n"}to complete your Profile</Text>

        <Text style={styles.subText}>Photo Privacy controls available in Settings</Text>

        {/* GALLERY BUTTON */}
        <View style={{ width: "90%", alignSelf: "center" }}>
          <CustomButton
            title="Add from Gallery"
            paddingVertical={16}
            borderRadius={30}
            marginTop={25}
            onPress={openGallery}
          />
        </View>

        {/* CAMERA BUTTON */}
        <TouchableOpacity style={styles.cameraBtn} onPress={openCamera}>
          <MaterialCommunityIcons
            name="camera-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.cameraText}>Use Camera</Text>
        </TouchableOpacity>

      </View>

      {/* ================================
           BOTTOM BUTTON (CONDITIONAL)
         ================================= */}
      {selectedImage ? (
        // SHOW NEXT BUTTON AFTER IMAGE UPLOAD
        <View style={styles.bottomButtonContainer}>
          <CustomButton
            title="Next"
            paddingVertical={16}
            borderRadius={30}
            onPress={handleSubmit}
          />
        </View>
      ) : (
        // SHOW ADD PHOTOS LATER WHEN NO IMAGE
        <TouchableOpacity style={styles.skipLater} onPress={handleSubmit}>
          <Text style={styles.skipLaterText}>Add Photos Later →</Text>

        </TouchableOpacity>
      )}

    </View>
  );
};

export default AddPhotoScreen; const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  photoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
  },

  dottedCircle: {
    width: 170,
    height: 170,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cccccc",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -10,
  },

  title: {
    textAlign: "center",
    fontSize: 24,
    color: "#2d2d2d",
    marginTop: 20,
    fontFamily: FONTS.RobotoBold,
  },

  subText: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 8,
    fontFamily: FONTS.RobotoRegular,
  },

  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  cameraText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 16,
  },

  /* Bottom "Next" button container */
  bottomButtonContainer: {
    width: "90%",
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
  },

  /* Bottom skip text */
  skipLater: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },

  skipLaterText: {
    color: COLORS.grey,
    fontSize: 14,
    fontFamily: FONTS.RobotoMedium,
  },
});
