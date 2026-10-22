import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FadeSlideIn, PressableScale, ZoomIn, Breathe } from '../components/AnimatedUI';

// 👉 Same doctor photo as the LoginScreen
const DOCTOR_IMAGE = require('../../assets/images/doctor.png');

const { width } = Dimensions.get('window');
// Signup has 3 fields, so the photo is a bit smaller than on login
const PHOTO_SIZE = width * 0.6;
const GLOW_H = PHOTO_SIZE + 60;

const TEAL = '#14A394';
const TEAL_DARK = '#0E9488';
const TEAL_LIGHT = '#1BBBA8';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hide the top navigation header (the "Create Account" bar)
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNext = () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Details', 'Name, Email and Password are all required.');
      return;
    }

    // Pass only the account details to the next step
    const accountData = { name, email, password };
    navigation.navigate('HealthProfile', { accountData });
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
            {/* Doctor photo with smooth glow */}
            <View style={styles.glowWrap}>
              <Breathe>
              <Svg width={width} height={GLOW_H} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                  <RadialGradient id="orangeGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FF9A5C" stopOpacity="0.65" />
                    <Stop offset="55%" stopColor="#FFB98A" stopOpacity="0.28" />
                    <Stop offset="100%" stopColor="#FFB98A" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#2CC9B5" stopOpacity="0.6" />
                    <Stop offset="55%" stopColor="#6FDCCB" stopOpacity="0.26" />
                    <Stop offset="100%" stopColor="#6FDCCB" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={width * 0.28} cy={GLOW_H * 0.4} r={PHOTO_SIZE * 0.75} fill="url(#orangeGlow)" />
                <Circle cx={width * 0.74} cy={GLOW_H * 0.62} r={PHOTO_SIZE * 0.75} fill="url(#tealGlow)" />
              </Svg>
              </Breathe>
              <ZoomIn>
              <View style={styles.photoWrap}>
                <Image source={DOCTOR_IMAGE} style={styles.photo} resizeMode="cover" />
              </View>
              </ZoomIn>
            </View>

            {/* Heading */}
            <FadeSlideIn delay={120} style={{ width: '100%' }}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Step 1: Fill in your basic details</Text>
            </FadeSlideIn>

            {/* Name */}
            <FadeSlideIn delay={190} style={{ width: '100%' }}>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
            </FadeSlideIn>

            {/* Email */}
            <FadeSlideIn delay={260} style={{ width: '100%' }}>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            </FadeSlideIn>

            {/* Password */}
            <FadeSlideIn delay={330} style={{ width: '100%' }}>
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
            </FadeSlideIn>

            {/* Next button */}
            <FadeSlideIn delay={400} style={{ width: '100%' }}>
            <PressableScale activeOpacity={0.85} onPress={handleNext} style={styles.buttonShadow}>
              <LinearGradient
                colors={[TEAL_DARK, TEAL_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Next Step</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </PressableScale>
            </FadeSlideIn>

            {/* Or divider */}
            <FadeSlideIn delay={470} style={{ width: '100%' }}>
            <Text style={styles.or}>Or</Text>

            {/* Link to the Login screen */}
            <PressableScale
              activeOpacity={0.85}
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <View style={styles.secondaryIcon}>
                <Ionicons name="log-in" size={14} color="#fff" />
              </View>
              <Text style={styles.secondaryText}>Already have an account? Login</Text>
            </PressableScale>
            </FadeSlideIn>

            {/* Footer */}
            <FadeSlideIn delay={540} style={{ width: '100%' }}>
            <Text style={styles.footer}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.footerLink}>Terms of service</Text>,{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text> and{' '}
              <Text style={styles.footerLink}>Content Policy</Text>
            </Text>
            </FadeSlideIn>

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

  glowWrap: {
    width: width,
    height: GLOW_H,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -20,
    marginTop: -6,
    marginBottom: 6,
  },
  photoWrap: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 5,
    borderColor: '#FFFFFF',
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
    flexDirection: 'row',
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
  secondaryText: { fontSize: 14, fontWeight: '700', color: '#111827' },

  footer: {
    marginTop: 24,
    fontSize: 10.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: { color: TEAL, textDecorationLine: 'underline' },
});