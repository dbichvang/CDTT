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
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getProductById } from './APIService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const DetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId = route.params?.productId || route.params?.product?.productId;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId) {
      Alert.alert('Lỗi', 'Không có ID sản phẩm');
      navigation.goBack();
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm:', error);
        Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getImageUrl = (imgName: string) =>
    imgName
      ? `http://localhost:8080/api/public/products/image/${imgName}`
      : 'https://via.placeholder.com/170x170';

  const increaseQty = () => {
    setQuantity((q) => q + 1);
  };

  const decreaseQty = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const handleSaveToCart = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      const existingIndex = cart.findIndex((item: any) => item.id === product.id);
      if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          ...product,
          quantity,
          image:
            typeof product.image === 'string'
              ? product.image
              : product.image?.uri || '',
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  const handleBuyNow = () => {
    Alert.alert('Thanh toán', `Bạn đã mua ${quantity} sản phẩm ${product.productName || product.name}`);
    // TODO: chuyển sang màn thanh toán
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.title}>{product.productName || product.name || 'Không có tên'}</Text>
        <Text style={styles.price}>
          {product.price ? `${product.price.toLocaleString()} ₫` : ''}
        </Text>

        <Image
          source={{ uri: getImageUrl(product.image) }}
          style={styles.mainImage}
          resizeMode="contain"
        />

        <View style={styles.qtyContainer}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Số lượng:</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity onPress={decreaseQty} style={styles.qtyButton}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={increaseQty} style={styles.qtyButton}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.description}>
          <Text style={styles.descText}>
            <Text style={styles.bold}>Mô tả: </Text>
            {product.description || 'Không có mô tả'}
          </Text>
        </View>
      </ScrollView>

      {/* Nút Thêm vào giỏ hàng và Mua ngay nằm dưới cùng màn hình */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSaveToCart}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 30,
  },
  title: {
    marginTop: 70,
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  price: {
    fontSize: 20,
    color: '#888',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  mainImage: {
    width: width * 0.8,
    height: width * 0.8,
    alignSelf: 'center',
    borderRadius: 20,
    marginVertical: 20,
  },
  qtyContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  qtyButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  description: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  descText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#ddd',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyBtn: {
    backgroundColor: '#f00',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
