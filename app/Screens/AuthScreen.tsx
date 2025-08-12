import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';


import { registerUser, loginUser, RegisterUserData } from './APIService';

const AuthScreen = ({ navigation }: any) => {
  const [isSignUp, setIsSignUp] = useState(true);

  // Các trường nhập liệu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Thêm các trường cho đăng ký:
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [street, setStreet] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim() || (isSignUp && (!firstName.trim() || !lastName.trim() || !mobileNumber.trim()))) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      if (isSignUp) {
        const userData: RegisterUserData = {
          userId: 0,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobileNumber: mobileNumber.trim(),
          email: email.trim(),
          password,
          roles: [{ roleId: 0, roleName: 'USER' }], // role mặc định
          address: {
            addressId: 0,
            street: street.trim(),
            buildingName: buildingName.trim(),
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            pincode: pincode.trim(),
          }
        };

        const success = await registerUser(userData);
        if (success) {
          Alert.alert('Thành công', 'Đăng ký thành công, mời đăng nhập');
          setIsSignUp(false);

          // Reset tất cả trường
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');
          setMobileNumber('');
          setStreet('');
          setBuildingName('');
          setCity('');
          setState('');
          setCountry('');
          setPincode('');
        } else {
          Alert.alert('Lỗi', 'Đăng ký thất bại, vui lòng thử lại');
        }
      } else {
        const success = await loginUser(email, password);
        if (success) {
          Alert.alert('Thành công', 'Đăng nhập thành công');
          setEmail('');
          setPassword('');
          navigation.replace('Home');
        } else {
          Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      console.error('Auth error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setIsSignUp(true)}
            style={[styles.tab, isSignUp && styles.activeTab]}
          >
            <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(false)}
            style={[styles.tab, !isSignUp && styles.activeTab]}
          >
            <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heading}>
          {isSignUp ? "Let's get started!" : 'Welcome back!'}
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {isSignUp && (
            <>
              <TextInput
                placeholder="First Name"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                placeholder="Last Name"
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
              <TextInput
                placeholder="Mobile Number"
                style={styles.input}
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
              <TextInput
                placeholder="Street"
                style={styles.input}
                value={street}
                onChangeText={setStreet}
              />
              <TextInput
                placeholder="Building Name"
                style={styles.input}
                value={buildingName}
                onChangeText={setBuildingName}
              />
              <TextInput
                placeholder="City"
                style={styles.input}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                placeholder="State"
                style={styles.input}
                value={state}
                onChangeText={setState}
              />
              <TextInput
                placeholder="Country"
                style={styles.input}
                value={country}
                onChangeText={setCountry}
              />
              <TextInput
                placeholder="Pincode"
                style={styles.input}
                keyboardType="numeric"
                value={pincode}
                onChangeText={setPincode}
              />
            </>
          )}
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!isSignUp && (
            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.mainBtn} onPress={handleAuth}>
            <Text style={styles.mainBtnText}>
              {isSignUp ? 'Create an account' : 'Log in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp
                ? 'Already have an account? Log in'
                : `Don't have an account? Sign up`}
            </Text>
          </TouchableOpacity>
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
  heading: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 30, color: '#333' },
  form: { width: '100%' },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  forgot: { alignItems: 'flex-end', marginBottom: 15 },
  forgotText: { color: '#FF0040' },
  mainBtn: { backgroundColor: '#FF0040', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchText: { color: '#888', textAlign: 'center', fontSize: 14 },
});
