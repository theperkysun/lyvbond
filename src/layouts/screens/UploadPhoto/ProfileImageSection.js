import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS } from '../../../utlis/comon';

const { width } = Dimensions.get('window');

const ProfileImageSection = () => {
  const [imageUri, setImageUri] = useState(null);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Glowing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shadowOpacity, {
          toValue: 1.3,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shadowOpacity]);

  // Pulse animation (only before upload)
  useEffect(() => {
    if (!imageUri) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [imageUri, pulseValue]);

  const openGallery = () => {
    const options = { mediaType: 'photo', quality: 1 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('Image Picker Error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.88,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.profileWrapper,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <TouchableOpacity
          onPress={openGallery}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {/* Glowing ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: shadowOpacity.interpolate({
                  inputRange: [0.8, 1.3],
                  outputRange: [0.3, 0.8],
                }),
              },
            ]}
          />

          <View style={styles.shadowBase}>
            <LinearGradient
              colors={[
                COLORS.primary,
                `${COLORS.primary}E6`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCircle}
            >
              {imageUri ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.profileImage}
                  />
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <Animated.View
                    style={[
                      styles.iconContainer,
                      { transform: [{ scale: pulseValue }] },
                    ]}
                  >
                    <LinearGradient
                      colors={[COLORS.white, '#F5F5F5']}
                      style={styles.iconGradient}
                    >
                      <Icon
                        name="person-circle-outline"
                        size={88}
                        color={COLORS.primary}
                        style={styles.icon3d}
                      />
                    </LinearGradient>
                  </Animated.View>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  profileWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: COLORS.primary,
    top: -12,
    left: -12,
  },
  shadowBase: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  profileCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  imageWrapper: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: COLORS.bgcolor,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 77,
    backgroundColor: COLORS.bgcolor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  icon3d: {
    textShadowColor: `${COLORS.primary}33`,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 8,
  },
});

export default ProfileImageSection;
