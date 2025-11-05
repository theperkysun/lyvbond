//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import Login from '../screens/Login/Login';
import Favorite from '../screens/Favorite/Favorite';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
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
            <FontAwesome6
              name="fire-flame-curved"
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
            <FontAwesome6
              name="heart-circle-check"
              color={color}
              size={size ?? 28}
            />
          ),
        }}
        name="Favorite"
        component={Favorite}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="messenger" color={color} size={size ?? 28} />
          ),
        }}
        name="Message"
        component={Favorite}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size ?? 28} />
          ),
        }}
        name="Profile"
        component={Favorite}
      />
    </Tab.Navigator>
  );
};
const AppNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={BottomTabs} />
    </Stack.Navigator>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default AppNavigation;
