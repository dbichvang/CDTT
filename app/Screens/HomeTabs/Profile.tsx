import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Lỗi khi load user:', error);
      }
    };
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <Text style={styles.name}>{user?.name || 'Chưa đăng nhập'}</Text>

      <View style={styles.options}>
        <TouchableOpacity style={styles.option}><Text>👤 Personal Information</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text>⚙️ Settings</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text>🔔 Notifications</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text>💳 Payments</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text>🛠️ Support</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option}><Text>🚪 Logout</Text></TouchableOpacity>
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
