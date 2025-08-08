import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { GET_ALL, GET_IMG } from "../APIService";
import useCategories from "../useCategory";
import CategoryScreen from "../CategoryScreen";

export default function Feed({ navigation }: { navigation: any }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { categories } = useCategories();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = selectedCategory
          ? `public/categories/${selectedCategory}/products?pageNumber=0&pageSize=5&sortBy=productId&sortOrder=asc`
          : `public/products?pageNumber=0&pageSize=5&sortBy=productId&sortOrder=asc`;

        const response = await GET_ALL(endpoint);
        setProducts(response.data.content);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Hãy mua sản phẩm bạn đang cần</Text>

      {/* Search */}
      <TextInput placeholder="Search" style={styles.searchInput} />

      {/* Category */}
      <CategoryScreen
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Product List */}
      <View style={styles.productList}>
        {products.map((product: any) => (
          <TouchableOpacity
            key={product.productId}
            style={styles.productCard}
            onPress={() => navigation.push("ProductDetails", { productId: product.productId })}
          >
            <Image
              style={styles.productImage}
              source={{ uri: GET_IMG("products", product.image) }}
            />
            <Text style={styles.productName}>{product.productName}</Text>
            <Text>{product.category?.categoryName}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 18, marginBottom: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  productList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard: { width: "48%", borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 15 },
  productImage: { width: "100%", height: 100, borderRadius: 10 },
  productName: { fontWeight: "bold", marginTop: 5 },
});
