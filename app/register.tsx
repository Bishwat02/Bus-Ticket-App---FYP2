// app/register.tsx
// Register Screen
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../src/services/firebaseConfig';

// export default function RegisterScreen() {
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async () => {
    const newErrors = {
      email: email ? '' : 'Email is required',
      password: password ? '' : 'Password is required',
      confirmPassword: confirmPassword ? '' : 'Confirm password is required',
    };

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(error => error !== '');
    if (hasError) return;

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('Success', 'Account created successfully.');
      router.replace('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message);
    }
  };

  const getInputContainerStyle = (field: string, hasError: boolean) => {
    return [
      styles.inputContainer,
      focusedField === field && styles.focusedInput,
      hasError && styles.errorInput,
    ];
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/images/logoMaraliner.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Register</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === 'email' && styles.focusedInput,
          errors.email ? styles.errorInput : null,
        ]}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={() => setFocusedField('email')}
        onBlur={() => setFocusedField('')}
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <View style={getInputContainerStyle('password', !!errors.password)}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField('')}
        />
        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      <Text style={styles.label}>Confirm Password</Text>
      <View style={getInputContainerStyle('confirmPassword', !!errors.confirmPassword)}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          onFocus={() => setFocusedField('confirmPassword')}
          onBlur={() => setFocusedField('')}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword ? (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  focusedInput: {
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
