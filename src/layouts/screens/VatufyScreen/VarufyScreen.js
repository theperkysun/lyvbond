import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';
import Header from '../../components/CommonComponents/Header';
import CustomSelectionButton from '../../components/CommonComponents/CustomSelectionButton';
import CustomInput from '../../components/CommonComponents/CustomInput';
import CustomButton from '../../components/CommonComponents/CustomButton';

const VarufyScreen = ({ navigation, route }) => {
  const [selectedId, setSelectedId] = useState('PAN Card');
  const [idValue, setIdValue] = useState('');

  // animation refs
  const tickTranslate = useRef(new Animated.Value(200)).current;
  const tickRotate = useRef(new Animated.Value(0)).current;
  const tickScale = useRef(new Animated.Value(0.3)).current;
  const tickOpacity = useRef(new Animated.Value(0)).current;

  const [buttonVisible, setButtonVisible] = useState(true);
  const [tickVisible, setTickVisible] = useState(false);

  const getMinLengthByIdType = (type) => {
    switch (type) {
      case 'PAN Card':
        return 8;
      case 'Driving License':
        return 15;
      case 'Voter ID':
        return 10;
      default:
        return 1;
    }
  };


  const startAnimation = () => {
    const minLength = getMinLengthByIdType(selectedId);

    if (!idValue.trim()) {
      Alert.alert(
        'Missing Information',
        `Please enter your ${selectedId} number to continue.`
      );
      return;
    }

    if (idValue.trim().length < minLength) {
      Alert.alert(
        'Invalid Document Number',
        `${selectedId} number must be at least ${minLength} characters long.`
      );
      return;
    }

    setButtonVisible(false);
    setTickVisible(true);

    tickTranslate.setValue(200);
    tickRotate.setValue(0);
    tickScale.setValue(0.3);
    tickOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(tickTranslate, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tickRotate, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(tickOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(tickScale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigation.navigate('HobbiesInterest', {
          ...route.params, // Pass previous params
          idProofType: selectedId, // Add verification details
          idProofValue: idValue,
        });
      }, 2000);
    });
  };

  const rotateInterpolate = tickRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const tickAnimatedStyle = {
    transform: [
      { translateY: tickTranslate },
      { rotate: rotateInterpolate },
      { scale: tickScale },
    ],
    opacity: tickOpacity,
  };

  const idOptions = [
    { key: 'PAN Card', label: 'PAN Card', icon: 'card' },
    { key: 'Driving License', label: 'Driving License', icon: 'car' },
    { key: 'Voter ID', label: 'Voter ID', icon: 'id-card' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="" onBackPress={() => navigation.goBack()} />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/images/varufyico.png')}
                style={styles.varufyImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>Verify your Profile</Text>
          <Text style={styles.subtitle}>
            Verification with Govt. ID is now required to ensure safety and establish authenticity
          </Text>

          {/* ID OPTIONS */}
          <View style={styles.optionsWrap}>
            {idOptions.map((opt) => {
              const isActive = selectedId === opt.key;

              return (
                <TouchableOpacity key={opt.key} activeOpacity={0.85} onPress={() => setSelectedId(opt.key)}>
                  <CustomSelectionButton style={[styles.optionCard, isActive && styles.optionCardActive]}>
                    <Icon
                      name={opt.icon}
                      size={18}
                      color={isActive ? COLORS.white : COLORS.primary}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{opt.label}</Text>
                  </CustomSelectionButton>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomInput
            label={`${selectedId} Number`}
            value={idValue}
            onChangeText={setIdValue}
          />

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Submit Button */}
        {buttonVisible && (
          <View style={styles.fixedButtonWrap}>
            <CustomButton
              title="Submit & Continue"
              paddingVertical={14}
              borderRadius={30}
              marginTop={0}
              onPress={startAnimation}
            />
          </View>
        )}

        {/* ANIMATED PNG TICKMARK */}
        {tickVisible && (
          <View pointerEvents="none" style={styles.tickOverlay}>
            <Animated.View style={[styles.tickBox, tickAnimatedStyle]}>
              <Image
                source={require('../../../assets/images/tickmark.png')}
                style={styles.tickImage}
                resizeMode="contain"
              />
              <Text style={styles.successText}>Verification Successful</Text>
            </Animated.View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

export default VarufyScreen;


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgcolor || COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: 20,
  },

  iconContainer: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  iconCircle: {
    backgroundColor: COLORS.bgcolor,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  varufyImage: {
    width: 130,
    height: 130,
  },

  title: {
    fontSize: 24,
    fontFamily: FONTS.RobotoBold,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textGrey,
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: FONTS.RobotoRegular,
    fontSize: 15,
  },

  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  optionCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    marginRight: 10,
    marginBottom: 12,
    minWidth: 140,
    justifyContent: 'flex-start',
  },
  optionCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.grey,
    fontFamily: FONTS.RobotoMedium,
  },
  optionTextActive: {
    color: COLORS.white,
  },

  fixedButtonWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 22,
  },

  // SUCCESS ANIMATION
  tickOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
    alignItems: 'center',
  },

  tickBox: {
    alignItems: 'center',
  },

  tickImage: {
    width: 90,
    height: 90,
  },

  successText: {
    marginTop: 10,
    fontFamily: FONTS.RobotoMedium,
    fontSize: 17,
    color: COLORS.black,
  },
});
