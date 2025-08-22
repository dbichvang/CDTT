import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  MyOrdersScreen: undefined;
  OrderScreen: { orderObj: any };
};

type MyOrdersScreenNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "MyOrdersScreen"
>;

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<MyOrdersScreenNavProp>();

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem("orders");
      const parsed = storedOrders ? JSON.parse(storedOrders) : [];
      setOrders(parsed);
    } catch (err) {
      console.error("Load local orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadOrders);
    loadOrders();
    return unsubscribe;
  }, [navigation]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      {/* Nút Quay lại + Tiêu đề */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📦 Đơn hàng của tôi</Text>
      </View>

      {orders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Không có đơn hàng nào</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.orderId || item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => navigation.navigate("OrderScreen", { orderObj: item })}
            >
              <Text>Mã đơn: #{item.orderId || item.id}</Text>
              <Text>Trạng thái: {item.orderStatus || item.status}</Text>
              <Text>Tổng tiền: {(item.totalAmount || 0).toLocaleString()} đ</Text>
              <Text>Ngày: {item.orderDate || item.createdAt || "N/A"}</Text>
              <Text style={{ color: "#1a73e8", marginTop: 4 }}>Xem chi tiết →</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default MyOrdersScreen;

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
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", flex: 1 },
  orderCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
});
