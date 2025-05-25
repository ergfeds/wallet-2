import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<number | null>(null);
  const { login, signup } = useAuthStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleVersionTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Reset tap count after 3 seconds of inactivity
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 3000) as unknown as number;

    // Navigate to admin login after 5 taps
    if (newTapCount >= 5) {
      setTapCount(0);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      router.push('/admin/login');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Skip email validation for admin
    if (email !== 'admin' && !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
    }

    setIsLoading(true);
    try {
      let success;
      if (isSignUp) {
        success = await signup(email.trim(), password, firstName.trim(), lastName.trim());
        if (!success) {
          Alert.alert('Error', 'An account with this email already exists');
        }
      } else {
        success = await login(email.trim(), password);
        if (!success) {
          Alert.alert('Error', 'Invalid email or password');
        }
      }
      
      if (success) {
        // Check if admin login
        if (email.trim() === 'admin' && password === 'Legacybt') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: isSignUp ? 'Sign Up' : 'Login', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Agile Wallet</Text>
            <Text style={styles.subtitle}>Secure cryptocurrency transactions</Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  autoCapitalize="words"
                />

                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                  autoCapitalize="words"
                />
              </>
            )}

            <Input
              label={email === 'admin' ? 'Username' : 'Email'}
              value={email}
              onChangeText={setEmail}
              placeholder={email === 'admin' ? 'Enter username' : 'Enter your email'}
              keyboardType={email === 'admin' ? 'default' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            <Button
              title={isLoading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            />

            <TouchableOpacity 
              style={styles.switchMode}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
              }}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? 'Create your account to get started with cryptocurrency trading' : 'Welcome back to your secure wallet'}
            </Text>
            
            <TouchableOpacity 
              style={styles.versionContainer}
              onPress={handleVersionTap}
              activeOpacity={0.7}
            >
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  form: {
    marginBottom: 40,
  },
  submitButton: {
    marginTop: 20,
  },
  switchMode: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  versionContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  versionText: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
  },
});