import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import LottieViewNative from 'lottie-react-native';
import LottieViewWeb from 'lottie-react';
import animationData from '../assets/lottie/order-success.json.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <LottieViewWeb
          animationData={animationData}
          loop={false}
          autoplay
          style={styles.animation}
        />
      ) : (
        <LottieViewNative
          source={animationData}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      )}

      <Text style={styles.title}>Đặt hàng thành công!</Text>
      <Text style={styles.subtitle}>Cảm ơn bạn đã mua hàng.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>🏠 Quay về Trang Chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#0a84ff', marginTop: 15 }]}
        onPress={() => navigation.navigate('MyOrders')}
      >
        <Text style={styles.buttonText}>📦 Xem đơn hàng của tôi</Text>
      </TouchableOpacity>
    </View>
  )
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  animation: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FF0040',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
