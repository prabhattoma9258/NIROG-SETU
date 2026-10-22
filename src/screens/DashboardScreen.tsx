import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AITaskCard from '../components/AITaskCard';
import ConsentModal from '../components/women/ConsentModal';
import WomenSection from '../components/women/WomenSection';
import { fetchWomenAccess, sendWomenConsent, WomenAccess } from '../api/women';
import { getStoredUserId, clearTokens } from '../api/client';
import { FadeSlideIn, PressableScale } from '../components/AnimatedUI';

// Keep the same URL you already set
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.29.201:5000/graphql';

const CALORIE_GOAL = 2000;

const TEAL = '#14A394';
const INK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#BFE6E1';
const BG = '#F5F8FA';
const GREEN = '#16A34A';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const BLUE = '#38BDF8';

// 🌸 Women mode colors
const PINK = '#EC4899';
const PINK_BORDER = '#F9C6DD';

// Same peach -> teal -> white background as the Login screen
const GRADIENT: any = {
  colors: ['#FFD2B8', '#BDEDE5', '#FFFFFF'],
  locations: [0, 0.38, 0.7],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// 🌸 Pink background for Women mode
const GRADIENT_WOMEN: any = {
  colors: ['#FFD6E8', '#FDE4F0', '#FFFFFF'],
  locations: [0, 0.38, 0.7],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ---------- helpers ----------
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function riskInfo(score: number) {
  if (score <= 20) {
    return {
      label: 'Low Risk',
      color: GREEN,
      soft: '#E8F8EF',
      badge: 'PRIME ZONE',
      message: "You're fit and safe. Keep up the great work!",
      chip: 'All systems optimal',
      subtitle: 'Your health is in prime condition today',
    };
  }
  if (score <= 50) {
    return {
      label: 'Moderate Risk',
      color: AMBER,
      soft: '#FEF3C7',
      badge: 'WATCH ZONE',
      message: 'A little attention is needed. Small daily habits will help.',
      chip: 'Some areas need attention',
      subtitle: 'A little attention is needed today',
    };
  }
  return {
    label: 'High Risk',
    color: RED,
    soft: '#FEE2E2',
    badge: 'ALERT ZONE',
    message: 'High risk. Please see a doctor for a check-up.',
    chip: 'High risk, please see a doctor',
    subtitle: 'Please consider a health check-up',
  };
}

function bmiInfo(bmi: number) {
  if (isNaN(bmi)) return { label: '--', color: MUTED };
  if (bmi < 18.5) return { label: 'Underweight', color: BLUE };
  if (bmi < 25) return { label: 'Normal', color: GREEN };
  if (bmi < 30) return { label: 'Overweight', color: AMBER };
  return { label: 'Obese', color: RED };
}

// ---------- small components ----------
function RiskRing({ score, color }: { score: number; color: string }) {
  const size = 84;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;

  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const offset = v.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          {...({ strokeDashoffset: offset } as any)}
        />
      </Svg>
      <Text style={styles.ringValue}>{score}</Text>
      <Text style={styles.ringMax}>/100</Text>
    </View>
  );
}

function AnimatedBar({ pct, colors }: { pct: number; colors: string[] }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: Math.max(0, Math.min(1, pct)),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);
  const width = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.barTrack}>
      <Animated.View style={{ width, height: '100%', borderRadius: 6, overflow: 'hidden' }}>
        <LinearGradient
          colors={colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const BMI_SEGMENTS = [
  { flex: 3.5, color: '#38BDF8', label: '' },
  { flex: 6.4, color: '#22C55E', label: '18.5' },
  { flex: 5.1, color: '#FBBF24', label: '24.9' },
  { flex: 5, color: '#F87171', label: '30+' },
];

function BmiScale({ bmi, color }: { bmi: number; color: string }) {
  const pos = isNaN(bmi) ? 0 : Math.max(2, Math.min(98, ((bmi - 15) / 20) * 100));
  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ height: 16, justifyContent: 'center' }}>
        <View style={styles.bmiBar}>
          {BMI_SEGMENTS.map((s, i) => (
            <View key={i} style={{ flex: s.flex, backgroundColor: s.color }} />
          ))}
        </View>
        {!isNaN(bmi) && (
          <View style={[styles.bmiMarker, { left: `${pos}%`, borderColor: color }]} />
        )}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {BMI_SEGMENTS.map((s, i) => (
          <View key={i} style={{ flex: s.flex }}>
            <Text style={styles.bmiTick}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------- screen ----------
export default function DashboardScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();

  // ID from login first, else the one saved on the phone. Never anyone else's ID.
  const [userId, setUserId] = useState<string | null>(route.params?.userId || null);

  const [userData, setUserData] = useState<any>(null);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🌸 WOMEN SECTION STATES
  const [mode, setMode] = useState<'health' | 'women'>('health');
  const [access, setAccess] = useState<WomenAccess | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);

  // No userId? Take it from phone storage, and if that's empty too, go to Login
  useEffect(() => {
    if (userId) return;
    getStoredUserId().then((id) => {
      if (id) setUserId(id);
      else navigation.replace('Login');
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    // Refresh the data every time the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRealData(userId);
    });
    fetchRealData(userId);
    return unsubscribe;
  }, [navigation, userId]);

  // 🌸 Check women access from the backend (male users never see the switch)
  useEffect(() => {
    if (!userId) return;
    fetchWomenAccess(userId)
      .then((a) => {
        setAccess(a);
        setAccessError(null);
      })
      .catch((e: any) => {
        console.log('womenAccess error:', e?.message);
        setAccess(null);
        setAccessError(e?.message || 'Something went wrong');
      });
  }, [userId]);

  const handleModeChange = (m: 'health' | 'women') => {
    if (m === 'women' && access && !access.consentGiven) {
      setShowConsent(true); // first time: ask for permission
      return;
    }
    setMode(m);
  };

  const handleAcceptConsent = async () => {
    try {
      setSavingConsent(true);
      await sendWomenConsent(userId as string);
      setAccess(access ? { ...access, consentGiven: true } : null);
      setShowConsent(false);
      setMode('women');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save permission');
    } finally {
      setSavingConsent(false);
    }
  };

  const fetchRealData = async (id: string) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const query = {
      query: `
        query GetDashboardData($id: ID!, $date: String!) {
          getUser(id: $id) {
            id
            name
            bmi
            status
            riskScore
          }
          getDailyMeals(userId: $id, date: $date) {
            calories
          }
        }
      `,
      variables: { id, date: today },
    };

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      const result = await response.json();

      if (result.data?.getUser) {
        setUserData(result.data.getUser);
      }

      if (result.data?.getDailyMeals) {
        const total = result.data.getDailyMeals.reduce(
          (sum: number, meal: any) => sum + (meal.calories || 0),
          0
        );
        setConsumedCalories(total);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await clearTokens(); // remove the token and ID from the phone
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (!userId || (loading && !userData)) {
    return (
      <LinearGradient {...GRADIENT} style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={TEAL} />
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient {...GRADIENT} style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="cloud-offline-outline" size={44} color={MUTED} />
        <Text style={styles.errorText}>We couldn't load your data.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => userId && fetchRealData(userId)}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const isWomen = mode === 'women';

  // 🌸 Theme colors switch with the mode
  const accent = isWomen ? PINK : TEAL;
  const borderCol = isWomen ? PINK_BORDER : BORDER;
  const bgGradient = isWomen ? GRADIENT_WOMEN : GRADIENT;

  const riskScore = Number(userData.riskScore) || 0;
  const risk = riskInfo(riskScore);
  const bmiNum = parseFloat(userData.bmi);
  const bmiCat = bmiInfo(bmiNum);

  const caloriePct = consumedCalories / CALORIE_GOAL;
  const remaining = CALORIE_GOAL - consumedCalories;
  const overGoal = remaining < 0;


  return (
    <LinearGradient {...bgGradient} style={styles.container}>
      {/* 📌 FIXED HEADER: stays on top in both Health and Women modes */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { borderColor: borderCol }]}>
            <Ionicons name="person" size={20} color={accent} />
          </View>

          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              Hello, {userData.name}! 👋
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {isWomen ? 'Your women’s health space' : risk.subtitle}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: borderCol }]}
            onPress={handleLogout}
            hitSlop={8}
          >
            <Ionicons name="log-out-outline" size={20} color={INK} />
          </TouchableOpacity>
        </View>

        {/* Tabs: only if the user has women access */}
        {access?.allowed && (
          <View style={[styles.tabs, { borderColor: borderCol }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                mode === 'health' && [styles.tabActive, { backgroundColor: accent, shadowColor: accent }],
              ]}
              onPress={() => handleModeChange('health')}
            >
              <Text style={[styles.tabText, mode === 'health' && styles.tabTextActive]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                mode === 'women' && [styles.tabActive, { backgroundColor: accent, shadowColor: accent }],
              ]}
              onPress={() => handleModeChange('women')}
            >
              <Text style={[styles.tabText, mode === 'women' && styles.tabTextActive]}>Women</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
      {/* Status chip (Health mode only) */}
      {!isWomen && (
        <View style={{ paddingHorizontal: 20 }}>
          <FadeSlideIn delay={0} style={{ alignSelf: 'flex-start' }}>
            <View style={[styles.chip, { backgroundColor: risk.soft, borderColor: risk.color + '55' }]}>
              <View style={[styles.chipDot, { backgroundColor: risk.color }]} />
              <Text style={[styles.chipText, { color: risk.color }]}>
                Preventive Shield Active • {risk.chip}
              </Text>
            </View>
          </FadeSlideIn>

          {/* If the women access check failed, the reason shows here */}
          {accessError && !access && (
            <Text style={styles.accessError}>Women section check failed: {accessError}</Text>
          )}
        </View>
      )}

      {isWomen ? (
        // 🌸 WOMEN SECTION: hero card + tabs
        <WomenSection
          userId={userId}
          userName={userData.name}
          mode={mode}
          onModeChange={handleModeChange}
        />
      ) : (
        <>
          {/* 🛡️ BIOMETRIC STATUS: health risk score + BMI */}
          <FadeSlideIn delay={160} style={styles.cardWrap}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: risk.soft }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={risk.color} />
                </View>
                <Text style={styles.cardTitle}>Biometric Status</Text>
                <View style={[styles.pill, { backgroundColor: risk.soft, borderColor: risk.color + '55' }]}>
                  <Text style={[styles.pillText, { color: risk.color }]}>{risk.badge}</Text>
                </View>
              </View>

              {/* Risk score */}
              <View style={styles.innerBox}>
                <RiskRing score={riskScore} color={risk.color} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.smallMuted}>Health Risk Score</Text>
                  <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
                  <Text style={styles.smallMuted2}>Based on your health profile</Text>
                </View>
              </View>

              {/* BMI */}
              <View style={[styles.innerBox, { flexDirection: 'column', alignItems: 'stretch', marginTop: 12 }]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.smallMuted}>BMI Index</Text>
                  <View style={[styles.pill, { backgroundColor: bmiCat.color + '1A', borderColor: bmiCat.color + '55' }]}>
                    <Text style={[styles.pillText, { color: bmiCat.color }]}>
                      {userData.status || bmiCat.label}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 }}>
                  <Text style={styles.bmiValue}>{isNaN(bmiNum) ? '--' : userData.bmi}</Text>
                  <Text style={styles.bmiUnit}>kg/m²</Text>
                </View>
                <BmiScale bmi={bmiNum} color={bmiCat.color} />
              </View>

              {/* Insight */}
              <View style={styles.insightRow}>
                <Ionicons name="sparkles-outline" size={16} color={TEAL} />
                <Text style={styles.insightText}>{risk.message}</Text>
              </View>
            </View>
          </FadeSlideIn>

          {/* 🔥 CALORIE TRACKER (tap to scan food) */}
          <FadeSlideIn delay={230} style={styles.cardWrap}>
            <PressableScale
              scaleTo={0.98}
              style={styles.card}
              onPress={() => navigation.navigate('Calories', { userId })}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF1E6' }]}>
                  <Ionicons name="flame" size={20} color="#F97316" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Calorie Tracker</Text>
                  <Text style={styles.smallMuted}>Today's intake • tap to scan food</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.remainingValue, { color: overGoal ? RED : '#EA580C' }]}>
                    {fmt(Math.abs(remaining))} kcal
                  </Text>
                  <Text style={styles.smallMuted}>{overGoal ? 'Over goal' : 'Remaining'}</Text>
                </View>
              </View>

              <View style={[styles.rowBetween, { alignItems: 'flex-end', marginTop: 18 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.calValue}>{fmt(consumedCalories)}</Text>
                  <Text style={styles.calGoal}>/ {fmt(CALORIE_GOAL)} kcal</Text>
                </View>
                <Text style={[styles.goalPct, { color: overGoal ? RED : GREEN }]}>
                  {Math.round(caloriePct * 100)}% of Goal
                </Text>
              </View>

              <AnimatedBar
                pct={caloriePct}
                colors={overGoal ? ['#F59E0B', '#EF4444'] : ['#FBBF24', '#16A34A']}
              />
            </PressableScale>
          </FadeSlideIn>

          {/* ✅ AI TASKS */}
          <FadeSlideIn delay={300}>
            <AITaskCard userId={userData.id} />
          </FadeSlideIn>

          {/* 🎛️ QUICK ACTIONS */}
          <FadeSlideIn delay={360}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <View style={{ flex: 1 }}>
                <PressableScale
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Diet', 'Diet plan coming soon!')}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#DFF5F1', marginRight: 0 }]}>
                    <Ionicons name="nutrition-outline" size={22} color={TEAL} />
                  </View>
                  <Text style={styles.actionText}>Diet Plan</Text>
                </PressableScale>
              </View>

              <View style={{ width: 12 }} />

              <View style={{ flex: 1 }}>
                <PressableScale
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Exercise', 'Workout plan coming soon!')}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#FFEBDD', marginRight: 0 }]}>
                    <Ionicons name="walk-outline" size={22} color="#F97316" />
                  </View>
                  <Text style={styles.actionText}>Exercise</Text>
                </PressableScale>
              </View>
            </View>
          </FadeSlideIn>
        </>
      )}

      {/* 🌸 PERMISSION POPUP */}
      <ConsentModal
        visible={showConsent}
        loading={savingConsent}
        onAccept={handleAcceptConsent}
        onCancel={() => setShowConsent(false)}
      />
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // header
  fixedHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontSize: 20, fontWeight: '800', color: INK },
  subtitle: { fontSize: 12.5, color: MUTED, marginTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  tabActive: {
    backgroundColor: TEAL,
    elevation: 3,
    shadowColor: TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: { fontSize: 13, fontWeight: '600', color: MUTED },
  tabTextActive: { color: '#fff' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  chipDot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
  accessError: { fontSize: 11, color: '#B45309', marginTop: 10 },

  // cards
  cardWrap: { marginHorizontal: 20, marginTop: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    shadowColor: TEAL,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: INK },
  pill: { borderWidth: 1, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallMuted: { fontSize: 12, color: MUTED },
  smallMuted2: { fontSize: 11.5, color: '#9CA3AF', marginTop: 2 },

  innerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    backgroundColor: '#FCFDFD',
  },
  ringValue: { fontSize: 24, fontWeight: '800', color: INK, marginTop: -4 },
  ringMax: { fontSize: 10, color: MUTED, marginTop: -2 },
  riskLabel: { fontSize: 20, fontWeight: '800', marginTop: 2 },

  bmiValue: { fontSize: 36, fontWeight: '800', color: INK },
  bmiUnit: { fontSize: 13, color: MUTED, marginLeft: 6, marginBottom: 7 },
  bmiBar: { height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  bmiMarker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    backgroundColor: '#fff',
    borderWidth: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  bmiTick: { fontSize: 11, color: MUTED, fontWeight: '600' },

  insightRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingHorizontal: 2 },
  insightText: { flex: 1, marginLeft: 8, fontSize: 12.5, color: '#374151', lineHeight: 18 },

  // calories
  remainingValue: { fontSize: 16, fontWeight: '800' },
  calValue: { fontSize: 32, fontWeight: '800', color: INK },
  calGoal: { fontSize: 13, color: MUTED, marginLeft: 6, marginBottom: 6 },
  goalPct: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  barTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#EEF2F5',
    overflow: 'hidden',
    marginTop: 10,
  },

  // quick actions
  sectionTitle: { fontSize: 18, fontWeight: '800', marginHorizontal: 20, marginTop: 22, marginBottom: 12, color: INK },
  actionGrid: { flexDirection: 'row', paddingHorizontal: 20 },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 18,
    alignItems: 'center',
  },
  actionText: { fontSize: 14.5, fontWeight: '800', color: INK, marginTop: 10 },

  // error state
  errorText: { fontSize: 15, color: MUTED, marginTop: 12 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});