import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  VNPayScreen: { paymentUrl: string };
  OrderSuccess: undefined;
  OrderFail: undefined;
};

type VNPayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "VNPayScreen"
>;

const VNPayScreen = () => {
  const navigation = useNavigation<VNPayScreenNavigationProp>();
  const route = useRoute<any>();
  const { paymentUrl } = route.params;

  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    if (!url) return;

    // ✅ Kiểm tra URL callback trả về từ VNPay
    if (url.includes("vnp_ResponseCode=00")) {
      // Thành công
      Alert.alert("Thanh toán thành công", "Cảm ơn bạn đã mua hàng!", [
        {
          text: "OK",
          onPress: () => navigation.replace("OrderSuccess"),
        },
      ]);
    } else if (url.includes("vnp_ResponseCode")) {
      // Thất bại
      Alert.alert("Thanh toán thất bại", "Vui lòng thử lại.", [
        {
          text: "OK",
          onPress: () => navigation.replace("OrderFail"),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải VNPay...</Text>
        </View>
      )}

      <WebView
        source={{ uri: paymentUrl }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
      />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Hủy thanh toán</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VNPayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  cancelButton: {
    padding: 15,
    backgroundColor: "#f44336",
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
