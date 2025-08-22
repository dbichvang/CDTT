import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { loginUser, registerUser } from './APIService';

const AuthScreen = ({ navigation }: any) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
  };

  const handleAuth = async () => {
    let tempErrors: { [key: string]: string } = {};
    if (!email.trim()) tempErrors.email = 'Email không được để trống';
    if (!password.trim()) tempErrors.password = 'Password không được để trống';
    if (isSignUp && !name.trim()) tempErrors.name = 'Tên không được để trống';
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      if (isSignUp) {
        const success = await registerUser(name.trim(), email.trim(), password);
        if (success) {
          setIsSignUp(false);
          setName('');
          setErrors({});
        }
      } else {
        const success = await loginUser(email.trim(), password);
        if (success) {
          resetFields();
          navigation.replace("Home"); 
        } else {
          setErrors({ email: 'Email hoặc mật khẩu không đúng' });
        }
      }
    } catch (err: any) {
      console.log("Auth error:", err.message || err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setIsSignUp(true)}
            style={[styles.tab, isSignUp && styles.activeTab]}>
            <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsSignUp(false)}
            style={[styles.tab, !isSignUp && styles.activeTab]}>
            <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <>
              <TextInput
                placeholder="Name"
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </>
          )}
          <TextInput
            placeholder="Email"
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
            value={password}
            onChangeText={setPassword}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity style={styles.mainBtn} onPress={handleAuth}>
            <Text style={styles.mainBtnText}>{isSignUp ? 'Create Account' : 'Log in'}</Text>
          </TouchableOpacity>

          {/* Nút Forgot Password chỉ hiển thị khi Sign In */}
          {!isSignUp && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
              style={styles.forgotBtn}>
              <Text style={styles.forgotBtnText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  tab: { marginHorizontal: 20, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 18, color: '#999' },
  activeTab: { borderBottomColor: '#FF0040' },
  activeTabText: { color: '#FF0040', fontWeight: 'bold' },
  form: { width: '100%' },
  input: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 5 },
  inputError: { borderColor: 'red', borderWidth: 1 },
  errorText: { color: 'red', marginBottom: 10, fontSize: 12 },
  mainBtn: { backgroundColor: '#FF0040', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 20 },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  forgotBtn: { alignSelf: 'center', marginTop: 10 },
  forgotBtnText: { color: '#FF0040', fontSize: 14, textDecorationLine: 'underline' },
});
