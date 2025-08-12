import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [note, setNote] = React.useState('');
  const total = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const handleOrder = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    AsyncStorage.removeItem('cart').then(() => {
      navigation.navigate('OrderSuccess');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#FF0040', fontWeight: 'bold', fontSize: 16 }}>← Quay lại giỏ hàng</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Họ và tên</Text>
      <TextInput style={styles.input} placeholder="Nhập họ và tên" value={name} onChangeText={setName} />
      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput style={styles.input} placeholder="Nhập số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput style={styles.input} placeholder="Nhập địa chỉ nhận hàng" value={address} onChangeText={setAddress} />
      <Text style={styles.label}>Ghi chú</Text>
      <TextInput style={styles.input} placeholder="Ghi chú đơn hàng" value={note} onChangeText={setNote} />
      {/* Hiển thị danh sách sản phẩm để xác nhận */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Sản phẩm thanh toán:</Text>
      {cartItems.map((item, idx) => (
        <View key={item.id || idx} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <Image
            source={{ uri: item.image ? `http://localhost:8080/api/public/products/image/${item.image}` : 'https://via.placeholder.com/60x60' }}
            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>Số lượng: {item.quantity}</Text>
            <Text style={{ color: 'red' }}>{item.price?.toLocaleString()} ₫</Text>
          </View>
        </View>
      ))}
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
  backBtn: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0040',
  },
  orderBtn: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#FF0040',
    paddingVertical: 12,
    borderRadius: 8,
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
