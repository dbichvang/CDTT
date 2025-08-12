import React, { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Alert, Dimensions, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width } = Dimensions.get('window');

const DetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  const product = params?.product;
  const [tab, setTab] = useState('Photos');
  const [showImageModal, setShowImageModal] = useState(false);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#888' }}>Không có dữ liệu sản phẩm.</Text>
      </View>
    );
  }

  // Lưu sản phẩm vào giỏ hàng, kiểm tra trùng productId, cộng quantity
  const handleAddToCart = async () => {
    if (!product) {
      Alert.alert('Lỗi', 'Không có sản phẩm!');
      return;
    }
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      const key = product.productId || product.id;
      const existingIndex = cart.findIndex((p: any) => (p.productId || p.id) === key);
      if (existingIndex !== -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        const { quantity, ...rest } = product;
        cart.push({ ...rest, quantity: 1 });
      }
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm.');
      console.log('Lỗi:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{product.productName || product.name || product.title || "Không có tên"}</Text>
      <Text style={styles.price}>{product.price ? `${product.price.toLocaleString()} ₫` : product.price || ""}</Text>

      <TouchableOpacity onPress={() => setShowImageModal(true)}>
        <Image
          source={{ uri: product.image ? `http://localhost:8080/api/public/products/image/${product.image}` : "https://via.placeholder.com/170x170" }}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      {/* Modal hiển thị ảnh chi tiết */}
      {showImageModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowImageModal(false)}>
            <Image
              source={{ uri: product.image ? `http://localhost:8080/api/public/products/image/${product.image}` : "https://via.placeholder.com/170x170" }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabs}>
        {['Photos', 'Colours', 'Description', 'Comments'].map((item) => (
          <TouchableOpacity key={item} onPress={() => setTab(item)}>
            <Text style={[styles.tabText, tab === item && styles.activeTab]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content: chỉ hiển thị ảnh sản phẩm */}
      {tab === 'Photos' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContent}>
          <Image source={{ uri: product.image ? `http://localhost:8080/api/public/products/image/${product.image}` : "https://via.placeholder.com/170x170" }} style={styles.photoItem} resizeMode="contain" />
        </ScrollView>
      )}
      {tab === 'Colours' && (
        <View style={styles.colorsRow}>
          <Text>🟨 Gold</Text>
          <Text>🟩 Green</Text>
          <Text>⬛ Space Gray</Text>
        </View>
      )}
      {tab === 'Description' && (
        <View style={styles.description}>
          <Text style={styles.descText}><Text style={styles.bold}>Mô tả:</Text> {product.description || 'Không có mô tả'}</Text>
        </View>
      )}
      {tab === 'Comments' && (
        <ScrollView style={styles.tabContent}>
          <Text><Text style={styles.bold}>@user1:</Text> Rất tốt</Text>
          <Text><Text style={styles.bold}>@user2:</Text> Hài lòng</Text>
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleAddToCart}>
          <Text style={styles.saveButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={async () => {
          if (!product) return;
          // Tạo giỏ hàng chỉ với sản phẩm này
          const { quantity, ...rest } = product;
          const singleCart = [{ ...rest, quantity: 1 }];
          await AsyncStorage.setItem('cart', JSON.stringify(singleCart));
          // Chuyển sang màn hình Cart để thanh toán sản phẩm này
          (navigation as any).navigate('Cart');
        }}>
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fullImage: {
    width: width * 0.95,
    height: width * 0.95,
    borderRadius: 20,
  },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { marginTop: 60, fontSize: 24, fontWeight: 'bold' },
  price: { fontSize: 20, color: '#888', marginVertical: 10 },
  mainImage: { width: width * 0.8, height: width * 0.8, alignSelf: 'center', borderRadius: 20 },
  tabs: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 20, borderBottomWidth: 1, borderColor: '#ccc',
  },
  tabText: { fontSize: 16, paddingVertical: 6 },
  activeTab: { fontWeight: 'bold', color: '#f00' },
  tabContent: { marginTop: 10, flex: 1 },
  photoItem: { width: width * 0.4, height: width * 0.4, marginRight: 10, borderRadius: 10 },
  colorsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  description: { marginTop: 20 },
  descText: { fontSize: 16, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  saveButton: {
    backgroundColor: '#ddd', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, flex: 1, alignItems: 'center',
  },
  saveButtonText: { fontSize: 14, fontWeight: 'bold' },
  buyBtn: {
    backgroundColor: '#f00', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, flex: 2, alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  qtyButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  // Removed duplicate 'description' key
});

