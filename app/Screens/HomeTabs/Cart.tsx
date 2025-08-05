import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, CartItem } from '../../types';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigation = useNavigation<CartScreenNavigationProp>();

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      const items = stored ? JSON.parse(stored) : [];

      const updatedItems = items.map((item: any) => ({
        ...item,
        quantity: item.quantity || 1,
      }));

      setCartItems(updatedItems);
    } catch (error) {
      console.error('Lỗi khi load cart:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCart);
    return unsubscribe;
  }, [navigation]);

  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    await AsyncStorage.setItem('cart', JSON.stringify(items));
  };

  const handleDelete = (index: number) => {
    Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const updatedCart = [...cartItems];
          updatedCart.splice(index, 1);
          await saveCart(updatedCart);
        },
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Xác nhận', 'Bạn muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('cart');
          setCartItems([]);
        },
      },
    ]);
  };

  const increaseQuantity = async (index: number) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity += 1;
    await saveCart(updatedCart);
  };

  const decreaseQuantity = async (index: number) => {
    const updatedCart = [...cartItems];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      await saveCart(updatedCart);
    }
  };

  const handleBuyNow = () => {
    navigation.navigate('Checkout', { cartItems });
  };

  const renderItem = ({ item, index }: { item: CartItem; index: number }) => (
    <View style={styles.itemCard}>
      <Image source={item.image} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDelete(index)}>
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>{item.price}</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseQuantity(index)}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNumber}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => increaseQuantity(index)}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Giỏ hàng của tôi</Text>
      {cartItems.length === 0 ? (
        <Text style={{ marginTop: 20, textAlign: 'center' }}>Giỏ hàng trống</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
          />
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
            <Text style={styles.clearBtnText}>🗑️ Xóa hết giỏ hàng</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Cart;

// ⬇ styles giữ nguyên như bạn đã có
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, borderRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 14, color: '#f00', marginVertical: 4 },
  deleteIcon: { fontSize: 20, color: 'red' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  qtyBtn: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
  },
  qtyText: { fontSize: 18, fontWeight: 'bold' },
  qtyNumber: { fontSize: 16, marginHorizontal: 10 },
  buyBtn: {
    backgroundColor: '#f00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearBtn: {
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
