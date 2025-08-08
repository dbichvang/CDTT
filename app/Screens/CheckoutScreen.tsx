import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Đúng path tới types.ts

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Checkout'
>;

const CheckoutScreen = () => {
  const route = useRoute<CheckoutScreenRouteProp>();
  const navigation = useNavigation<CheckoutScreenNavigationProp>();

  const { cartItems } = route.params;

  const total = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const handleOrder = () => {
    Alert.alert('Đặt hàng thành công!');
    navigation.navigate('OrderSuccess'); // ✅ không lỗi nữa
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>

      <Text style={styles.label}>Họ và tên</Text>
      <TextInput style={styles.input} placeholder="Nhập họ và tên" />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput style={styles.input} placeholder="Nhập số điện thoại" keyboardType="phone-pad" />

      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput style={styles.input} placeholder="Nhập địa chỉ nhận hàng" />

      <Text style={styles.label}>Ghi chú</Text>
      <TextInput style={styles.input} placeholder="Ghi chú đơn hàng" />

      <View style={styles.totalBox}>
        <Text style={styles.totalText}>Tổng tiền:</Text>
        <Text style={styles.totalPrice}>{total.toLocaleString()} ₫</Text>
      </View>

      <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
        <Text style={styles.orderBtnText}>Đặt hàng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  totalBox: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 18,
    color: '#f00',
    fontWeight: '600',
  },
  orderBtn: {
    backgroundColor: '#FF0040',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
