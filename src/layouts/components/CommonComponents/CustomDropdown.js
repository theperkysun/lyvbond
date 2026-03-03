import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS } from '../../../utlis/comon';

const { height } = Dimensions.get("window");

const CustomDropdown = ({ label, value, onSelect, options }) => {
  const [open, setOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

  const openSheet = () => {
    setOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 260,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownContainer}
        activeOpacity={0.8}
        onPress={openSheet}
      >
        <Text
          style={[
            styles.dropdownLabel,
            { color: value ? COLORS.black : COLORS.grey },
          ]}
        >
          {value || label}
        </Text>

        <Ionicons name="chevron-down" size={20} color={COLORS.grey} />
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal visible={open} transparent animationType="none">
        <TouchableOpacity style={styles.overlay} onPress={closeSheet} />

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >

          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onSelect(item);
                  closeSheet();
                }}
              >
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </Modal>
    </>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    borderWidth: 1.8,
    borderColor: COLORS.bordercolor,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 15,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },

  dropdownLabel: {
    fontSize: 16,
    fontFamily: FONTS.RobotoMedium,
  },

  overlay: {
    flex: 1,
    backgroundColor: '#00000040',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.white,
    paddingBottom: 25,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    // NEW — Perfect curved border
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },

  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: '#e6e6e6',
  },

  itemText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.RobotoMedium,
  },
});
