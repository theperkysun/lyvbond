import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

// if (Platform.OS === 'android') {
//     if (UIManager.setLayoutAnimationEnabledExperimental) {
//         UIManager.setLayoutAnimationEnabledExperimental(true);
//     }
// }

export default function HelpCategoryScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { category } = route.params; // Expecting the full category object

    const [expandedIds, setExpandedIds] = useState([]);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(itemId => itemId !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{category.title} Help</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.pageTitle}>Frequently Asked Questions</Text>
                <Text style={styles.subTitle}>Browsing {category.title} related topics</Text>

                {category.faqs.map((faq, index) => {
                    const faqId = faq._id || faq.id;
                    const isExpanded = expandedIds.includes(faqId);
                    return (
                        <TouchableOpacity
                            key={faqId}
                            style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                            activeOpacity={0.8}
                            onPress={() => toggleExpand(faqId)}
                        >
                            <View style={styles.questionRow}>
                                <Text style={styles.questionText}>{faq.question}</Text>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#666"
                                />
                            </View>
                            {isExpanded && (
                                <View style={styles.answerContainer}>
                                    <Text style={styles.answerText}>{faq.answer}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
    },
    content: {
        padding: 20,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        fontFamily: FONTS.RobotoBold,
    },
    subTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 25,
        fontFamily: FONTS.RobotoRegular,
    },
    faqCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.00,
        // Shadow for Android
        elevation: 2,
    },
    faqCardExpanded: {
        borderColor: COLORS.primary, // Highlight border when expanded
        borderWidth: 1,
    },
    questionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        paddingRight: 10,
        fontFamily: FONTS.RobotoMedium,
    },
    answerContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    answerText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        fontFamily: FONTS.RobotoRegular,
    },
});
