import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setTokens } from '../api/client';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.29.201:5000/graphql';

// 👉 Apni doctor wali photo yahan rakho: assets/images/doctor.png
// (path apne project ke hisaab se adjust kar lena)
const DOCTOR_IMAGE = require('../../assets/images/doctor.png');

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width * 0.82;

const TEAL = '#14A394';
const TEAL_DARK = '#0E9488';
const TEAL_LIGHT = '#1BBBA8';
const ORANGE = '#FFA46B';      // peach/orange glow
const TEAL_GLOW = '#4FD1BF';   // teal-green glow

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email aur Password dono daaliye!');
      return;
    }

    setLoading(true);

    // GraphQL Login Query (token aur role bhi maang rahe hain)
    const query = {
      query: `
        query LoginUser($email: String!, $password: String!) {
          loginUser(email: $email, password: $password) {
            id
            name
            token
            refreshToken
            role
          }
        }
      `,
      variables: { email, password },
    };

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });

      const result = await response.json();

      if (result.errors) {
        Alert.alert('Login Failed', result.errors[0].message);
      } else if (result.data && result.data.loginUser) {
        const user = result.data.loginUser;

        // Doctor ya admin ko app mein nahi aane dena (unke liye web panel hai)
        if (user.role && user.role !== 'user') {
          Alert.alert('Ye account app ke liye nahi hai', 'Doctor/Admin kripya web panel mein login karein.');
          return;
        }

        // Token aur user ID phone mein safe rakho
        await setTokens(user.token, user.refreshToken, user.id);

        Alert.alert('Success', 'Welcome back! 🎉');
        navigation.replace('MainTabs', { userId: user.id });
      }
    } catch (error) {
      Alert.alert('Network Error', 'Backend se connect nahi hua.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFD2B8', '#BDEDE5', '#FFFFFF']}
      locations={[0, 0.38, 0.7]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Doctor photo */}
            <View style={styles.glowOuter}>
              {/* Soft glow layers: orange/peach (top-left) -> teal (bottom-right) */}
              <LinearGradient
                colors={[ORANGE, TEAL_GLOW]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.halo, { width: PHOTO_SIZE + 76, height: PHOTO_SIZE + 76, borderRadius: (PHOTO_SIZE + 76) / 2, opacity: 0.18 }]}
              />
              <LinearGradient
                colors={[ORANGE, TEAL_GLOW]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.halo, { width: PHOTO_SIZE + 48, height: PHOTO_SIZE + 48, borderRadius: (PHOTO_SIZE + 48) / 2, opacity: 0.32 }]}
              />
              <LinearGradient
                colors={[ORANGE, TEAL_GLOW]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.halo, { width: PHOTO_SIZE + 22, height: PHOTO_SIZE + 22, borderRadius: (PHOTO_SIZE + 22) / 2, opacity: 0.6 }]}
              />
              <View style={styles.photoWrap}>
                <Image source={DOCTOR_IMAGE} style={styles.photo} resizeMode="cover" />
              </View>
            </View>

            {/* Heading */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login with your email and password</Text>

            {/* Email */}
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
              style={styles.buttonShadow}
            >
              <LinearGradient
                colors={[TEAL_DARK, TEAL_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Or divider */}
            <Text style={styles.or}>Or</Text>

            {/* Signup button (Truecaller wale button ki jagah) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <View style={styles.secondaryIcon}>
                <Ionicons name="person-add" size={14} color="#fff" />
              </View>
              <Text style={styles.secondaryText}>Create New Account</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footer}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.footerLink}>Terms of service</Text>,{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text> and{' '}
              <Text style={styles.footerLink}>Content Policy</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  glowOuter: {
    width: PHOTO_SIZE + 76,
    height: PHOTO_SIZE + 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginBottom: 0,
  },
  halo: { position: 'absolute' },
  photoWrap: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  photo: { width: '100%', height: '100%' },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  inputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#BFE6E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },

  buttonShadow: {
    width: '100%',
    marginTop: 6,
    borderRadius: 12,
    elevation: 4,
    shadowColor: TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  or: { fontSize: 12, color: '#6B7280', marginVertical: 10 },

  secondaryButton: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F9FF',
    borderWidth: 1.5,
    borderColor: '#BFDDF7',
    borderRadius: 12,
  },
  secondaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1D93D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  secondaryText: { fontSize: 15, fontWeight: '700', color: '#111827' },

  footer: {
    marginTop: 26,
    fontSize: 10.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: { color: TEAL, textDecorationLine: 'underline' },
});