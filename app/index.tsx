import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AuthScreen from './Screens/AuthScreen';
import CheckoutScreen from './Screens/CheckoutScreen';
import DetailsScreen from './Screens/DetailsScreen';
import HomeScreen from './Screens/HomeScreen';
import CartScreen from './Screens/HomeTabs/Cart';
import ProfileScreen from './Screens/HomeTabs/Profile';
import SearchScreen from './Screens/HomeTabs/Search';
import IntroScreen from './Screens/IntroScreen';
import OrderSuccessScreen from './Screens/OrderSuccessScreen';



type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Details: { product: any };
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
  Checkout: undefined;
  Intro: undefined;
  OrderSuccess: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
      <Stack.Navigator
  initialRouteName="Intro"
  screenOptions={{ headerShown: false }}
>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Intro" component={IntroScreen} />
<Stack.Screen name="Auth" component={AuthScreen} />
  <Stack.Screen name="Details" component={DetailsScreen} />
  <Stack.Screen name="Search" component={SearchScreen} />
  <Stack.Screen name="Cart" component={CartScreen} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
  <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />

</Stack.Navigator>

  );
}
