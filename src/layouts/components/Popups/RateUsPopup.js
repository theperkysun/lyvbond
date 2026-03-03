import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Linking,
    Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { BASE_URL } from '../../../config/apiConfig';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const RateUsPopup = ({ visible, onClose }) => {
    const { userToken } = useAuth();
    const [rating, setRating] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [hasRatedBefore, setHasRatedBefore] = useState(false);
    const [storeUrls, setStoreUrls] = useState({
        androidStoreUrl: "market://details?id=com.lyvbond.app",
        iosStoreUrl: "itms-apps://itunes.apple.com/app/idYOUR_APP_ID?action=write-review"
    });
    const flipTimeout = useRef(null);

    // Fetch dynamic store URLs
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/settings`);
                if (response.data.success && response.data.settings) {
                    setStoreUrls({
                        androidStoreUrl: response.data.settings.androidStoreUrl,
                        iosStoreUrl: response.data.settings.iosStoreUrl
                    });
                }
            } catch (error) {
                console.log("Error fetching store URLs:", error);
            }
        };
        fetchSettings();
    }, []);

    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const flipAnim = useRef(new Animated.Value(0)).current;

    // Star animations (array of values)
    const starAnims = useRef([...Array(5)].map(() => new Animated.Value(1))).current;
    const iconAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Reset state initially unless we find they rated
            setRating(0);
            setShowBack(false);
            flipAnim.setValue(0);
            if (flipTimeout.current) clearTimeout(flipTimeout.current);

            const checkRating = async () => {
                if (userToken) {
                    try {
                        const response = await axios.get(`${BASE_URL}/app-rating`, {
                            headers: { Authorization: `Bearer ${userToken}` }
                        });
                        if (response.data.success && response.data.hasRated) {
                            setHasRatedBefore(true);
                            setRating(response.data.rating || 5);
                            // Open directly to the back card
                            flipAnim.setValue(180);
                            setShowBack(true);
                            scaleAnim.setValue(1);
                            return; // Halt front-animation
                        }
                    } catch (error) {
                        console.log("Error checking rating status:", error);
                    }
                }

                setHasRatedBefore(false);
                // Entry animation for front card
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }).start();
            };

            checkRating();
        } else {
            scaleAnim.setValue(0);
        }

        return () => {
            if (flipTimeout.current) clearTimeout(flipTimeout.current);
        };
    }, [visible, userToken]);

    useEffect(() => {
        if (showBack) {
            // Pulse animation for the result icon
            Animated.loop(
                Animated.sequence([
                    Animated.timing(iconAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(iconAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        } else {
            iconAnim.setValue(1);
        }
    }, [showBack]);

    const handleStarPress = (selectedRating) => {
        if (hasRatedBefore) return;

        setRating(selectedRating);

        // Animate selected stars
        const animations = starAnims.slice(0, selectedRating).map((anim, index) => {
            return Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1.5,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                })
            ]);
        });

        // Run star animations
        Animated.stagger(50, animations).start();

        // Clear any existing timer if user taps quickly again
        if (flipTimeout.current) clearTimeout(flipTimeout.current);

        // Give them 2 seconds to keep modifying. After 2 seconds, post rating & flip.
        flipTimeout.current = setTimeout(async () => {
            try {
                if (userToken) {
                    await axios.post(`${BASE_URL}/app-rating`,
                        { rating: selectedRating },
                        { headers: { Authorization: `Bearer ${userToken}` } }
                    );
                    setHasRatedBefore(true);
                }
            } catch (error) {
                console.log("Error submitting rating:", error);
            }

            flipCard();
        }, 2000);
    };

    const flipCard = () => {
        Animated.timing(flipAnim, {
            toValue: 180,
            duration: 800,
            useNativeDriver: true,
        }).start(() => {
            setShowBack(true);
        });
    };

    const handleRateNow = () => {
        const url = Platform.OS === 'android' ? storeUrls.androidStoreUrl : storeUrls.iosStoreUrl;
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
        onClose();
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });

    const backOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    // Content based on rating
    const getCloserContent = () => {
        switch (rating) {
            case 1:
                return {
                    icon: 'sad-outline',
                    color: '#E94057',
                    title: 'Oh no!',
                    text: 'We are sorry to hear that. Please let us know how we can improve.',
                    buttonText: 'Rate on Play Store',
                    isStore: true,
                    action: handleRateNow
                };
            case 2:
                return {
                    icon: 'alert-circle-outline',
                    color: '#FF8C00',
                    title: 'We can do better',
                    text: 'Your feedback is valuable to us. Please tell us what went wrong.',
                    buttonText: 'Rate on Play Store',
                    isStore: true,
                    action: handleRateNow
                };
            case 3:
                return {
                    icon: 'bandage-outline',
                    color: '#FFD700',
                    title: 'Room for improvement',
                    text: 'Thank you for your feedback. How can we make your experience 5-star?',
                    buttonText: 'Rate on Play Store',
                    isStore: true,
                    action: handleRateNow
                };
            case 4:
                return {
                    icon: 'thumbs-up-outline',
                    color: '#4CAF50',
                    title: 'Almost perfect!',
                    text: 'We are glad you like it! Would you mind rating us on the Play Store?',
                    buttonText: 'Rate on Play Store',
                    isStore: true,
                    action: handleRateNow
                };
            case 5:
                return {
                    icon: 'heart-outline',
                    color: '#E91E63',
                    title: 'We are Thrilled!',
                    text: 'You are awesome! Thank you for the love. Please rate us on the Play Store!',
                    buttonText: 'Rate on Play Store',
                    isStore: true,
                    action: handleRateNow
                };
            default:
                return {
                    icon: 'happy-outline',
                    color: '#FFD700',
                    title: 'Thank You!',
                    text: 'We appreciate your feedback!',
                    buttonText: 'Rate on Play Store',
                    isStore: true,
                    action: handleRateNow
                };
        }
    };

    const content = getCloserContent();

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none" // We handle animation manually
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <Animated.View style={[
                    styles.popupContainer,
                    { transform: [{ scale: scaleAnim }] }
                ]}>

                    {/* FRONT SIDE */}
                    <Animated.View
                        pointerEvents={showBack ? 'none' : 'auto'}
                        style={[
                            styles.cardSide,
                            {
                                opacity: frontOpacity,
                                transform: [{ rotateY: frontInterpolate }]
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={['#ffffff', '#f8f9fa']}
                            style={styles.gradient}
                        >
                            <TouchableOpacity style={styles.topCloseButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color="#ccc" />
                            </TouchableOpacity>
                            <View style={styles.iconVisual}>
                                <Ionicons name="chatbox-ellipses" size={50} color="#E94057" />
                            </View>
                            <Text style={styles.title}>Enjoying the App?</Text>
                            <Text style={styles.subtitle}>Tap a star to rate it on the PlayMarket.</Text>

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        activeOpacity={0.7}
                                        onPress={() => handleStarPress(item)}
                                    >
                                        <Animated.View style={{ transform: [{ scale: starAnims[item - 1] }] }}>
                                            <Ionicons
                                                name={rating >= item ? "star" : "star-outline"}
                                                size={40}
                                                color={rating >= item ? "#FFD700" : "#ccc"}
                                                style={styles.star}
                                            />
                                        </Animated.View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.laterButton}>
                                <Text style={styles.laterText}>Maybe Later</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Animated.View>

                    {/* BACK SIDE */}
                    <Animated.View
                        pointerEvents={showBack ? 'auto' : 'none'}
                        style={[
                            styles.cardSide,
                            styles.cardBack,
                            {
                                opacity: backOpacity,
                                transform: [{ rotateY: backInterpolate }]
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={['#ffffff', '#fff0f3']}
                            style={styles.gradient}
                        >
                            <TouchableOpacity style={styles.topCloseButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color="#ccc" />
                            </TouchableOpacity>
                            <Animated.View style={[styles.resultIconContainer, { transform: [{ scale: iconAnim }] }]}>
                                <Ionicons name={content.icon} size={60} color={content.color} />
                            </Animated.View>

                            <Text style={styles.title}>{content.title}</Text>
                            <Text style={styles.description}>{content.text}</Text>

                            <TouchableOpacity style={styles.rateButton} onPress={content.action}>
                                {content.isStore && (
                                    <Ionicons name="logo-google-playstore" size={20} color="#fff" style={{ marginRight: 10 }} />
                                )}
                                <Text style={styles.rateButtonText}>{content.buttonText}</Text>
                            </TouchableOpacity>

                        </LinearGradient>
                    </Animated.View>

                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    popupContainer: {
        width: width * 0.85,
        height: 480, // Fixed height for flip smoothness
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardSide: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backfaceVisibility: 'hidden', // Crucial for flip effect
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    gradient: {
        flex: 1,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconVisual: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff0f3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 40,
    },
    star: {
        marginHorizontal: 4,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    laterButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    laterText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '600',
    },
    // Back side styles
    cardBack: {
        // Absolute position is handled by cardSide
    },
    description: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    rateButton: {
        backgroundColor: '#E94057',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        elevation: 5,
        shadowColor: "#E94057",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    rateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedbackButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 50,
    },
    feedbackButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    resultIconContainer: {
        marginBottom: 20,
    },
    closeButtonBack: {
        marginTop: 20,
    },
    topCloseButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
        padding: 5,
    }
});

export default RateUsPopup;
