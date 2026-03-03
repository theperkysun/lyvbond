//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import Login from '../screens/Login/Login';
import MainLoginScreen from '../screens/Login/MainLoginScreen';
import EmailLogin from '../screens/email login/EmailLogin';
import ForgotPassword from '../screens/ForgotPassword/ForgotPassword';
import OTPScreen from '../screens/OTPScreen/OTPScreen';
import Signup from '../screens/Signup/Signup';
import UploadPhoto from '../screens/UploadPhoto';
import CreateProfileStep from '../screens/CreateProfileStep/index';
import Favorite from '../screens/Favorite/Favorite';
import NameDob from '../screens/Reg-form/NameDob';
import EmailPh from '../screens/Reg-form/EmailPh';
import SignupOTP from '../screens/Reg-form/SignupOTP';
import VarufyScreen from '../screens/VatufyScreen/VarufyScreen';
import AboutYourselfScreen from '../screens/AboutYourself/AboutYourselfScreen';
import FamilyDetailsScreen1 from '../screens/FamilyDetailsScreen/FamilyDetailsScreen1';
import FamilyDetailsScreen2 from '../screens/FamilyDetailsScreen/FamilyDetailsScreen2';
import HobbiesInterest from '../screens/HobbiesInterest/HobbiesInterest';
import PreferencesOverview from '../screens/BasicDetails/PreferencesOverview';
import AddPhotoScreen from '../screens/AddPhotoScreen/AddPhotoScreen';
import AddSecondaryPhotosScreen from '../screens/AddSecondaryPhotosScreen/AddSecondaryPhotosScreen';
import ProfileScreenH from '../screens/ProfileScreenH';
import SubscriptionScreen from '../screens/Subscription';
import PremiumMatchesScreen from '../screens/ProfileScreenH/PremiumMatchesScreen';
import RecentVisitorScreen from '../screens/ProfileScreenH/RecentVisitorScreen';
import NewMatchesScreen from '../screens/ProfileScreenH/NewMatchesScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen/UserDetailsScreen';
import FilterScreen from '../screens/FilterScreen/FilterScreen'
import IndexChat from '../screens/Chats/IndexChat'
import ChatView from '../screens/Chats/ChatView'
import CallHistoryScreen from '../screens/Chats/CallHistoryScreen'
import UserProfileScreen from '../screens/ProfileScreenH/UserProfileScreen'
import InboxIndex from '../screens/Inbox/InboxIndex';
import EditProfile from '../screens/EditProfile/EditProfile'
import AddProfileData from '../screens/EditProfile/AddProfileData';
import NotificationScreen from '../screens/Notification/NotificationScreen'
import SearchScreen from '../screens/Search/SearchScreen'
import SearchOptionScreen from '../screens/Search/SearchOptionScreen'
import RangeSelectionScreen from '../screens/Search/RangeSelectionScreen'
import SearchResult from '../screens/Search/SearchResult';
import MenuScreen from '../screens/Menu/MenuScreen';
import ContactFilterScreen from '../screens/ContactFilter/ContactFilterScreen';
import TermsConditionScreen from '../screens/TermsCondition/TermsConditionScreen';
import AccountSettingsScreen from '../screens/AccountSettings/AccountSettings';
import PushNotificationsSettings from '../screens/AccountSettings/PushNotificationsSettings';
import VerifyContactDetails from '../screens/AccountSettings/VerifyContactDetails';
import VoiceVideoCallSettings from '../screens/AccountSettings/VoiceVideoCallSettings';
import AstroDetailsSettings from '../screens/AccountSettings/AstroDetailsSettings';
import HideDeleteProfile from '../screens/AccountSettings/HideDeleteProfile';
import SafetyCentreScreen from '../screens/BeSafeOnline/SafetyCentreScreen';
import SaferSpaceScreen from '../screens/BeSafeOnline/SaferSpaceScreen';
import SafetyTipsScreen from '../screens/BeSafeOnline/SafetyTipsScreen';
import PrivacyTipsScreen from '../screens/BeSafeOnline/PrivacyTipsScreen';
import MentalWellbeingScreen from '../screens/BeSafeOnline/MentalWellbeingScreen';
import ReportProfileScreen from '../screens/BeSafeOnline/ReportProfileScreen';
import HelpSupportScreen from '../screens/HelpAndSupport/HelpSupportScreen';
import HelpCategoryScreen from '../screens/HelpAndSupport/HelpCategoryScreen';
import SupportChatScreen from '../screens/HelpAndSupport/SupportChatScreen';
import SettingsMessages from '../screens/AccountSettings/SettingsMessages';
import PhoneLogin from '../screens/PhoneLogin/PhoneLogin';
import AudioCallScreen from '../screens/Calls/AudioCallScreen';
import VideoCallScreen from '../screens/Calls/VideoCallScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator } from 'react-native';
import Header from '../components/Header';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
// create a component
// --- Nested Stack Navigators for Tabs ---
const InboxStack = createStackNavigator();
const InboxNavigator = () => (
  <InboxStack.Navigator screenOptions={{ headerShown: false }}>
    <InboxStack.Screen name="InboxIndex" component={InboxIndex} />
  </InboxStack.Navigator>
);

const ChatStack = createStackNavigator();
const ChatNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="IndexChat" component={IndexChat} />
  </ChatStack.Navigator>
);

