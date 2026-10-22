import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setTokens } from '../api/client';
import { FadeSlideIn, PressableScale } from '../components/AnimatedUI';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.29.201:5000/graphql';

const TEAL = '#14A394';
const TEAL_DARK = '#0E9488';
const TEAL_LIGHT = '#1BBBA8';
const FEMALE_PINK = '#e84393';
const MALE_BLUE = '#208AEF';

const GENDERS = [
  { value: 'Male', label: 'Male', icon: 'man', color: MALE_BLUE, softBg: '#EAF3FF', avatarBg: '#E3EEFC' },
  { value: 'Female', label: 'Female', icon: 'woman', color: FEMALE_PINK, softBg: '#FFE4EE', avatarBg: '#FFD3E3' },
];

// Gender card with a pop animation + check badge zoom
function GenderCard({ g, selected, onPress }: any) {
  const pop = useRef(new Animated.Value(1)).current;
  const badge = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    if (selected) {
      pop.setValue(0.9);
      Animated.spring(pop, { toValue: 1, friction: 3.5, tension: 140, useNativeDriver: true }).start();
      Animated.spring(badge, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
    } else {
      Animated.timing(badge, { toValue: 0, duration: 120, useNativeDriver: true }).start();
    }
  }, [selected]);

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: pop }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.genderCard,
          selected && { backgroundColor: g.softBg, borderColor: g.color },
        ]}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.checkBadge,
            { backgroundColor: g.color, opacity: badge, transform: [{ scale: badge }] },
          ]}
        >
          <Ionicons name="checkmark" size={12} color="#fff" />
        </Animated.View>

        <View style={[styles.avatar, { backgroundColor: g.avatarBg }]}>
          <Ionicons name={g.icon as any} size={30} color={g.color} />
        </View>

        <Text style={[styles.genderLabel, selected && { color: g.color }]}>{g.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}


