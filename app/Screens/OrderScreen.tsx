import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  OrderScreen: { orderObj: any };
};

type OrderScreenNavProp = NativeStackNavigationProp<RootStackParamList, "OrderScreen">;

const OrderScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<OrderScreenNavProp>();
  const { orderObj } = route.params;

  const items = (orderObj.cartItems || []).map((item: any) => ({
    ...item,
    name: item.name || "Sản phẩm",
    image: item.image
      ? item.image.startsWith("http")
        ? item.image
        : `http://10.18.12.179:8080/api/public/products/image/${item.image}`
      : "https://via.placeholder.com/60",
    quantity: item.quantity || 1,
    price: Number(item.price) || 0,
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Đơn hàng #{orderObj.orderId || orderObj.id}</Text>
      </View>

      {/* Thông tin khách */}
      <Text style={styles.infoText}>Khách hàng: {orderObj.customerName || "N/A"}</Text>
      <Text style={styles.infoText}>SĐT: {orderObj.phone || "N/A"}</Text>
      <Text style={styles.infoText}>Địa chỉ: {orderObj.address || "N/A"}</Text>
      <Text style={styles.infoText}>Trạng thái: {orderObj.status || "N/A"}</Text>

      <Text style={{ marginTop: 12, fontWeight: "bold", fontSize: 16 }}>Sản phẩm:</Text>

      <FlatList
        data={items}
        keyExtractor={(item, idx) => String(item.productId || idx)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Số lượng: {item.quantity}</Text>
              <Text style={styles.price}>{item.price.toLocaleString()} ₫</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.total}>
        <Text style={styles.totalText}>Tổng tiền:</Text>
        <Text style={styles.totalPrice}>
          {(Number(orderObj.totalAmount) || 0).toLocaleString()} ₫
        </Text>
      </View>
    </ScrollView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  backBtnText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  title: { fontSize: 22, fontWeight: "bold", flex: 1 },
  infoText: { marginBottom: 4 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingBottom: 8,
  },
  image: { width: 60, height: 60, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 14, color: "red", marginTop: 4 },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  totalText: { fontSize: 16, fontWeight: "bold" },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: "#FF0040" },
});
