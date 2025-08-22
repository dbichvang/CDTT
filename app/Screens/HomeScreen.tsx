import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CartScreen from "../Screens/HomeTabs/Cart";
import HomeTab from "../Screens/HomeTabs/Hometab";
import ProfileScreen from "../Screens/HomeTabs/Profile";
import SearchScreen from "../Screens/HomeTabs/Search";
import ChatbotScreen from "../Screens/ChatbotScreen";

// 👇 Import type RootStackParamList từ App.tsx
import type { RootStackParamList } from "../types";

const Tab = createBottomTabNavigator();

// 👇 Tạo type cho navigation
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={{ flex: 1 }}>
      {/* Bottom Tab */}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { height: 60 },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeTab}
          options={{
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 24, color: focused ? "#f00" : "#888" }}>🏠</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 24, color: focused ? "#f00" : "#888" }}>🔍</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 24, color: focused ? "#f00" : "#888" }}>🛒</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 24, color: focused ? "#f00" : "#888" }}>👤</Text>
            ),
          }}
        />
      </Tab.Navigator>

      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => navigation.navigate("Chatbot")} // ✅ giờ không còn báo lỗi
      >
        <Text style={{ fontSize: 28 }}>💬</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  chatbotButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#0078FF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
