import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SignupScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.heading}>Sign Up</Text>

        <TextInput placeholder="Email" style={styles.input} />
        <TextInput placeholder="Username" style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} />

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <Text style={styles.signupText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  form: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    color: '#FF0040',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FF0040',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: '#FF0040',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontSize: 18,
  },
});
