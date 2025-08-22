import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

type CartItem = {
  productId?: string | number;
  id?: string | number;
  name?: string;
  productName?: string;
  price?: number;
  image?: string;
  quantity?: number;
};

type RootStackParamList = {
  Checkout: { cartItems: CartItem[] };
};

const BASE_URL = 'http://10.18.12.179:8080/api';

export default function Cart() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Load cart từ AsyncStorage
  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      const parsed: CartItem[] = stored ? JSON.parse(stored) : [];
      setCartItems(parsed);
    } catch (err) {
      console.error('Lỗi khi load cart:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation]);

  // Tính tổng tiền
  useEffect(() => {
    const sum = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    setTotal(sum);
  }, [cartItems]);

  const saveCartLocal = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
      setCartItems(items);
    } catch (error) {
      console.error('Lỗi lưu giỏ hàng local:', error);
    }
  };

  // Đồng bộ cart local lên server
  const syncCartToServer = async () => {
    try {
      const cartIdStr = await AsyncStorage.getItem('cart-id');
      const email = await AsyncStorage.getItem('user-email');
      if (!cartIdStr || !email) return false;
      const cartId = parseInt(cartIdStr);
      for (const item of cartItems) {
        await fetch(`${BASE_URL}/public/users/${email}/carts/${cartId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId ?? item.id,
            quantity: item.quantity,
          }),
        });
      }
      return true;
    } catch (err) {
      console.error('Lỗi sync cart server:', err);
      return false;
    }
  };

  // Xóa 1 sản phẩm
  const deleteItem = async (productId?: string | number) => {
    if (!productId) return;
    const updated = cartItems.filter(item => (item.productId ?? item.id) !== productId);
    await saveCartLocal(updated);
  };

  const increaseQty = async (productId: string | number) => {
    const updated = cartItems.map(item =>
      (item.productId ?? item.id) === productId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    await saveCartLocal(updated);
  };

  const decreaseQty = async (productId: string | number) => {
    const updated = cartItems.map(item =>
      (item.productId ?? item.id) === productId ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) } : item
    );
    await saveCartLocal(updated);
  };

  const clearCartLocal = async () => {
    await saveCartLocal([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Giỏ hàng của tôi</Text>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../../assets/lottie/empty-cart.json')}
            autoPlay
            loop
            style={styles.emptyAnimation}
          />
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      ) : (
        <>
          <SwipeListView
            data={cartItems}
            keyExtractor={(item, index) => String(item.productId ?? item.id ?? index)}
            renderItem={({ item, index }) => {
              const pid = item.productId ?? item.id;
              if (pid === undefined) return null;
              return (
                <View style={styles.itemCard} key={`cartitem_${pid}_${index}`}>
                  <Image source={{ uri: item.image?.startsWith('http') ? item.image : `${BASE_URL}/public/products/image/${item.image}` }} style={styles.image} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.productName || item.name}</Text>
                    <Text style={styles.price}>{item.price?.toLocaleString()} đ</Text>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseQty(pid)}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => increaseQty(pid)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
            renderHiddenItem={({ item, index }) => {
              const pid = item.productId ?? item.id;
              if (pid === undefined) return null;
              return (
                <View style={styles.rowBack} key={`hidden_${pid}_${index}`}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem(pid)}>
                    <Text style={styles.deleteText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            rightOpenValue={-75}
            disableRightSwipe
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Tổng tiền: {total.toLocaleString()} đ</Text>
          </View>
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearCartLocal}>
              <Text style={styles.clearBtnText}>🗑️ Xóa hết giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyBtnMain}
              onPress={async () => {
                if (cartItems.length === 0) {
                  Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước khi thanh toán!');
                  return;
                }
                await syncCartToServer();
                navigation.navigate('Checkout', { cartItems });
              }}
            >
              <Text style={styles.buyBtnText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// Styles giữ nguyên như bạn gửi


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 10,
    height: 80, // cố định height
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  qtyBtn: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 4,
  },
  qtyBtnText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  qtyText: { fontSize: 16, minWidth: 24, textAlign: 'center' },
  rowBack: {
    height: 80, // bằng itemCard
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    borderRadius: 10,
  },
  deleteBtn: { justifyContent: 'center', alignItems: 'center', width: 75, height: '100%' },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  totalRow: { marginTop: 16, alignItems: 'flex-end' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: 'green' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  clearBtn: { backgroundColor: '#aaa', padding: 12, borderRadius: 8, alignItems: 'center' },
  clearBtnText: { color: '#fff', fontWeight: 'bold' },
  buyBtnMain: { backgroundColor: '#f00', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 14, color: 'red' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyAnimation: { width: 250, height: 250 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#555' },
});
