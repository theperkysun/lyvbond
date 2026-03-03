import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS } from '../../../utlis/comon';
import SubscriptionService from '../../../services/SubscriptionService';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Modern Asset Constants (Use real URLs or local require)
const ASSETS = {
    gpay: require('../../../assets/images/gpay.jpg'),
    phonepe: require('../../../assets/images/phonepe.png'),
    paytm: require('../../../assets/images/paytm.jpg'),
    sbi: require('../../../assets/images/sbi.png'),
    hdfc: require('../../../assets/images/hdfc.png'),
    icici: require('../../../assets/images/icici.png'),
    axis: require('../../../assets/images/axis.png'),
};

export default function PaymentScreen({ route, navigation }) {
    const { plan } = route.params || {};
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [addons, setAddons] = useState([]); // Dynamic Addons State
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [addonsLoading, setAddonsLoading] = useState(true);
    const [expandedMethod, setExpandedMethod] = useState('upi');
    const [selectedBank, setSelectedBank] = useState(null);
    const [selectedUPIApp, setSelectedUPIApp] = useState(null);
    const [showUpiInput, setShowUpiInput] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [processing, setProcessing] = useState(false);

    // Fetch Add-ons on mount
    useEffect(() => {
        fetchAddons();
    }, []);

    const fetchAddons = async () => {
        setAddonsLoading(true);
        const res = await SubscriptionService.getAddons();
        if (res.success) {
            // Map backend addons to frontend structure if needed, or use directly
            // Backend returns: [{ id, label, price }, ...]
            // Add icon mapping here if backend doesn't provide it
            const icons = {
                'extra_contacts': 'people-outline',
                'promote_profile': 'trending-up-outline',
                'contribute': 'heart-outline'
            };
            const mappedAddons = res.data.map(a => ({
                ...a,
                icon: icons[a.id] || 'layers-outline' // Default icon
            }));
            setAddons(mappedAddons);
        }
        setAddonsLoading(false);
    };

    useEffect(() => {
        if (plan?._id || plan?.key) {
            calculateTotal();
        }
    }, [selectedAddons, plan]);

    const calculateTotal = async () => {
        if (!plan?._id && !plan?.key) return;
        setLoading(true);
        // Pass add-on IDs to backend for calculation
        const res = await SubscriptionService.calculatePaymentSummary(plan._id || plan.key, selectedAddons);
        if (res.success) setSummary(res.data);
        setLoading(false);
    };

    const toggleMethod = (method) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedMethod(expandedMethod === method ? null : method);
    };

    const handleUPIPayment = async () => {
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID');
            return;
        }
        setProcessing(true);
        const res = await SubscriptionService.processUPIPayment(plan._id || plan.key, selectedAddons, upiId);
        setProcessing(false);

        if (res.success) {
            // Navigate to Success Screen
            // navigation.replace('PaymentSuccess', { subscription: res.data.subscription });
            alert('Payment Successful! Subscription Active.');
            navigation.goBack(); // Or navigate to Home/Subscription Dashboard
        } else {
            alert(res.error || 'Payment Failed');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={[COLORS.white, COLORS.bgcolor]} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircleHeader}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Payment Method</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Futuristic Plan Card */}
                <View style={styles.glassCard}>
                    <LinearGradient
                        colors={[COLORS.primary, '#C2185B', COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.planGradient}
                    >
                        {/* Decorative Circles */}
                        <View style={styles.cardCircle1} />
                        <View style={styles.cardCircle2} />

                        <View style={styles.planHeader}>
                            <View>
                                <Text style={styles.planTag}>SELECTED PLAN</Text>
                                <Text style={styles.planName}>{plan?.title || "Premium Subscription"}</Text>
                            </View>
                            <Image
                                source={{ uri: 'https://res.cloudinary.com/dxcy6adcv/image/upload/v1767780841/LyvBondLogo_jziowk.png' }}
                                style={styles.cardLogo}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.planPriceContainer}>
                            <Text style={styles.planPriceText}>
                                {summary?.breakdown?.plan?.price ? `₹${summary.breakdown.plan.price}` : 'Calculating...'}
                            </Text>
                            <Text style={styles.planDurationText}>/ {plan?.duration || "Year"}</Text>
                        </View>

                        <View style={styles.verifiedRow}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.successGreen} />
                            <Text style={styles.verifiedText}>Secure Payment via LyvBond</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Add-ons: Floating Chips */}
                <Text style={styles.sectionLabel}>Enhance Your Experience</Text>
                <View style={styles.addonsWrapper}>
                    {addonsLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : addons.map((addon) => {
                        const isSelected = selectedAddons.includes(addon.id);
                        return (
                            <TouchableOpacity
                                key={addon.id}
                                onPress={() => setSelectedAddons(prev => isSelected ? prev.filter(i => i !== addon.id) : [...prev, addon.id])}
                                style={[styles.addonChip, isSelected && styles.addonChipSelected]}
                            >
                                <Ionicons name={addon.icon} size={18} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                                <Text style={[styles.addonChipText, isSelected && styles.addonChipTextSelected]}>{addon.label}</Text>
                                <Text style={[styles.addonChipPrice, isSelected && styles.addonChipPriceSelected]}>+₹{addon.price}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Summary Glass Box - Moved Above */}
                {/* Summary Glass Box - Moved Above */}
                <View style={styles.summaryBox}>
                    <SummaryRow label="Subtotal" value={`₹${summary?.basePrice || 0}`} />

                    {/* Dynamic Add-ons Rows */}
                    {summary?.breakdown?.addons && summary.breakdown.addons.length > 0 ? (
                        summary.breakdown.addons.map((addon, index) => (
                            <SummaryRow key={index} label={addon.label} value={`₹${addon.price}`} />
                        ))
                    ) : null}

                    <SummaryRow label="GST (18%)" value={`₹${summary?.gstAmount || 0}`} />
                    <View style={styles.totalDivider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Payable Amount</Text>
                        <Text style={styles.totalValue}>₹{summary?.finalTotal || 0}</Text>
                    </View>
                </View>

                {/* Modern Payment Methods Accordion */}
                <Text style={styles.sectionLabel}>Payment Method</Text>

                {/* UPI Section */}
                <PaymentMethodItem
                    title="UPI Apps"
                    icon="flash"
                    id="upi"
                    active={expandedMethod === 'upi'}
                    onPress={toggleMethod}
                >
                    <View style={styles.upiGrid}>
                        {['gpay', 'phonepe', 'paytm'].map(app => (
                            <TouchableOpacity
                                key={app}
                                style={[styles.brandItem, selectedUPIApp === app && styles.brandItemSelected]}
                                onPress={() => { setSelectedUPIApp(app); setShowUpiInput(false); }}
                            >
                                <Image source={ASSETS[app]} style={styles.brandLogo} resizeMode="contain" />
                                {selectedUPIApp === app && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Toggle UPI Input */}
                    {showUpiInput ? (
                        <View>
                            <TextInput
                                style={styles.modernInput}
                                placeholder="e.g. mobile@upi"
                                placeholderTextColor={COLORS.textPlaceholder}
                                autoFocus
                                value={upiId}
                                onChangeText={setUpiId}
                            />
                            <TouchableOpacity style={styles.smallPayBtn} onPress={handleUPIPayment} disabled={processing}>
                                {processing ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.smallPayBtnText}>Pay ₹{summary?.finalTotal || 0}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.textBtn} onPress={() => { setShowUpiInput(true); setSelectedUPIApp(null); }}>
                            <Text style={styles.textBtnTitle}>+ Add your UPI ID</Text>
                        </TouchableOpacity>
                    )}
                </PaymentMethodItem>

                {/* Bank Section */}
                <PaymentMethodItem
                    title="Net Banking"
                    icon="business"
                    id="nb"
                    active={expandedMethod === 'nb'}
                    onPress={toggleMethod}
                >
                    <View style={styles.bankGrid}>
                        {['sbi', 'hdfc', 'icici', 'axis'].map(bank => (
                            <TouchableOpacity
                                key={bank}
                                style={[styles.bankCircle, selectedBank === bank && styles.bankCircleSelected]}
                                onPress={() => setSelectedBank(bank)}
                            >
                                <Image source={ASSETS[bank]} style={styles.bankIcon} resizeMode="contain" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </PaymentMethodItem>

                {/* Card Section */}
                <PaymentMethodItem
                    title="Credit / Debit Card"
                    icon="card"
                    id="card"
                    active={expandedMethod === 'card'}
                    onPress={toggleMethod}
                >
                    <View style={styles.inputWithIcon}>
                        <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput style={styles.inputFlex} placeholder="Card Number" placeholderTextColor={COLORS.textPlaceholder} keyboardType="numeric" />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={[styles.inputWithIcon, { flex: 1 }]}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                            <TextInput style={styles.inputFlex} placeholder="Valid Thru (MM/YY)" placeholderTextColor={COLORS.textPlaceholder} />
                        </View>
                        <View style={[styles.inputWithIcon, { flex: 0.8 }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                            <TextInput style={styles.inputFlex} placeholder="CVV" placeholderTextColor={COLORS.textPlaceholder} secureTextEntry maxLength={3} keyboardType="numeric" />
                        </View>
                    </View>
                    <View style={styles.inputWithIcon}>
                        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput style={styles.inputFlex} placeholder="Cardholder Name" placeholderTextColor={COLORS.textPlaceholder} />
                    </View>
                    <TouchableOpacity style={styles.smallPayBtn}>
                        <Text style={styles.smallPayBtnText}>Pay ₹{summary?.finalTotal || 0}</Text>
                    </TouchableOpacity>
                </PaymentMethodItem>

                {/* Razorpay Section - Restored */}
                <PaymentMethodItem
                    title="Razorpay Secure"
                    icon="shield-checkmark"
                    id="razorpay"
                    active={expandedMethod === 'razorpay'}
                    onPress={toggleMethod}
                >
                    <Text style={{ color: COLORS.textSecondary, marginBottom: 10 }}>Redirecting to secure payment gateway...</Text>
                </PaymentMethodItem>

            </ScrollView>
        </SafeAreaView>
    );
}

// Reusable Components
const PaymentMethodItem = ({ title, icon, children, active, onPress, id }) => (
    <View style={[styles.methodWrapper, active && styles.methodWrapperActive]}>
        <TouchableOpacity style={styles.methodTrigger} onPress={() => onPress(id)}>
            <View style={styles.methodLeft}>
                <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                    <Ionicons name={icon} size={20} color={active ? COLORS.primary : COLORS.textSecondary} />
                </View>
                <Text style={[styles.methodTitle, active && styles.methodTitleActive]}>{title}</Text>
            </View>
            <Ionicons name={active ? "chevron-up" : "chevron-down"} size={18} color={active ? COLORS.primary : COLORS.textPlaceholder} />
        </TouchableOpacity>
        {active && <View style={styles.methodContent}>{children}</View>}
    </View>
);

const SummaryRow = ({ label, value }) => (
    <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgcolor },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.primary,
        elevation: 4,
        shadowColor: COLORS.primaryShadow,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    iconCircleHeader: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 20, fontFamily: FONTS.RobotoBold, color: COLORS.white },
    scrollContent: { padding: 20, paddingBottom: 50 },

    // Plan Card
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: COLORS.primaryShadow,
        shadowOpacity: 0.5,
        shadowRadius: 15,
        marginBottom: 25,
        height: 200, // Fixed height for consistency
    },
    planGradient: { padding: 24, flex: 1, justifyContent: 'space-between', position: 'relative' },
    cardCircle1: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)' },
    cardCircle2: { position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },

    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    planTag: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
    planName: { color: COLORS.white, fontSize: 24, fontWeight: '700', letterSpacing: 0.5, flex: 1, marginRight: 10 },
    cardLogo: { width: 80, height: 80, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },

    planPriceContainer: { flexDirection: 'row', alignItems: 'baseline' },
    planPriceText: { color: COLORS.white, fontSize: 36, fontWeight: '800' },
    planDurationText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginLeft: 8, fontWeight: '500' },

    verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    verifiedText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginLeft: 6, fontWeight: '500' },

    // Addons
    sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginTop: 10 },
    addonsWrapper: { flexDirection: 'column', gap: 10, marginBottom: 25 },
    addonChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        elevation: 2,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    addonChipSelected: { backgroundColor: COLORS.white, borderColor: COLORS.primary, borderWidth: 1.5, shadowColor: COLORS.primaryShadow, shadowOpacity: 0.3 },
    addonChipText: { flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
    addonChipTextSelected: { color: COLORS.primary, fontWeight: '600' },
    addonChipPrice: { fontWeight: '700', color: COLORS.textSecondary },
    addonChipPriceSelected: { color: COLORS.primary },

    // Summary Box
    summaryBox: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, marginBottom: 25 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
    summaryValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
    totalDivider: { height: 1, borderColor: COLORS.primary, opacity: 0.5, borderStyle: 'dashed', borderWidth: 1, borderRadius: 1, marginVertical: 15 },
    totalLabel: { color: COLORS.black, fontSize: 18, fontWeight: '700' },
    totalValue: { color: COLORS.primary, fontSize: 22, fontWeight: '800' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    // Payment Methods
    methodWrapper: { backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.borderColor, overflow: 'hidden', elevation: 2, shadowColor: 'rgba(0,0,0,0.05)', shadowRadius: 5 },
    methodWrapperActive: { borderColor: COLORS.primary, borderWidth: 1.5, elevation: 4, shadowColor: COLORS.primaryShadow, shadowOpacity: 0.2 },
    methodTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
    methodLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.bgcolor, justifyContent: 'center', alignItems: 'center' },
    iconBoxActive: { backgroundColor: COLORS.primary + '15' }, // 15 is roughly 10% opacity hex
    methodTitle: { marginLeft: 15, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
    methodTitleActive: { color: COLORS.primary },
    methodContent: { padding: 18, paddingTop: 0 },

    // Brands & Banks
    upiGrid: { flexDirection: 'row', gap: 12, marginBottom: 15 },
    brandItem: { flex: 1, height: 50, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderColor, justifyContent: 'center', alignItems: 'center' },
    brandItemSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.white, borderWidth: 1.5 },
    brandLogo: { width: '60%', height: '50%' },
    activeDot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },

    bankGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    bankCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor, justifyContent: 'center', alignItems: 'center' },
    bankCircleSelected: { borderColor: COLORS.primary, borderWidth: 1.5, shadowColor: COLORS.primaryShadow, elevation: 2 },
    bankIcon: { width: 35, height: 35 },

    modernInput: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.borderColor, marginBottom: 12 },

    // Pay Button
    mainPayBtn: { marginTop: 25, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: COLORS.primaryShadow, shadowOpacity: 0.4 },
    btnGradient: { flexDirection: 'row', paddingVertical: 18, justifyContent: 'center', alignItems: 'center' },
    mainPayBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    textBtn: { paddingVertical: 10 },
    textBtnTitle: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },

    // Small Pay Button (Contextual)
    smallPayBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    smallPayBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },

    // Input Icons
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderColor, paddingHorizontal: 14, height: 50, marginBottom: 12 },
    inputFlex: { flex: 1, fontSize: 15, color: COLORS.textPrimary }
});