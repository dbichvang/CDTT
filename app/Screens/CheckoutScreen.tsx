import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking, Platform
} from 'react-native';
import { RootStackParamList } from '../types';
import { createOrder, OrderPayload, TOKEN } from './APIService';

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen = () => {
  const route = useRoute<CheckoutScreenRouteProp>();
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems } = route.params;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  // Chuẩn hóa cartItems để hiển thị UI
  const itemsForDisplay = cartItems.map(it => ({
    ...it,
  name: it.name || it.title || 'Sản phẩm', // thêm fallback nếu it.name undefined
    image: it.image
      ? `http://10.18.12.179:8080/api/public/products/image/${it.image}`
      : 'https://via.placeholder.com/60',
    price: typeof it.price === 'number' ? it.price : parseFloat(it.price),
    quantity: it.quantity || 1,
  }));

  const total = itemsForDisplay.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Validate form nâng cao
  const validateForm = () => {
    const newErrors: typeof errors = {};
    const nameRegex = /^[A-Z][a-zA-Z ]*$/;

    if (!name.trim()) newErrors.name = 'Họ tên không được bỏ trống';
    else if (name.trim().length < 5 || name.trim().length > 30)
      newErrors.name = 'Họ tên phải từ 5 đến 30 ký tự';
    else if (!nameRegex.test(name.trim()))
      newErrors.name = 'Chữ cái đầu viết hoa, không chứa số hoặc ký tự đặc biệt';

    if (!phone.trim()) newErrors.phone = 'Số điện thoại không được bỏ trống';
    else if (!/^0\d{9}$/.test(phone.trim()))
      newErrors.phone = 'Số điện thoại phải đủ 10 số và bắt đầu bằng 0';

    if (!address.trim()) newErrors.address = 'Địa chỉ không được bỏ trống';
    else if (address.trim().length < 5 || address.trim().length > 100)
      newErrors.address = 'Địa chỉ phải từ 5 đến 100 ký tự';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Đặt hàng COD ----
  const handleOrder = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const emailId = await AsyncStorage.getItem('user-email');
      const cartIdStr = await AsyncStorage.getItem('cart-id');
      if (!emailId || !cartIdStr) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin giỏ hàng hoặc tài khoản.');
        return;
      }
      const cartId = Number(cartIdStr);

      // Payload gửi server
      const payload: OrderPayload = {
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
        items: itemsForDisplay.map(it => ({
          productId: Number(it.id),
          quantity: it.quantity,
          price: it.price,
        })),
        totalAmount: total,
        paymentMethod: 'COD',
        status: 'PAID',
      };

      // Gửi lên server
      const newOrder = await createOrder(emailId, String(cartId), 'CASH', payload);

      // Lưu local đầy đủ sản phẩm
      const storedOrders = await AsyncStorage.getItem('orders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];

     const orderToSave = {
  ...newOrder,
  cartItems: itemsForDisplay.map(it => ({
    productId: it.productId,
    name: it.name || it.title || 'Sản phẩm', // <-- đảm bảo luôn có tên
    image: it.image,
    quantity: it.quantity,
    price: it.price,
  })),
  customerName: name.trim(),
  phone: phone.trim(),
  address: address.trim(),
  note: note.trim() || undefined,
  totalAmount: total,
  paymentMethod: 'COD',
  status: 'PAID',
};



      orders.push(orderToSave);
      await AsyncStorage.setItem('orders', JSON.stringify(orders));

      // Xóa cart local
      await AsyncStorage.removeItem('cart');

      // Animation thành công
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        navigation.navigate('OrderSuccess');
      }, 1800);
    } catch (err: any) {
      console.error('Create order error:', err?.response?.data || err?.message);
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Thanh toán VNPay ----
// trong handleVNPay

const handleVNPay = async () => {
  if (!validateForm()) return;

  try {
    const res = await fetch('http://10.18.12.179:3000/api/create_payment_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        amount: total,
        orderInfo: 'Thanh toán đơn hàng',
      }),
    });

    const data = await res.json();
    if (data?.paymentUrl) {
      // Trên web: redirect trực tiếp
      if (Platform.OS === 'web') {
        window.location.href = data.paymentUrl;
      } else {
        navigation.navigate('VNPayScreen', { paymentUrl: data.paymentUrl });
      }
    } else {
      Alert.alert('Lỗi', 'Tạo thanh toán VNPay thất bại.');
    }
  } catch (err) {
    console.error('VNPay error:', err);
    Alert.alert('Lỗi', 'Không thể kết nối VNPAY.');
  }
};




  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Back + Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Thanh toán</Text>
        </View>

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={[styles.input, errors.name && { borderColor: 'red' }]}
          placeholder="Nhập họ và tên"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, errors.phone && { borderColor: 'red' }]}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={[styles.input, errors.address && { borderColor: 'red' }]}
          placeholder="Nhập địa chỉ nhận hàng"
          value={address}
          onChangeText={setAddress}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

        <Text style={styles.label}>Ghi chú</Text>
        <TextInput
          style={styles.input}
          placeholder="Ghi chú đơn hàng"
          value={note}
          onChangeText={setNote}
        />

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>
          Sản phẩm thanh toán:
        </Text>
        {itemsForDisplay.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>Số lượng: {item.quantity}</Text>
              <Text style={{ color: 'red' }}>{item.price.toLocaleString()} ₫</Text>
            </View>
          </View>
        ))}

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Tổng tiền:</Text>
          <Text style={styles.totalPrice}>{total.toLocaleString()} ₫</Text>
        </View>

        <TouchableOpacity style={[styles.orderBtn, { backgroundColor: '#0a84ff' }]} onPress={handleVNPay}>
          <Text style={styles.orderBtnText}>Thanh toán VNPay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.orderBtn, submitting && { opacity: 0.6 }]}
          onPress={handleOrder}
          disabled={submitting}
        >
          <Text style={styles.orderBtnText}>{submitting ? 'Đang xử lý...' : 'Đặt hàng COD'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Animation đặt hàng thành công */}
      <Modal visible={showAnimation} transparent animationType="fade">
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../assets/lottie/order-success.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorText: { color: 'red', marginBottom: 8, fontSize: 13 },
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
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF0040' },
  orderBtn: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#FF0040',
    paddingVertical: 12,
    borderRadius: 8,
  },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  animationContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  backBtnText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
});
