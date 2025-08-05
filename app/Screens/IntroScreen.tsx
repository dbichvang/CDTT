import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';

const { height, width } = Dimensions.get('window');

const IntroScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Image source={require('../assets/images/image3.png')} style={styles.imageLeft} />
        <Image source={require('../assets/images/Rectangle15.png')} style={styles.imageCenter} />
        <Image source={require('../assets/images/image4.png')} style={styles.imageRight} />
      </View>

      <View style={styles.bottomSection}>
        <Image
          source={require('../assets/images/Rectangle14.png')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        <View style={styles.overlay}>
          <Text style={styles.heading}>
            A Blend of all your{'\n'}favourite electronics!
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  imageLeft: {
    width: width * 0.35,
    height: height * 0.35,
    resizeMode: 'contain',
  },
  imageCenter: {
    width: width * 0.4,
    height: height * 0.4,
    resizeMode: 'contain',
  },
  imageRight: {
    width: width * 0.35,
    height: height * 0.35,
    resizeMode: 'contain',
  },
  bottomSection: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  loginButton: {
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 20,
    width: 200,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 200,
    paddingVertical: 10,
    alignItems: 'center',
  },
  signupText: {
    color: '#FF0040',
    fontSize: 16,
  },
});