export default function HealthProfileScreen({ route, navigation }: any) {
  const accountData = route.params?.accountData || {};

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Hide the top navigation header, same as the Signup screen
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const commonDiseases = [
    'Diabetes Type 1', 'Diabetes Type 2', 'High Blood Pressure (BP)',
    'Low Blood Pressure', 'Asthma', 'Thyroid (Hypo/Hyper)',
    'Heart Disease', 'Obesity (Motapa)', 'Arthritis (Jodo ka dard)',
    'Kidney Stone / Disease', 'Liver Issues (Fatty Liver)',
    'Migraine', 'High Cholesterol', 'Anxiety / Depression',
  ];

  const femaleDiseases = [
    'PCOS / PCOD', 'Endometriosis', 'Irregular Periods',
    'Pregnancy Related Context', 'Breast Cancer Risk',
    'Ovarian Cyst', 'Menopause Symptoms',
  ];

  const displayDiseases = gender === 'Female'
    ? [...commonDiseases, ...femaleDiseases]
    : commonDiseases;

  const toggleDisease = (disease: string) => {
    if (selectedDiseases.includes(disease)) {
      setSelectedDiseases(selectedDiseases.filter(d => d !== disease));
    } else {
      setSelectedDiseases([...selectedDiseases, disease]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!age || !weight || !height || !gender) {
      Alert.alert('Error', 'Age, Weight, Height and Gender are required.');
      return;
    }

    setLoading(true);

    const finalInput = {
      ...accountData,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      gender: gender,
      diseases: selectedDiseases,
    };

    const registerQuery = {
      query: `
        mutation RegisterUser($input: RegisterInput!) {
          registerUser(input: $input) {
            id
            name
          }
        }
      `,
      variables: { input: finalInput },
    };

    try {
      // 1) Create the account
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerQuery),
      });

      const result = await response.json();

      if (result.errors) {
        Alert.alert('Failed', result.errors[0].message);
        return;
      }

      const realUserId = result.data.registerUser.id;

      // 2) Log in right away with the same email/password to get the tokens
      const loginQuery = {
        query: `
          query LoginUser($email: String!, $password: String!) {
            loginUser(email: $email, password: $password) {
              id
              token
              refreshToken
            }
          }
        `,
        variables: { email: accountData.email, password: accountData.password },
      };

      const loginRes = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginQuery),
      });
      const loginResult = await loginRes.json();

      if (loginResult.errors || !loginResult.data?.loginUser?.token) {
        // Account was created, only the auto-login failed. Send the user to the login screen.
        Alert.alert('Account created! 🎉', 'Please log in now.');
        navigation.replace('Login');
        return;
      }

      const u = loginResult.data.loginUser;
      await setTokens(u.token, u.refreshToken);

      Alert.alert('Success! 🎉', 'Your account has been created!');
      navigation.replace('MainTabs', { userId: realUserId });
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server.');
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
          {/* Back button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backBtn}
              hitSlop={10}
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Signup'))}
            >
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Heading */}
            <FadeSlideIn delay={100} style={{ width: '100%' }}>
            <Text style={styles.title}>Medical Profile</Text>
            <Text style={styles.subtitle}>Step 2: Tell us a little about your health</Text>
            </FadeSlideIn>

            {/* Age */}
            <FadeSlideIn delay={180} style={{ width: '100%' }}>
            <View style={styles.inputBox}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            </FadeSlideIn>

            {/* Weight + Height */}
            <FadeSlideIn delay={260} style={{ width: '100%' }}>
            <View style={styles.inputRow}>
              <View style={[styles.inputBox, styles.halfBox, { marginRight: 7 }]}>
                <Ionicons name="barbell-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Weight (kg)"
                  placeholderTextColor="#9CA3AF"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputBox, styles.halfBox, { marginLeft: 7 }]}>
                <Ionicons name="resize-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Height (cm)"
                  placeholderTextColor="#9CA3AF"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
            </FadeSlideIn>

            {/* Gender */}
            <FadeSlideIn delay={340} style={{ width: '100%' }}>
            <Text style={styles.label}>What is your gender?</Text>
            <View style={styles.row}>
              {GENDERS.map((g) => (
                <GenderCard
                  key={g.value}
                  g={g}
                  selected={gender === g.value}
                  onPress={() => {
                    setGender(g.value);
                    if (g.value === 'Male') setSelectedDiseases([]);
                  }}
                />
              ))}
            </View>
            </FadeSlideIn>

            {/* Medical conditions */}
            {gender ? (
              <FadeSlideIn style={{ marginTop: 18 }}>
                <Text style={styles.label}>Any medical conditions? (Select all that apply)</Text>
                <View style={styles.diseaseContainer}>
                  {displayDiseases.map((disease) => {
                    const isSelected = selectedDiseases.includes(disease);
                    const isFemaleSpecific = femaleDiseases.includes(disease);

                    return (
                      <TouchableOpacity
                        key={disease}
                        activeOpacity={0.85}
                        style={[
                          styles.diseaseBadge,
                          isSelected ? styles.selectedBadge : null,
                          isFemaleSpecific && !isSelected ? styles.femaleBadgeOutline : null,
                        ]}
                        onPress={() => toggleDisease(disease)}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isSelected ? { color: '#fff' } : null,
                            isFemaleSpecific && !isSelected ? { color: FEMALE_PINK } : null,
                          ]}
                        >
                          {disease}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </FadeSlideIn>
            ) : null}

            
          </ScrollView>

          <View style={styles.footer}>
            {/* Submit button */}
            <FadeSlideIn delay={500} style={{ width: '100%' }}>
            <PressableScale
              activeOpacity={0.85}
              onPress={handleFinalSubmit}
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
                  <>
                    <Text style={styles.buttonText}>Complete Setup</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </PressableScale>
            </FadeSlideIn>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },

  inputBox: {
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
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827' },
  inputRow: { flexDirection: 'row' },
  halfBox: { flex: 1 },

  label: { fontSize: 15, fontWeight: '700', marginBottom: 10, color: '#111827' },
  row: { flexDirection: 'row', marginBottom: 6 },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 6,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  genderLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },

  diseaseContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 20 },
  diseaseBadge: {
    borderWidth: 1.5,
    borderColor: '#BFE6E1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
    backgroundColor: '#fff',
  },
  selectedBadge: { backgroundColor: TEAL, borderColor: TEAL },
  femaleBadgeOutline: { borderColor: FEMALE_PINK, backgroundColor: '#fff0f6' },
  badgeText: { fontSize: 13.5, color: '#333', fontWeight: '500' },

  buttonShadow: {
    marginTop: 0,
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
  topBar: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 2 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#BFE6E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
});