// create a component
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // hide title
        tabBarActiveTintColor: '#E94057', // active tab color
        tabBarInactiveTintColor: 'grey', // inactive tab color
        tabBarStyle: {
          height: 70, // set your desired height
          paddingBottom: 15, // optional: for icon spacing
          paddingTop: 10, // optional: for icon spacing
          backgroundColor: '#fff', // optional: background color
        },
      }}
    >

      <Tab.Screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size ?? 28} />
          ),
        }}
        name="Profile"
        component={ProfileScreenH}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6
              name="heart-circle-check"
              color={color}
              size={size ?? 28}
            />
          ),
        }}
        name="HomeScreen"
        component={HomeScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="mail" color={color} size={size ?? 28} />
          ),
        }}
        name="inbox"
        component={InboxNavigator}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="messenger" color={color} size={size ?? 28} />
          ),
        }}
        name="Message"
        component={ChatNavigator}
      />
      <Tab.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6
              name="crown"
              color={color}
              size={size ?? 28}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ... (other imports)

const AppNavigation = () => {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E94057" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={userToken ? "Home" : "MainLoginScreen"}
      screenOptions={{
        headerShown: false,
      }}
    >
      {!userToken ? (
        <>
          <Stack.Screen name="MainLoginScreen" component={MainLoginScreen} />
          <Stack.Screen name="EmailLogin" component={EmailLogin} />
          <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="CreateProfileStep" component={CreateProfileStep} />
          <Stack.Screen name="NameDob" component={NameDob} />
          <Stack.Screen name="EmailPh" component={EmailPh} />
          <Stack.Screen name="SignupOTP" component={SignupOTP} />
          <Stack.Screen name="VarufyScreen" component={VarufyScreen} />
          <Stack.Screen name="AboutYourselfScreen" component={AboutYourselfScreen} />
          <Stack.Screen name="FamilyDetailsScreen1" component={FamilyDetailsScreen1} />
          <Stack.Screen name="FamilyDetailsScreen2" component={FamilyDetailsScreen2} />
          <Stack.Screen name="HobbiesInterest" component={HobbiesInterest} />
          <Stack.Screen name="PreferencesOverview" component={PreferencesOverview} />
          <Stack.Screen name="AddPhotoScreen" component={AddPhotoScreen} />
          <Stack.Screen name="AddSecondaryPhotosScreen" component={AddSecondaryPhotosScreen} />
          <Stack.Screen name="UploadPhoto" component={UploadPhoto} />
          <Stack.Screen name="SearchOptionScreen" component={SearchOptionScreen} />
          <Stack.Screen name="RangeSelectionScreen" component={RangeSelectionScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={BottomTabs} />
          <Stack.Screen name="ProfileScreenH" component={ProfileScreenH} />
          <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
          <Stack.Screen name="PremiumMatchesScreen" component={PremiumMatchesScreen} />
          <Stack.Screen name="RecentVisitorScreen" component={RecentVisitorScreen} />
          <Stack.Screen name="NewMatchesScreen" component={NewMatchesScreen} />
          <Stack.Screen name="UserDetailsScreen" component={UserDetailsScreen} />
          <Stack.Screen name="FilterScreen" component={FilterScreen} />
          <Stack.Screen name="IndexChat" component={IndexChat} />
          <Stack.Screen name="ChatView" component={ChatView} />
          <Stack.Screen name="CallHistoryScreen" component={CallHistoryScreen} />
          <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
          <Stack.Screen name="InboxIndex" component={InboxIndex} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="AddProfileData" component={AddProfileData} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="SearchOptionScreen" component={SearchOptionScreen} />
          <Stack.Screen name="RangeSelectionScreen" component={RangeSelectionScreen} />
          <Stack.Screen name="SearchResult" component={SearchResult} />
          <Stack.Screen
            name="MenuScreen"
            component={MenuScreen}
            options={{
              transitionSpec: {
                open: {
                  animation: 'spring',
                  config: {
                    stiffness: 150,
                    damping: 20,
                    mass: 1,
                    overshootClamping: true,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 300,
                    easing: Easing.out(Easing.poly(4)),
                  },
                },
              },
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          />
          <Stack.Screen name="ContactFilterScreen" component={ContactFilterScreen} />
          <Stack.Screen name="TermsConditionScreen" component={TermsConditionScreen} />
          <Stack.Screen name="AccountSettingsScreen" component={AccountSettingsScreen} />
          <Stack.Screen name="PushNotificationsSettings" component={PushNotificationsSettings} />
          <Stack.Screen name="VerifyContactDetails" component={VerifyContactDetails} />
          <Stack.Screen name="VoiceVideoCallSettings" component={VoiceVideoCallSettings} />
          <Stack.Screen name="AstroDetailsSettings" component={AstroDetailsSettings} />
          <Stack.Screen name="HideDeleteProfile" component={HideDeleteProfile} />
          <Stack.Screen name="SafetyCentreScreen" component={SafetyCentreScreen} />
          <Stack.Screen name="SaferSpaceScreen" component={SaferSpaceScreen} />
          <Stack.Screen name="SafetyTipsScreen" component={SafetyTipsScreen} />
          <Stack.Screen name="PrivacyTipsScreen" component={PrivacyTipsScreen} />
          <Stack.Screen name="MentalWellbeingScreen" component={MentalWellbeingScreen} />
          <Stack.Screen name="ReportProfileScreen" component={ReportProfileScreen} />
          <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
          <Stack.Screen name="HelpCategoryScreen" component={HelpCategoryScreen} />
          <Stack.Screen name="SupportChatScreen" component={SupportChatScreen} />
          <Stack.Screen name="SettingsMessages" component={SettingsMessages} />
          <Stack.Screen name="AudioCallScreen" component={AudioCallScreen} />
          <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen name="PreferencesOverview" component={PreferencesOverview} />
        </>
      )}
    </Stack.Navigator>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

export default AppNavigation;
