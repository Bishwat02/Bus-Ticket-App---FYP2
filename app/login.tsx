// app/login.tsx
// Login Screen

import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { auth } from '../src/services/firebaseConfig';

// export default function LoginScreen() {
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('Success', 'Login successful!');
      router.replace('/'); // navigate to home screen after login
    } catch (error: any) {
      console.log('Login Error:', error);
      Alert.alert('Login Failed', error.message || 'Unknown error');
    }
  };

  // const handleForgotPassword = async () => {
  //   if (!email.trim()) {
  //     Alert.alert('Input Needed', 'Please enter your email to reset password.');
  //     return;
  //   }

  //   try {
  //     await sendPasswordResetEmail(auth, email.trim());
  //     Alert.alert('Email Sent', 'Check your inbox to reset your password.');
  //   } catch (error: any) {
  //     console.error('Forgot Password Error:', error);
  //     Alert.alert('Error', error.message || 'Failed to send reset email.');
  //   }
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Image
        source={require('../assets/images/logoMaraliner.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.replace('/register')}
      >
        <Text style={styles.linkText}>
          Don't have an account?{' '}
          <Text style={styles.linkHighlight}>Register</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
  },
  linkHighlight: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});
