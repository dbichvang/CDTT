import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';

import CartScreen from '../Screens/HomeTabs/Cart';
import HomeTab from '../Screens/HomeTabs/Hometab';
import ProfileScreen from '../Screens/HomeTabs/Profile';
import SearchScreen from '../Screens/HomeTabs/Search';

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 60 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#f00' : '#888' }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#f00' : '#888' }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#f00' : '#888' }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#f00' : '#888' }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeScreen;
