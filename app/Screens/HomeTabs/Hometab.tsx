import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllProducts } from '../APIService';

const { width } = Dimensions.get('window');

const Hometab = () => {
  const navigation = useNavigation<any>();
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sắp xếp sản phẩm mới nhất theo createdAt giảm dần
  const newProducts = products
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Random sản phẩm
  const randomProducts = products
    .slice()
    .sort(() => Math.random() - 0.5);

  // Lọc sản phẩm có discount > 0
  const discountedProducts = products.filter(
    (p) => p.discount && p.discount > 0
  );

  // Chuyển sang màn Detail và truyền nguyên product
  const handlePress = (product: any) => {
    navigation.navigate('Details', { product });
  };

  const getImageUrl = (imageName: string) => {
    return imageName
      ? `http://localhost:8080/api/public/products/image/${imageName}`
      : 'https://via.placeholder.com/170x170';
  };

  if (loading) {
    return (
      <View style={{ marginTop: 20 }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const handleSave = async (item: any) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      const existingIndex = cart.findIndex((p: any) => p.productId === item.productId);
      if (existingIndex !== -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      setSavedProducts((prev) => [...prev, item.productId]);
      setTimeout(() => {
        setSavedProducts((prev) => prev.filter((id) => id !== item.productId));
      }, 2000);
    } catch (error) {
      console.error('Error saving to cart:', error);
    }
  };

  const renderProductCard = (item: any, idx: number) => (
    <TouchableOpacity
      key={item.productId || item.id || idx}
      style={styles.productCard}
      onPress={() => handlePress(item)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.productName}>{item.productName}</Text>
      <View style={styles.priceAndColorRow}>
        <View
          style={[styles.colorIndicator, { backgroundColor: item.color || '#ccc' }]}
        />
        <Text style={styles.productPrice}>{item.price.toLocaleString()} ₫</Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingText}>{item.rating || 0}</Text>
        <Text style={styles.ratingStar}>⭐</Text>
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => handleSave(item)}
      >
        <Text style={styles.saveButtonText}>Save</Text>
        {savedProducts.includes(item.productId) && (
          <Text style={{ fontSize: 10, color: 'green', marginTop: 4 }}>
            ✔ Đã thêm vào giỏ
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/Group2.png')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.sectionTitle}>New Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {newProducts.map((item, idx) => renderProductCard(item, idx))}
      </ScrollView>

      <Text style={styles.sectionTitle}>All Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {randomProducts.map((item, idx) => renderProductCard(item, idx))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Discounted Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {discountedProducts.map((item, idx) => renderProductCard(item, idx))}
      </ScrollView>
    </ScrollView>
  );
};

export default Hometab;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bannerContainer: { alignItems: 'center', marginVertical: 20 },
  bannerImage: { width: width * 0.9, height: 180, borderRadius: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '600', marginTop: 20, marginHorizontal: 20 },
  productList: { marginTop: 10, marginHorizontal: 10 },
  productCard: {
    width: width * 0.4,
    backgroundColor: '#f9f9f9',
    borderRadius: 30,
    marginRight: 15,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  imageContainer: { width: '100%', height: 120 },
  productImage: { width: '100%', height: '100%', borderRadius: 30 },
  productName: { fontSize: 16, fontWeight: '500', marginTop: 8, textAlign: 'center' },
  priceAndColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  colorIndicator: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#f00' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
  },
  ratingText: { fontSize: 14, fontWeight: 'bold', marginRight: 4 },
  ratingStar: { fontSize: 14 },
  saveButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    position: 'absolute',
    bottom: 10,
    right: 10,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 12, fontWeight: 'bold' },
});
