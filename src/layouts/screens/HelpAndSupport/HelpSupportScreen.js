import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, TextInput, Linking, Modal, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../config/apiConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS } from '../../../utlis/comon';
import { HELP_CATEGORIES, POPULAR_FAQS } from './HelpSupportData';

export default function HelpSupportScreen() {
    const navigation = useNavigation();
    const { userToken } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();
    const [expandedIds, setExpandedIds] = useState([]);
    const [allFaqs, setAllFaqs] = useState([]);
    const [popularFaqs, setPopularFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [tickets, setTickets] = useState([]);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [issueTitle, setIssueTitle] = useState('');
    const [issueMessage, setIssueMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchTickets();
        }, [])
    );

    React.useEffect(() => {
        fetchFAQs();
    }, [searchQuery]);

    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/support-chat/tickets`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            if (response.data.success) {
                setTickets(response.data.tickets);
            }
        } catch (error) {
            console.error("Error fetching Support Tickets:", error);
        }
    };

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const url = searchQuery
                ? `${BASE_URL}/faq?search=${searchQuery}`
                : `${BASE_URL}/faq`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                setAllFaqs(response.data.faqs);
                if (!searchQuery) {
                    setPopularFaqs(response.data.faqs.filter(f => f.isPopular));
                }
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter categories or FAQs based on search
    const getFilteredContent = () => {
        if (!searchQuery) {
            // merge base categories with empty arrays for FAQS
            const mergedCategories = HELP_CATEGORIES.map(cat => ({
                ...cat,
                faqs: allFaqs.filter(faq => faq.category === cat.title)
            }));
            return { categories: mergedCategories, faqs: popularFaqs };
        }

        const lowerQuery = searchQuery.toLowerCase();

        // FAQs are already filtered by the backend if we use it, but since we rely on setState it might be delayed.
        // allFaqs has the search result from backend
        const filteredFaqs = allFaqs;

        // Also filter categories
        const filteredCategories = HELP_CATEGORIES.map(cat => ({
            ...cat,
            faqs: allFaqs.filter(faq => faq.category === cat.title)
        })).filter(cat =>
            cat.title.toLowerCase().includes(lowerQuery) ||
            cat.description.toLowerCase().includes(lowerQuery) ||
            cat.faqs.length > 0
        );

        return { categories: filteredCategories, faqs: filteredFaqs };
    };

    const { categories, faqs } = getFilteredContent();

    const handleCategoryPress = (category) => {
        navigation.navigate('HelpCategoryScreen', { category });
    };

    const toggleExpand = (id) => {
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(itemId => itemId !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const handleContact = (type) => {
        if (type === 'chat') {
            const hasInProgress = tickets.some(t => t.status === 'in_progress');
            if (hasInProgress) {
                Alert.alert(
                    "Issue in progress",
                    "You already have an Issue in progress. If it is fixed, then you can generate a new issue."
                );
            } else {
                setShowTicketModal(true);
            }
        } else if (type === 'email') {
            Linking.openURL('mailto:help@lyvbond.com?subject=Support Request');
        }
    };

    const submitNewTicket = async () => {
        if (!issueTitle.trim() || !issueMessage.trim()) {
            Alert.alert("Validation", "Please provide a title and describe your issue.");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/support-chat/tickets`,
                { title: issueTitle, message: issueMessage },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            if (response.data.success) {
                setShowTicketModal(false);
                setIssueTitle('');
                setIssueMessage('');
                fetchTickets();
                const newTicket = response.data.ticket;
                navigation.navigate('SupportChatScreen', {
                    ticketId: newTicket._id,
                    status: newTicket.status,
                    title: newTicket.title
                });
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to create ticket.");
        }
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <View style={{ height: insets.top, backgroundColor: COLORS.primary }} />
            <LinearGradient
                colors={[COLORS.primary, COLORS.primary]} // Revert to solid primary
                style={styles.header}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.backBtnCircle}>
                            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help Center</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search Bar Embedded in Header */}
                <View style={styles.searchSection}>
                    <Text style={styles.searchTitle}>How can we help today?</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Search issues, topics..."
                            placeholderTextColor="#999"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Curved Bottom */}
            <View style={styles.headerCurveContainer}>
                <View style={styles.headerCurve} />
            </View>
        </View>
    );

    const renderIcon = (type, name, size, color) => {
        switch (type) {
            case 'MaterialCommunityIcons': return <MaterialCommunityIcons name={name} size={size} color={color} />;
            case 'MaterialIcons': return <MaterialIcons name={name} size={size} color={color} />;
            case 'FontAwesome5': return <FontAwesome5 name={name} size={size} color={color} />;
            case 'Ionicons': return <Ionicons name={name} size={size} color={color} />;
            default: return <Ionicons name="help-circle" size={size} color={color} />;
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.9}
            onPress={() => handleCategoryPress(item)}
        >
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.categoryGradient}
            >
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={[COLORS.primary + '20', COLORS.primary + '10']}
                        style={styles.iconCircle}
                    >
                        {renderIcon(item.iconType, item.iconName, 24, COLORS.primary)}
                    </LinearGradient>
                </View>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <Text style={styles.categoryDesc} numberOfLines={2}>{item.description}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderFAQItem = (item) => {
        const id = item._id || item.id; // Support both backend and mock IDs
        const isExpanded = expandedIds.includes(id);
        return (
            <TouchableOpacity
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                key={id}
                activeOpacity={0.8}
                onPress={() => toggleExpand(id)}
            >
                <View style={styles.faqHeader}>
                    <View style={styles.faqIconBox}>
                        <MaterialIcons name="article" size={18} color={isExpanded ? COLORS.primary : '#ccc'} />
                    </View>
                    <Text style={[styles.faqQuestion, isExpanded && { color: COLORS.primary }]}>{item.question}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={isExpanded ? COLORS.primary : "#999"}
                    />
                </View>
                {isExpanded && (
                    <View style={styles.faqBody}>
                        <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {renderHeader()}

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Categories Grid */}
                {categories.length > 0 && (
                    <>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="grid-large" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionHeader}>Browse Topics</Text>
                        </View>
                        <View style={styles.gridContainer}>
                            {categories.map((item) => (
                                <View key={item.id} style={styles.gridWrapper}>
                                    {renderCategoryItem({ item })}
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* FAQs */}
                {faqs.length > 0 && (
                    <>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="comment-question-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionHeader}>{searchQuery ? 'Top Results' : 'Popular Questions'}</Text>
                        </View>
                        <View style={styles.faqList}>
                            {faqs.slice(0, searchQuery ? 10 : 5).map(renderFAQItem)}
                        </View>
                    </>
                )}

                {/* Still Need Help */}
                <View style={styles.contactSection}>
                    <View style={styles.sectionTitleRow}>
                        <MaterialCommunityIcons name="headset" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionHeader}>Still need help?</Text>
                    </View>
                    <View style={styles.contactRow}>

                        <TouchableOpacity
                            style={styles.contactCard}
                            activeOpacity={0.9}
                            onPress={() => handleContact('chat')}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.primary]} // Revert to solid primary
                                style={styles.contactGradient}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="chatbubbles" size={24} color="#fff" />
                                <Text style={styles.contactTitleBtn}>Chat With Us</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.contactCardOutline}
                            activeOpacity={0.8}
                            onPress={() => handleContact('email')}
                        >
                            <MaterialCommunityIcons name="email-check" size={24} color={COLORS.primary} />
                            <Text style={styles.contactTitleOutline}>Email Support</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* Previous Issues Section */}
                {tickets.length > 0 && (
                    <View style={styles.ticketsSection}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionHeader}>Previous Issues</Text>
                        </View>
                        {tickets.map((ticket) => (
                            <TouchableOpacity
                                key={ticket._id}
                                style={styles.ticketCard}
                                onPress={() => navigation.navigate('SupportChatScreen', {
                                    ticketId: ticket._id,
                                    status: ticket.status,
                                    title: ticket.title
                                })}
                            >
                                <View style={styles.ticketInfo}>
                                    <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                                    <Text style={styles.ticketNumber}>{ticket.ticketNumber} • {new Date(ticket.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.ticketStatusContainer}>
                                    <Text style={[
                                        styles.ticketStatus,
                                        { color: ticket.status === 'solved' ? '#28a745' : '#f39c12' }
                                    ]}>
                                        {ticket.status === 'solved' ? "Solved" : "In Progress"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Footer space */}
                <View style={{ height: 40 }} />

            </ScrollView>

            {/* Create Ticket Modal */}
            <Modal
                visible={showTicketModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTicketModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Create a Support Issue</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Issue Title"
                            placeholderTextColor="#999"
                            value={issueTitle}
                            onChangeText={setIssueTitle}
                        />

                        <TextInput
                            style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Describe your issue..."
                            placeholderTextColor="#999"
                            value={issueMessage}
                            onChangeText={setIssueMessage}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTicketModal(false)}>
                                <Text style={styles.modalCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalSubmitBtn} onPress={submitNewTicket}>
                                <Text style={styles.modalSubmitTxt}>Create Issue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    headerWrapper: {
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    header: {
        paddingTop: 10,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    backButton: {
    },
    backBtnCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.RobotoBold,
        letterSpacing: 0.5
    },
    searchSection: {
        alignItems: 'center'
    },
    searchTitle: {
        fontSize: 22,
        color: '#fff',
        marginBottom: 15,
        fontFamily: FONTS.RobotoBold,
        textAlign: 'center'
    },
    searchBar: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        fontFamily: FONTS.RobotoRegular,
    },
    headerCurveContainer: {
        marginTop: -30,
        zIndex: -1
    },

    content: {
        paddingTop: 20,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 15,
        marginTop: 15,
    },
    sectionHeader: {
        fontSize: 17,
        color: '#333',
        marginLeft: 8,
        fontFamily: FONTS.RobotoBold,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    gridWrapper: {
        width: '50%',
        padding: 6,
    },
    categoryCard: {
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: '#fff'
    },
    categoryGradient: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        height: 140,
        justifyContent: 'center'
    },
    iconContainer: {
        marginBottom: 12
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: 14,
        color: '#222',
        marginBottom: 4,
        fontFamily: FONTS.RobotoBold,
        textAlign: 'center'
    },
    categoryDesc: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
        fontFamily: FONTS.RobotoRegular,
        lineHeight: 16
    },

    // FAQs
    faqList: {
        marginHorizontal: 18,
        marginBottom: 20,
    },
    faqItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 1,
    },
    faqItemExpanded: {
        borderColor: COLORS.primary + '50',
        elevation: 3,
        backgroundColor: '#fff'
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    faqIconBox: {
        marginRight: 10,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 14,
        color: '#444',
        fontFamily: FONTS.RobotoMedium,
        marginRight: 10,
    },
    faqBody: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5'
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        fontFamily: FONTS.RobotoRegular,
    },

    // Contact
    contactSection: {
        paddingHorizontal: 18,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0
    },
    contactCard: {
        flex: 1,
        marginRight: 10,
        borderRadius: 12,
        elevation: 3,
        backgroundColor: '#fff'
    },
    contactGradient: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100
    },
    contactTitleBtn: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONTS.RobotoBold,
        marginTop: 8
    },
    contactCardOutline: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        borderStyle: 'dashed'
    },
    contactTitleOutline: {
        color: COLORS.primary,
        fontSize: 14,
        fontFamily: FONTS.RobotoBold,
        marginTop: 8
    },

    // Tickets
    ticketsSection: {
        paddingHorizontal: 18,
        marginTop: 10,
    },
    ticketCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#ececec',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ticketInfo: {
        flex: 1,
        marginRight: 10,
    },
    ticketTitle: {
        fontSize: 15,
        color: '#333',
        fontFamily: FONTS.RobotoMedium,
        marginBottom: 4,
    },
    ticketNumber: {
        fontSize: 12,
        color: '#777',
        fontFamily: FONTS.RobotoRegular,
    },
    ticketStatusContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    ticketStatus: {
        fontSize: 13,
        fontFamily: FONTS.RobotoBold,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5
    },
    modalHeader: {
        fontSize: 18,
        color: '#222',
        fontFamily: FONTS.RobotoBold,
        marginBottom: 15,
        textAlign: 'center'
    },
    modalInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        color: '#333',
        fontFamily: FONTS.RobotoRegular,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#ececec',
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center'
    },
    modalCancelTxt: {
        color: '#555',
        fontFamily: FONTS.RobotoMedium,
        fontSize: 15
    },
    modalSubmitBtn: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        marginLeft: 10,
        alignItems: 'center'
    },
    modalSubmitTxt: {
        color: '#fff',
        fontFamily: FONTS.RobotoMedium,
        fontSize: 15
    },
});
