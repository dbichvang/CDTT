import { useNavigation } from '@react-navigation/native';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const products = [
  {
    id: '1',
    name: 'iPhone 11 pro',
    price: '$199',
    image: require('../../assets/images/11.jpg'),
    color: '#000',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'AirPods 3rd',
    price: '$79',
    image: require('../../assets/images/airpod.webp'),
    color: '#fff',
    rating: 4.0,
  },
  {
    id: '3',
    name: 'iPhone 13',
    price: '$512',
    image: require('../../assets/images/13prm.jpg'),
    color: '#888',
    rating: 4.8,
  },
];

const Hometab = () => {
  const navigation = useNavigation();
  const [savedProducts, setSavedProducts] = useState<string[]>([]); // ✅ theo dõi các sp đã lưu

  const handleSave = async (item: any) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      cart.push(item);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      setSavedProducts((prev) => [...prev, item.id]); // đánh dấu đã lưu

      setTimeout(() => {
        setSavedProducts((prev) => prev.filter((id) => id !== item.id));
      }, 3000);
    } catch (error) {
      console.error('Error saving to cart:', error);
    }
  };

  const renderProductCard = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.productCard}
      onPress={() => (navigation as any).navigate('Details', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.productImage} resizeMode="contain" />
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.priceAndColorRow}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingText}>{item.rating}</Text>
        <Text style={styles.ratingStar}>⭐</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(item)}>
        <Text style={styles.saveButtonText}>Save</Text>
        {savedProducts.includes(item.id) && (
          <Text style={{ fontSize: 10, color: 'green', marginTop: 4 }}>✔ Đã thêm vào giỏ</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.bannerContainer}>
        <Image source={require('../../assets/images/Group2.png')} style={styles.bannerImage} resizeMode="contain" />
      </View>

      <Text style={styles.sectionTitle}>New Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {products.map(renderProductCard)}
      </ScrollView>

      <Text style={styles.sectionTitle}>Top Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {products.map(renderProductCard)}
      </ScrollView>

      <Text style={styles.sectionTitle}>Best Selling Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
        {products.map(renderProductCard)}
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
