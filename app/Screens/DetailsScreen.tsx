// DetailScreen.tsx - Chỉnh sửa để ảnh hiển thị đúng và lưu đúng định dạng
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert, Dimensions, Image, ScrollView, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';

const { width } = Dimensions.get('window');

const DetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params as any;
  const [tab, setTab] = useState('Photos');

  const handleSaveToCart = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      const alreadyExists = cart.find((item: any) => item.id === product.id);
      if (alreadyExists) {
        Alert.alert('Thông báo', 'Sản phẩm đã có trong giỏ hàng.');
        return;
      }

      const newItem = {
        ...product,
        quantity: 1,
        image: typeof product.image === 'string' ? product.image : product.image.uri || '',
      };

      cart.push(newItem);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm.');
    }
  };

  const renderTabContent = () => {
    switch (tab) {
      case 'Photos':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[product.image].map((img, idx) => (
              <Image key={idx} source={{ uri: typeof img === 'string' ? img : img.uri }} style={styles.photoItem} resizeMode="contain" />
            ))}
          </ScrollView>
        );
      case 'Colours':
        return (
          <View style={styles.colorsRow}>
            <Text>🟨 Gold</Text>
            <Text>🟩 Green</Text>
            <Text>⬛ Space Gray</Text>
          </View>
        );
      case 'Description':
        return (
          <View style={styles.description}>
            <Text style={styles.descText}><Text style={styles.bold}>Brand:</Text> Apple</Text>
            <Text style={styles.descText}><Text style={styles.bold}>Model:</Text> iPhone 11</Text>
            <Text style={styles.descText}><Text style={styles.bold}>OS:</Text> iOS</Text>
          </View>
        );
      case 'Comments':
        return (
          <ScrollView>
            <Text><Text style={styles.bold}>@user1:</Text> Rất tốt</Text>
            <Text><Text style={styles.bold}>@user2:</Text> Hài lòng</Text>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{product.price}</Text>

      <Image source={{ uri: typeof product.image === 'string' ? product.image : product.image.uri }} style={styles.mainImage} resizeMode="contain" />

      <View style={styles.tabs}>
        {['Photos', 'Colours', 'Description', 'Comments'].map((item) => (
          <TouchableOpacity key={item} onPress={() => setTab(item)}>
            <Text style={[styles.tabText, tab === item && styles.activeTab]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>{renderTabContent()}</View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveToCart}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={() => Alert.alert('Buy Now')}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { marginTop: 60, fontSize: 24, fontWeight: 'bold' },
  price: { fontSize: 20, color: '#888', marginVertical: 10 },
  mainImage: { width: width * 0.8, height: width * 0.8, alignSelf: 'center', borderRadius: 20 },
  tabs: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 20, borderBottomWidth: 1, borderColor: '#ccc',
  },
  tabText: { fontSize: 16, paddingVertical: 6 },
  activeTab: { fontWeight: 'bold', color: '#f00' },
  tabContent: { marginTop: 10, flex: 1 },
  photoItem: { width: width * 0.4, height: width * 0.4, marginRight: 10, borderRadius: 10 },
  colorsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  description: { marginTop: 20 },
  descText: { fontSize: 16, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  saveButton: {
    backgroundColor: '#ddd', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, flex: 1, alignItems: 'center',
  },
  saveButtonText: { fontSize: 14, fontWeight: 'bold' },
  buyBtn: {
    backgroundColor: '#f00', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, flex: 2, alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
