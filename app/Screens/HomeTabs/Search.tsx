
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GET_ALL } from "../APIService";
import CategoryScreen from "../CategoryScreen";
import useCategories from "../useCategory";

const { width } = Dimensions.get("window");
type RootStackParamList = {
  Details: { product: any };
  // add other routes if needed
};

export default function Search() {
  // ...existing code...
  const handleSaveToCart = async (item: any) => {
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
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm.');
    }
  };
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { categories, loading: loadingCategories } = useCategories();
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        let endpoint = selectedCategory
          ? `public/categories/${selectedCategory}/products?pageNumber=0&pageSize=10&sortBy=productId&sortOrder=asc`
          : `public/products?pageNumber=0&pageSize=10&sortBy=productId&sortOrder=asc`;
        const response = await GET_ALL(endpoint);
        setProducts(response.data.content);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Lọc sản phẩm theo searchText
  const filteredProducts = products.filter((product) =>
    product.productName?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loadingCategories) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Banner background */}
     <View style={styles.bannerContainer}>
            <Image source={require('../../assets/images/Group2.png')} style={styles.bannerImage} resizeMode="contain" />
          </View>
      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Category buttons */}
      <CategoryScreen
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {/* Product list */}
      {loadingProducts ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ff6347" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
          {filteredProducts.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 30 }}>
              Không có sản phẩm nào.
            </Text>
          ) : (
            filteredProducts.map((item) => (
              <TouchableOpacity
                key={item.productId}
                style={styles.productCard}
                onPress={() => navigation.navigate('Details', { product: item })}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.image ? `http://localhost:8080/api/public/products/image/${item.image}` : "https://via.placeholder.com/170x170" }}
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
                <TouchableOpacity style={{marginTop:8, backgroundColor:'#eee', borderRadius:10, padding:6}} onPress={() => handleSaveToCart(item)}>
                  <Text style={{fontWeight:'bold'}}>Save</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerContainer: {
    width: "100%",
    height: width * 0.5, // gần nửa màn hình
    marginBottom: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  bannerImage: {
    width: width,
    height: width * 0.5,
    borderRadius: 0,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
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
});
