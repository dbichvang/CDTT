import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CheckPaymentScreen() {
  const navigation = useNavigation<any>();
  const [status, setStatus] = useState<"success" | "fail">("fail");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Lấy query param từ URL (dành cho web)
    const urlParams = new URLSearchParams(window.location.search);
    const txnStatus = urlParams.get("vnp_TransactionStatus");

    if (txnStatus === "00") {
      setStatus("success");
      setMessage("Thanh toán thành công 🎉");

      // Xóa giỏ hàng
      AsyncStorage.removeItem("cart");
    } else {
      setStatus("fail");
      setMessage("Thanh toán thất bại ❌");
    }
  }, []);

  // Reset navigation về Home
  const goHome = () => {
    if (Platform.OS === "web") {
      // web fallback
      window.location.href = "/";
    } else {
      // mobile reset stack về Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  };

  // Thanh toán lại
  const goCart = () => {
    if (Platform.OS === "web") {
      window.location.href = "/cart";
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Cart" }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          { color: status === "success" ? "green" : "red", fontSize: 20 },
        ]}
      >
        {message}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#0a84ff", marginTop: 15 }]}
        onPress={goHome}
      >
        <Text style={styles.buttonText}>🏠 Quay về Trang Chủ</Text>
      </TouchableOpacity>

      {status !== "success" && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red", marginTop: 15 }]}
          onPress={goCart}
        >
          <Text style={styles.buttonText}>Thanh toán lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 20, textAlign: "center", marginBottom: 20 },
  button: { padding: 12, borderRadius: 8, alignItems: "center", width: "80%" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
