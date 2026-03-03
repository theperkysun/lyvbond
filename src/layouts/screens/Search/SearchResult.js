import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, FlatList, Dimensions, Text, Animated, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import { COLORS } from '../../../utlis/comon';
import Swiper from "react-native-deck-swiper";
import Icon from "react-native-vector-icons/MaterialIcons";
import MatchesProfileCard from "../../components/HomScreenComponents/MatchesProfileCard";
import MatchService from "../../../services/MatchService";
import { useFocusEffect } from "@react-navigation/native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SearchResult({ route, navigation }) {
    const { searchPayload } = route.params || {};

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const swiperRef = useRef(null);

    const [hearts, setHearts] = useState([]);
    const [cardIndex, setCardIndex] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalFound, setTotalFound] = useState(0);

    const calculateAge = (dob) => {
        if (!dob || !dob.year) return "";
        const currentYear = new Date().getFullYear();
        return currentYear - parseInt(dob.year);
    };

    const mapUserToCard = (user) => {
        let locationString = "Not Specified";
        if (user.location) {
            const { city, state, country } = user.location;
            locationString = [city, state, country].filter(Boolean).join(", ");
        }

        let allImages = [];
        if (user.profileImage) {
            allImages.push(user.profileImage);
        }
        if (Array.isArray(user.images)) {
            user.images.forEach(img => {
                const imgUrl = typeof img === 'object' ? img.uri : img;
                if (imgUrl && !allImages.includes(imgUrl)) {
                    allImages.push(imgUrl);
                }
            });
        }

        let formattedImages = allImages.map(img => ({ uri: img }));

        return {
            ...user, // Spread user first so explicit mapping overrides it
            id: user._id,
            userId: user._id,
            name: user.name || user.firstName || "User",
            age: calculateAge(user.dob),
            img: user.profileImage ? { uri: user.profileImage } : null,
            url: user.profileImage,
            images: formattedImages,
            height: user.partnerPreferences?.heightRange || user.preferences?.height || user.partnerPreferences?.height || "N/A",
            location: locationString,
            work: user.education?.profession || user.education?.workType || "N/A",
            religion: user.partnerPreferences?.religion?.[0] || user.religiousInfo?.religion || "N/A",
        };
    };

    const executeSearch = async () => {
        try {
            const data = await MatchService.searchMatches(searchPayload || {});
            if (data && data.matches) {
                setSearchResults(data.matches.map(mapUserToCard));
                setTotalFound(data.count || data.matches.length);
            }
        } catch (error) {
            console.log("Search API error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        executeSearch();
    }, [searchPayload]);

    const DATA = searchResults.length > 0 ? searchResults : [];

    // Animation Effect loops
    useEffect(() => {
        const loop = () => {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -6, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            ]).start(() => setTimeout(loop, 2000));
        };
        loop();

        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleHeartPress = () => {
        const id = Date.now();
        const translateY = new Animated.Value(0);
        const opacity = new Animated.Value(1);
        const scale = new Animated.Value(1);

        setHearts(prev => [...prev, { id, translateY, opacity, scale }]);

        Animated.parallel([
            Animated.timing(translateY, { toValue: -400, duration: 1500, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 2, duration: 1500, useNativeDriver: true }),
        ]).start(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        });
    };

    const handleLike = () => swiperRef.current?.swipeRight();
    const handleDislike = () => swiperRef.current?.swipeLeft();
    const handleSuperLike = () => swiperRef.current?.swipeTop();

    const renderMainContent = () => {
        if (loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#888' }}>Searching...</Text>
                </View>
            );
        }

        if (!loading && DATA.length === 0) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="search-off" size={80} color="#ccc" />
                    <Text style={{ marginTop: 20, fontSize: 18, color: '#888' }}>No users matched your criteria</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                        <Text style={{ color: COLORS.primary, fontSize: 16 }}>Go back & modify filters</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.swiperContainer}>
                    <Swiper
                        ref={swiperRef}
                        containerStyle={{ marginTop: 0 }}
                        cards={DATA}
                        stackSize={2}
                        stackSeparation={-30}
                        stackScale={0.95}
                        renderCard={(card) => (
                            <MatchesProfileCard
                                card={card}
                                onPress={() => navigation.navigate("UserDetailsScreen", { user: card })}
                                showConnectButton={false}
                                showOnlineStatus={false}
                                containerHeight={SCREEN_HEIGHT * 0.68} // Increased custom height specifically for SearchResult
                            />
                        )}
                        infinite={false}
                        previousCardDefaultPositionY={2}
                        onSwipedAll={() => console.log('Finished showing search results')}
                        cardIndex={0}
                        backgroundColor={'transparent'}
                        onSwiped={index => {
                            if (index === DATA.length - 2) setCardIndex(true);
                            if (index === DATA.length - 1) {
                                setTimeout(() => {
                                    if (swiperRef.current) swiperRef.current.jumpToCardIndex(DATA.length - 2);
                                }, 0);
                            }
                        }}
                        onSwipedLeft={(index) => {
                            const user = DATA[index];
                            if (user) MatchService.swipeUser(user._id, 'dislike');
                        }}
                        onSwipedRight={(index) => {
                            handleHeartPress();
                            const user = DATA[index];
                            if (user) MatchService.swipeUser(user._id, 'like');
                        }}
                        onSwipedTop={(index) => {
                            const user = DATA[index];
                            if (user) MatchService.swipeUser(user._id, 'superlike');
                        }}
                        overlayLabels={{
                            left: {
                                element: <Icon name="close" size={80} color="red" />,
                                style: { wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 } },
                            },
                            right: {
                                element: <Icon name="favorite" size={80} color="green" />,
                                style: { wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 } },
                            },
                            top: {
                                element: <Icon name="star" size={80} color="#8A2387" />,
                                style: { wrapper: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30 } },
                            },
                        }}
                        disableTopSwipe={cardIndex}
                        disableBottomSwipe={cardIndex}
                        disableLeftSwipe={cardIndex}
                        disableRightSwipe={cardIndex}
                    />
                </View>

                {/* FLOATING HEARTS */}
                {hearts.map(h => (
                    <Animated.View
                        key={h.id}
                        style={{
                            position: "absolute",
                            bottom: 120,
                            alignSelf: "center",
                            transform: [{ translateY: h.translateY }, { scale: h.scale }],
                            opacity: h.opacity,
                            zIndex: 999,
                        }}
                    >
                        <Icon name="favorite" size={40} color="#E94057" />
                    </Animated.View>
                ))}

                {/* BOTTOM BUTTONS EXPLICITLY SAME DESIGN */}
                <View style={styles.bottomWrapper}>
                    <View style={styles.bottomRow}>
                        <TouchableOpacity style={styles.smallButton} onPress={handleDislike}>
                            <Icon name="close" size={40} color={"#F27121"} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLike} style={styles.bigButton}>
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <Icon name="favorite" size={60} color={"#fff"} />
                            </Animated.View>
                        </TouchableOpacity>

                        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                            <TouchableOpacity style={styles.smallButton} onPress={handleSuperLike}>
                                <Icon name="star" size={30} color={"#8A2387"} />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ marginTop: Platform.OS === 'android' ? -5 : 0 }}>
                <Header
                    title="Search Result"
                    subTitle={`(${totalFound} Profiles)`}
                    icon={true} // Enables filter icon (tune) to tweak filters if needed by triggering back or options
                    onBack={() => navigation.goBack()}
                />
            </View>
            <View style={styles.listContainer}>
                {renderMainContent()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContainer: {
        flex: 1,
        marginTop: 5, // Reduced space to push card higher
    },
    swiperContainer: {
        flex: 1,
        marginTop: -25, // Adjusted to push the card higher and reduce empty top space
        overflow: 'visible',
        zIndex: 1,
    },
    bottomWrapper: {
        position: "absolute",
        bottom: 50, // Added more padding to the bottom so it doesn't touch the screen edge
        width: "100%",
        zIndex: 999,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 40,
        alignItems: "center",
    },
    smallButton: {
        backgroundColor: "#fff",
        height: 67,
        width: 67,
        borderRadius: 300,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#f56c7c",
        shadowOpacity: 0.35,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    bigButton: {
        backgroundColor: "#E94057",
        height: 90,
        width: 90,
        borderRadius: 300,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        shadowColor: "#f56c7c",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
});
