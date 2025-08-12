import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeListView } from 'react-native-swipe-list-view';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// *** IMPORT API CALLS từ file api của bạn, chỉnh sửa đường dẫn cho đúng ***
import { GET_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART } from '../APIService';

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

export default function Cart() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);

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

  // Cập nhật tổng tiền khi cartItems thay đổi
  useEffect(() => {
    const sum = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    setTotal(sum);
  }, [cartItems]);

  // Lưu cart vào AsyncStorage và set state
  const saveCartLocal = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
      setCartItems(items);
    } catch (error) {
      console.error('Lỗi lưu giỏ hàng local:', error);
    }
  };

  // Xóa sản phẩm, gọi API backend rồi cập nhật giỏ
  const deleteItemLocal = (productId: string | number | undefined) => {
    if (productId === undefined) {
      Alert.alert('Lỗi', 'Sản phẩm không hợp lệ');
      return;
    }
    Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const cartIdStr = await AsyncStorage.getItem('cart-id');
            if (!cartIdStr) {
              Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc không có giỏ hàng');
              return;
            }
            const cartId = parseInt(cartIdStr);

            await REMOVE_FROM_CART(cartId, Number(productId));

            const updatedCart = await GET_CART(cartId);
            if (updatedCart?.items) {
              await AsyncStorage.setItem('cart', JSON.stringify(updatedCart.items));
              setCartItems(updatedCart.items);
            } else {
              setCartItems([]);
              await AsyncStorage.removeItem('cart');
            }
          } catch (error) {
            Alert.alert('Lỗi', 'Xóa sản phẩm thất bại');
            console.error('Lỗi xóa sản phẩm:', error);
          }
        },
      },
    ]);
  };

  // Tăng số lượng sản phẩm, gọi API rồi lấy lại giỏ mới nhất
  const increaseQty = async (productId: number | string, currentQty: number = 1) => {
    try {
      const cartIdStr = await AsyncStorage.getItem('cart-id');
      if (!cartIdStr) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc không có giỏ hàng');
        return;
      }
      const cartId = parseInt(cartIdStr);
      await UPDATE_CART_ITEM(cartId, Number(productId), currentQty + 1);
      const updatedCart = await GET_CART(cartId);
      if (updatedCart?.items) {
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart.items));
        setCartItems(updatedCart.items);
      }
    } catch (error) {
      console.error('Lỗi cập nhật số lượng:', error);
    }
  };

  // Giảm số lượng sản phẩm (không giảm dưới 1), gọi API rồi lấy giỏ mới
  const decreaseQty = async (productId: number | string, currentQty: number = 1) => {
    if (currentQty <= 1) return;
    try {
      const cartIdStr = await AsyncStorage.getItem('cart-id');
      if (!cartIdStr) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc không có giỏ hàng');
        return;
      }
      const cartId = parseInt(cartIdStr);
      await UPDATE_CART_ITEM(cartId, Number(productId), currentQty - 1);
      const updatedCart = await GET_CART(cartId);
      if (updatedCart?.items) {
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart.items));
        setCartItems(updatedCart.items);
      }
    } catch (error) {
      console.error('Lỗi cập nhật số lượng:', error);
    }
  };

  const renderItem = (data: { item: CartItem; index: number }) => {
    const { item, index } = data;
    const name = item.productName || item.name || 'Không có tên';
    const price = item.price ? `${item.price.toLocaleString()} đ` : '';
    let image = 'https://via.placeholder.com/60x60';
    if (item.image) {
      if (item.image.startsWith('http')) {
        image = item.image;
      } else {
        image = `http://localhost:8080/api/public/products/image/${item.image}`;
      }
    }

    const pid = item.productId ?? item.id;
    if (pid === undefined) {
      console.warn('Sản phẩm thiếu id:', item);
      return null;
    }

    return (
      <View style={styles.itemCard} key={`cartitem_${pid}_${index}`}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>{price}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseQty(pid, item.quantity)}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity || 1}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => increaseQty(pid, item.quantity)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHiddenItem = (data: { item: CartItem; index: number }) => {
    const pid = data.item.productId ?? data.item.id;
    if (pid === undefined) return null;
    return (
      <View style={styles.rowBack} key={`hidden_${pid}_${data.index}`}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItemLocal(pid)}>
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const clearCartLocal = () => {
    Alert.alert('Xác nhận', 'Bạn muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('cart');
            setCartItems([]);
          } catch (error) {
            Alert.alert('Lỗi', 'Xóa giỏ hàng thất bại');
            console.error(error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Giỏ hàng của tôi</Text>
      {cartItems.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Giỏ hàng trống</Text>
      ) : (
        <>
          <SwipeListView
            data={cartItems}
            keyExtractor={(item, index) => `cart_${item.id || item.productId}_${index}`}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75}
            disableRightSwipe
            previewRowKey={`cart_${cartItems[0]?.id || cartItems[0]?.productId}_0`}
            previewOpenValue={-40}
            previewOpenDelay={3000}
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
              onPress={() => {
                if (cartItems.length === 0) {
                  Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước khi thanh toán!');
                  return;
                }
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
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyBtn: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 4,
  },
  qtyBtnText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    flex: 1,
    marginBottom: 10,
    borderRadius: 10,
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  deleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalRow: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  clearBtn: {
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buyBtnMain: {
    backgroundColor: '#f00',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 14, color: 'red' },
});
