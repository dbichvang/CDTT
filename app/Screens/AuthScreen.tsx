import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';

const AuthScreen = ({ navigation }: any) => {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Tabs */}
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

        {/* Heading */}
        <Text style={styles.heading}>
          {isSignUp ? "Let's get started!" : 'Welcome back!'}
        </Text>

        {/* Form Fields */}
        <View style={styles.form}>
          <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
          {isSignUp && <TextInput placeholder="Username" style={styles.input} />}
          <TextInput placeholder="Password" style={styles.input} secureTextEntry />

          {/* Forgot password (only Sign In) */}
          {!isSignUp && (
            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          {/* Main button */}
          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => {
              if (isSignUp) {
                alert('Account created (demo)');
              } else {
                navigation.navigate('Home');
              }
            }}
          >
            <Text style={styles.mainBtnText}>
              {isSignUp ? 'Create an account' : 'Log in'}
            </Text>
          </TouchableOpacity>

          {/* OR separator (only for Sign In) */}
          {!isSignUp && (
            <>
              <Text style={styles.orText}>or</Text>

              {/* Social login icons */}
              {/* <View style={styles.socialRow}>
                <TouchableOpacity>
                  <Image
                    source={require('../assets/images/google.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require('../assets/images/fingerprint.png')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View> */}
            </>
          )}

          {/* Switch between Sign Up & Sign In */}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  tab: {
    marginHorizontal: 20,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 18,
    color: '#999',
  },
  activeTab: {
    borderBottomColor: '#FF0040',
  },
  activeTabText: {
    color: '#FF0040',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  forgot: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  forgotText: {
    color: '#FF0040',
  },
  mainBtn: {
    backgroundColor: '#FF0040',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  mainBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 10,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    resizeMode: 'contain',
  },
  switchText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
  },
});
