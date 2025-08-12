import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user-email');
        setEmail(storedEmail);
      } catch (error) {
        console.error('Lỗi khi load email:', error);
      }
    };
    loadUserEmail();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt-token');
      await AsyncStorage.removeItem('user-email');
      Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công');
      navigation.replace('Auth'); // Chuyển về màn hình đăng nhập
    } catch (error) {
      console.error('Lỗi khi logout:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {email?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <Text style={styles.name}>{email || 'Chưa đăng nhập'}</Text>

      <View style={styles.options}>
        <TouchableOpacity style={styles.option}>
          <Text>👤 Personal Information</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text>🔔 Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text>💳 Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text>🛠️ Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f00', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', marginVertical: 20 },
  options: { width: '100%' },
  option: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
});
