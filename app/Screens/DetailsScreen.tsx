import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const DetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const product = (route.params as any)?.product;

  const [showImageModal, setShowImageModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Nếu không có product, hiển thị thông báo
  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Không có thông tin sản phẩm</Text>
      </View>
    );
  }

  const handleAddToCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      let cart = storedCart ? JSON.parse(storedCart) : [];

      const key = product.productId || product.id;
      const existingIndex = cart.findIndex((p: any) => (p.productId || p.id) === key);

      if (existingIndex !== -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        const { quantity, ...rest } = product;
        cart.push({ ...rest, quantity: 1 });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      // Hiển thị toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

const handleBuyNow = () => {
  const { quantity, ...rest } = product;
  const singleCart = [{ ...rest, quantity: 1 }];
  (navigation as any).navigate('Checkout', { cartItems: singleCart });
};


  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{product.productName || 'Không có tên'}</Text>
        <Text style={styles.price}>{product.price ? `${product.price.toLocaleString()} ₫` : ''}</Text>

        <TouchableOpacity onPress={() => setShowImageModal(true)}>
          <Image
            source={{
              uri: product.image
                ? `http://10.18.12.179:8080/api/public/products/image/${product.image}`
                : 'https://via.placeholder.com/170x170',
            }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {showImageModal && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowImageModal(false)}>
              <Image
                source={{
                  uri: product.image
                    ? `http://10.18.12.179:8080/api/public/products/image/${product.image}`
                    : 'https://via.placeholder.com/170x170',
                }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.description}>
          <Text style={styles.descText}>
            <Text style={styles.bold}>Mô tả: </Text>
            {product.description || 'Không có mô tả'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleAddToCart}>
          <Text style={styles.saveButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✅ Đã thêm sản phẩm vào giỏ hàng!</Text>
        </View>
      )}
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 20 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { marginTop: 60, fontSize: 24, fontWeight: 'bold' },
  price: { fontSize: 20, color: '#888', marginVertical: 10 },
  mainImage: { width: width * 0.8, height: width * 0.8, alignSelf: 'center', borderRadius: 20 },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  fullImage: { width: width * 0.95, height: width * 0.95, borderRadius: 20 },
  description: { marginTop: 20 },
  descText: { fontSize: 16, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  buttonRow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#ddd', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, flex: 1, alignItems: 'center', marginRight: 5,
  },
  saveButtonText: { fontSize: 14, fontWeight: 'bold' },
  buyBtn: {
    backgroundColor: '#f00', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, flex: 2, alignItems: 'center', marginLeft: 5,
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
