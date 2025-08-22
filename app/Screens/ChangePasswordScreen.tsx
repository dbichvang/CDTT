import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { CHANGE_PASSWORD } from '../Screens/APIService';

const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setErrorMsg('');
    if (!oldPassword.trim() || !newPassword.trim()) {
      setErrorMsg("Mật khẩu không được để trống");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await CHANGE_PASSWORD(oldPassword, newPassword);
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Đổi mật khẩu</Text>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TextInput
          placeholder="Mật khẩu cũ"
          secureTextEntry
          style={styles.input}
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <TextInput
          placeholder="Mật khẩu mới"
          secureTextEntry
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleChangePassword} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Đang gửi...' : 'Đổi mật khẩu'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  heading: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  btn: { backgroundColor: '#FF0040', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center' },
});
