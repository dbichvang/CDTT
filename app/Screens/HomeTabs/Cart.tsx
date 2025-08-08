import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
};

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load giỏ hàng
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
    loadCart();
  }, []);

  // Lưu giỏ hàng
  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    await AsyncStorage.setItem('cart', JSON.stringify(items));
  };

  // Xóa 1 sản phẩm
  const deleteItem = (id: number) => {
    Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const updated = cartItems.filter(item => item.id !== id);
          saveCart(updated);
        }
      }
    ]);
  };

  // Xóa hết
  const clearCart = () => {
    Alert.alert('Xác nhận', 'Bạn muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('cart');
          setCartItems([]);
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price} đ</Text>
      </View>
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Giỏ hàng của tôi</Text>
      {cartItems.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Giỏ hàng trống</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
          />
          <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
            <Text style={styles.clearBtnText}>🗑️ Xóa hết giỏ hàng</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 10
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 14, color: 'red' },
  deleteIcon: { fontSize: 18, color: 'red', padding: 5 },
  clearBtn: { backgroundColor: '#aaa', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  clearBtnText: { color: '#fff', fontWeight: 'bold' }
});
