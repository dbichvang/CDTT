import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
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
import { GET_ALL, SAVE_TO_CART } from '../APIService';

const { width, height } = Dimensions.get('window');

const Hometab = () => {
  const navigation = useNavigation<any>();
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);

  // Hiển thị animation 2 giây khi vào HomeTab
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Load sản phẩm + giỏ hàng local khi mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        let allProducts: any[] = [];
        let page = 0;
        let hasMore = true;
        const pageSize = 50;
        while (hasMore) {
          const endpoint = `public/products?pageNumber=${page}&pageSize=${pageSize}&sortBy=productId&sortOrder=asc`;
          const response = await GET_ALL(endpoint);
          const items = response.data?.content || [];
          allProducts = allProducts.concat(items);
          if (items.length === 0 || response.data?.last === true) {
            hasMore = false;
          } else {
            page++;
          }
        }
        setProducts(allProducts);
      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadSavedProducts = async () => {
      try {
        const cartStr = await AsyncStorage.getItem('cart');
        const cartItems = cartStr ? JSON.parse(cartStr) : [];
        setSavedProducts(cartItems.map((p: any) => p.productId));
      } catch (error) {
        console.error('Lỗi load giỏ hàng local:', error);
      }
    };

    fetchAllProducts();
    loadSavedProducts();
  }, []);

  // Sắp xếp sản phẩm mới nhất
  let newProducts: any[] = [];
  if (products.length > 0) {
    if (products[0].createdAt) {
      newProducts = products
        .slice()
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } else {
      newProducts = products.slice().reverse();
    }
  }

  const randomProducts = products.length > 0 ? [...products].sort(() => Math.random() - 0.5) : [];
  const discountedProducts = products.filter((p) => p.discount && p.discount > 0);

  const handlePress = (product: any) => {
    navigation.navigate('Details', { product });
  };

  const getImageUrl = (imageName: string) => {
    return imageName
      ? `http://10.18.12.179:8080/api/public/products/image/${imageName}`
      : 'https://via.placeholder.com/170x170';
  };

  // Save local + server
  const handleSave = async (item: any) => {
    try {
      await SAVE_TO_CART({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
      setSavedProducts(prev => [...prev, item.productId]);
      alert('✅ Đã thêm sản phẩm vào giỏ hàng thành công');
    } catch (error) {
      console.error('Lỗi lưu giỏ hàng:', error);
      alert('❌ Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const renderProductCard = (item: any, idx: number) => {
    const key = item.productId ? `${item.productId}_${idx}` : (item.id ? `${item.id}_${idx}` : `idx-${idx}`);
    const imageUrl = item.image ? getImageUrl(item.image) : 'https://via.placeholder.com/170x170';
    const isSaved = savedProducts.includes(item.productId);

    return (
      <TouchableOpacity
        key={key}
        style={styles.productCard}
        onPress={() => handlePress(item)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />
        </View>

        <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
          {item.productName}
        </Text>

        <View style={styles.bottomContainer}>
          <Text style={styles.productPrice} numberOfLines={1} ellipsizeMode="tail">
            {item.price?.toLocaleString()} ₫
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, isSaved && { opacity: 0.6 }]}
            onPress={() => handleSave(item)}
            disabled={isSaved}
          >
            <Text style={styles.saveButtonText}>{isSaved ? 'Đã thêm' : 'thêm vào giỏ'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ marginTop: 20 }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/images/Group2.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
          {newProducts.map((item, idx) => renderProductCard(item, idx))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
          {randomProducts.map((item, idx) => renderProductCard(item, idx))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Sản phẩm giảm giá</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
          {discountedProducts.map((item, idx) => renderProductCard(item, idx))}
        </ScrollView>
      </ScrollView>

      {showAnimation && (
        <View style={styles.fullScreenAnimation}>
          <LottieView
            source={require('../../assets/lottie/Hello.json')}
            autoPlay
            loop={false}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 260,
    justifyContent: 'space-between',
  },
  imageContainer: { width: '100%', height: 120 },
  productImage: { width: '100%', height: 120, borderRadius: 15 },
  productName: { fontSize: 16, fontWeight: '500', textAlign: 'center', minHeight: 40 },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f00',
    marginBottom: 6,
    width: '100%',
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#565152',
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  bottomContainer: { width: '100%', marginTop: 8, alignItems: 'center' },
  fullScreenAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 999,
    backgroundColor: '#fff',
  },
});
