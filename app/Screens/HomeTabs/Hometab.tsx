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
import { ADD_TO_CART, GET_ALL, GET_CART,REMOVE_FROM_CART, UPDATE_CART_ITEM  } from '../APIService';

  const { width } = Dimensions.get('window');

  const Hometab = () => {
    const navigation = useNavigation<any>();
    const [savedProducts, setSavedProducts] = useState<string[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingProductIds, setAddingProductIds] = useState<string[]>([]); // để disable nút khi đang gọi API

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
      fetchAllProducts();
    }, []);

    // Sản phẩm mới nhất: nếu có ngày tạo thì sắp xếp giảm dần, nếu không thì lấy từ dưới lên (cuối mảng)
    let newProducts: any[] = [];
    if (products.length > 0) {
      if (products[0].createdAt) {
        newProducts = products.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        newProducts = products.slice().reverse();
      }
    }

    // Random hóa toàn bộ sản phẩm, không thiếu
    const randomProducts = products.length > 0 ? [...products].sort(() => Math.random() - 0.5) : [];

    // Sản phẩm giảm giá: chỉ lấy sản phẩm có discount > 0
    const discountedProducts = products.filter((p) => p.discount && p.discount > 0);

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

    // Hàm xử lý lưu sản phẩm vào giỏ hàng backend và đồng bộ local
 // Trong Hometab component

const handleSave = async (item: any) => {
  try {
    const cartIdStr = await AsyncStorage.getItem('cart-id');
    console.log('DEBUG cart-id:', cartIdStr);

    if (!cartIdStr || cartIdStr === '0') {
      alert('Bạn chưa đăng nhập hoặc chưa có giỏ hàng trên server');
      return;
    }

    const cartId = parseInt(cartIdStr);

    await ADD_TO_CART(cartId, item.productId, 1);

    const updatedCart = await GET_CART(cartId);

    if (updatedCart && updatedCart.products) {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart.products));
      alert('Đã thêm sản phẩm vào giỏ hàng');
    } else {
      alert('Không lấy được giỏ hàng mới');
    }
  } catch (error) {
    console.error('Error saving to cart:', error);
    alert('Thêm sản phẩm vào giỏ hàng thất bại');
  }
};


    const renderProductCard = (item: any, idx: number) => {
      // Key duy nhất: ưu tiên productId, sau đó id, sau đó idx
      const key = item.productId ? `${item.productId}_${idx}` : (item.id ? `${item.id}_${idx}` : `idx-${idx}`);
      // Kiểm tra image hợp lệ
      const imageUrl = item.image ? getImageUrl(item.image) : 'https://via.placeholder.com/170x170';
      const isAdding = addingProductIds.includes(item.productId);

      return (
        <TouchableOpacity
          key={key}
          style={styles.productCard}
          onPress={() => handlePress(item)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.productName}>{item.productName}</Text>
          <View style={styles.priceAndColorRow}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color || '#ccc' }]} />
            <Text style={styles.productPrice}>{item.price?.toLocaleString()} ₫</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>{item.rating || 0}</Text>
            <Text style={styles.ratingStar}>⭐</Text>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isAdding && { backgroundColor: '#ccc' }]}
            onPress={() => handleSave(item)}
            disabled={isAdding}
          >
            <Text style={styles.saveButtonText}>{isAdding ? 'Đang thêm...' : 'Save'}</Text>
            {savedProducts.includes(item.productId) && (
              <Text style={{ fontSize: 10, color: 'green', marginTop: 4 }}>
                ✔ Đã thêm vào giỏ
              </Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      );
    };

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
      borderRadius: 20,
      marginRight: 15,
      padding: 10,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 3,
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
