import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  Details: { product: Product };
};

export type Product = {
  productId: number;
  productName: string;
  price: number;
  image?: string;
  color?: string;
  rating?: number;
  [key: string]: any;
};

export default function Search() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { categories, loading: loadingCategories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [toastProductId, setToastProductId] = useState<number | null>(null);

  // Khoảng giá
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Load tất cả sản phẩm
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingProducts(true);
      try {
        let allProducts: Product[] = [];
        let page = 0;
        let hasMore = true;
        const pageSize = 50;

        while (hasMore) {
          const endpoint = selectedCategory
            ? `public/categories/${selectedCategory}/products?pageNumber=${page}&pageSize=${pageSize}&sortBy=productId&sortOrder=asc`
            : `public/products?pageNumber=${page}&pageSize=${pageSize}&sortBy=productId&sortOrder=asc`;
          const response = await GET_ALL(endpoint);
          const items: Product[] = response.data.content || [];

          items.forEach((item) => {
            const key = item.productId || item.id;
            if (!allProducts.some((p) => (p.productId || p.id) === key)) {
              allProducts.push(item);
            }
          });

          if (items.length === 0 || response.data.last === true) {
            hasMore = false;
          } else {
            page++;
          }
        }

        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchAllProducts();
  }, [selectedCategory]);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  // Filter theo searchText + category + khoảng giá
  const filteredProducts = products.filter((product) => {
    const text = normalize(searchText);
    const matchesText =
      searchText.trim() === "" ||
      (product.productName && normalize(product.productName).includes(text)) ||
      (product.name && normalize(product.name).includes(text)) ||
      (product.title && normalize(product.title).includes(text));

    const price = Number(product.price || 0);
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
    const matchesPrice = price >= min && price <= max;

    return matchesText && matchesPrice;
  });

  const handleSaveToCart = async (item: Product) => {
    try {
      const existingCart = await AsyncStorage.getItem("cart");
      let cart: Product[] = existingCart ? JSON.parse(existingCart) : [];
      const existingIndex = cart.findIndex((p) => p.productId === item.productId);

      if (existingIndex !== -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }

      await AsyncStorage.setItem("cart", JSON.stringify(cart));

      setToastProductId(item.productId || item.id);
      setTimeout(() => setToastProductId(null), 2000);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
    }
  };

  if (loadingCategories) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require("../../assets/images/Group2.png")}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>

      {/* Search + Price */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <View style={{ flexDirection: "row", marginHorizontal: 10, marginBottom: 10 }}>
        <TextInput
          style={[styles.searchInput, { flex: 1, marginRight: 5 }]}
          placeholder="Giá từ (₫)"
          keyboardType="numeric"
          value={minPrice}
          onChangeText={setMinPrice}
        />
        <TextInput
          style={[styles.searchInput, { flex: 1, marginLeft: 5 }]}
          placeholder="Giá đến (₫)"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
      </View>

      {/* Category */}
      <CategoryScreen
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Products */}
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
            filteredProducts.map((item: Product, idx: number) => (
              <View
                key={item.productId ? `${item.productId}-${idx}` : `idx-${idx}`}
                style={styles.productCard}
              >
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={() => navigation.navigate("Details", { product: item })}
                >
                  <Image
                    source={{
                      uri: item.image
                        ? `http://10.18.12.179:8080/api/public/products/image/${item.image}`
                        : "https://via.placeholder.com/170x170",
                    }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Details", { product: item })}>
                  <Text style={styles.productName}>{item.productName}</Text>
                </TouchableOpacity>

                <View style={styles.priceSaveContainer}>
                  <Text style={styles.productPrice}>{item.price?.toLocaleString()} ₫</Text>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleSaveToCart(item)}
                  >
                    <Text style={{ fontWeight: "bold" }}>Thêm vào giỏ</Text>
                  </TouchableOpacity>
                </View>

                {toastProductId === item.productId && (
                  <View style={styles.toast}>
                    <Text style={styles.toastText}>✅ Đã thêm vào giỏ hàng!</Text>
                  </View>
                )}
              </View>
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
    height: width * 0.5,
    marginBottom: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  bannerImage: { width: width, height: width * 0.5 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  productList: { marginTop: 10, marginHorizontal: 10 },
  productCard: {
    width: width * 0.4,
    backgroundColor: "#f9f9f9",
    borderRadius: 30,
    marginRight: 15,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  imageContainer: { width: "100%", height: 120 },
  productImage: { width: "100%", height: "100%", borderRadius: 30 },
  productName: { fontSize: 16, fontWeight: "500", marginTop: 8, textAlign: "center" },
  priceSaveContainer: { marginTop: 8, width: "100%", alignItems: "center" },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#f00" },
  saveButton: {
    marginTop: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  toast: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#4caf50",
    padding: 6,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 1000,
  },
  toastText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});
