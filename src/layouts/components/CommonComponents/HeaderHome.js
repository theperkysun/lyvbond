import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Platform, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../../../context/NotificationContext';
import { COLORS } from '../../../utlis/comon';

export default function HeaderHome({ onMenuPress, title }) {
  const navigation = useNavigation();
  const { unseenCount } = useNotification();

  const handleNotifyPress = () => {
    navigation.navigate('NotificationScreen');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.container}>

        {/* LEFT SIDE — Menu + Title */}
        <View style={styles.leftBox}>
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')}>
            <Ionicons name="menu" size={26} color="#000" />
          </TouchableOpacity>

          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>

        {/* CENTER — Logo */}
        <View style={styles.centerBox}>
          <Image
            source={require('../../../assets/images/LyvBondLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* RIGHT — Notification with Badge */}
        <View style={styles.rightBox}>
          <TouchableOpacity onPress={handleNotifyPress} style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={24} color="#000" />

            {/* Badge — Only Display If Count > 0 */}
            {unseenCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unseenCount > 9 ? "9+" : unseenCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 30) : 0,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 0.7,
    borderBottomColor: "#e4e4e4",
    borderBottomLeftRadius: 20, // Rounded bottom left
    borderBottomRightRadius: 20, // Rounded bottom right
    paddingBottom: 15, // Extra padding for rounded feel
    backgroundColor: '#fff', // Ensure bg color 

    // Thin Primary Border to highlight curve
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary, // Make sure transparency is handled if needed
    borderLeftWidth: 0.5, // Optional: faint side border to complete shape if needed but usually bottom is enough
    borderRightWidth: 0.5,
    borderColor: COLORS.primary, // Fallback for sides
  },

  leftBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "33%",
    gap: 10
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },

  centerBox: {
    width: "34%",
    alignItems: "center",
  },
  logo: {
    width: 130,
    height: 35,
  },

  rightBox: {
    width: "33%",
    alignItems: "flex-end",
  },

  /* Notification Badge */
  badge: {
    position: "absolute",
    right: -5,
    top: -4,
    backgroundColor: "red",
    paddingHorizontal: 5,
    height: 18,
    minWidth: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  }
});
