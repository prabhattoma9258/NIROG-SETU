import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pedometer } from 'expo-sensors'; // phone sensor for real steps

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.29.201:5000/graphql';

const TEAL = '#14A394';
const INK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#BFE6E1';

const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Thin animated progress bar
function MiniBar({ pct, colors }: { pct: number; colors: string[] }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: Math.max(0, Math.min(1, pct)),
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);
  const width = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.miniTrack}>
      <Animated.View style={{ width, height: '100%', borderRadius: 4, overflow: 'hidden' }}>
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

// One checkable task row
function TaskItem({ item, done, onToggle }: { item: any; done: boolean; onToggle: () => void }) {
  const pop = useRef(new Animated.Value(done ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: done ? 1 : 0, friction: 4, tension: 160, useNativeDriver: true }).start();
  }, [done]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      style={[styles.taskItem, done && styles.taskItemDone]}
    >
      <View style={[styles.checkbox, done && styles.checkboxDone]}>
        <Animated.View style={{ opacity: pop, transform: [{ scale: pop }] }}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </Animated.View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.taskText, done && styles.taskTextDone]}>{item.task}</Text>
        {!!item.insight && (
          <View style={styles.insightRow}>
            <Ionicons name="bulb-outline" size={14} color="#D97706" style={{ marginTop: 2 }} />
            <Text style={styles.insightText}>{item.insight}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AITaskCard({ userId }: { userId: string }) {
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real steps from the phone sensor
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');

  // Which tasks are ticked (local only, not saved)
  const [doneTasks, setDoneTasks] = useState<number[]>([]);

  // 1. Get the AI data (tasks & goals) from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      const query = {
        query: `
          query GetTasks($userId: ID!) {
            getDailyAITasks(userId: $userId) {
              tasks { task insight }
              goals { water_litres step_count sleep_hours }
            }
          }
        `,
        variables: { userId },
      };

      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        });
        const result = await response.json();
        if (result.data?.getDailyAITasks) {
          setAiData(result.data.getDailyAITasks);
        }
      } catch (error) {
        console.log('Task fetch error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userId]);

  // 2. Read the real steps from the phone sensor
  useEffect(() => {
    let subscription: any;

    const subscribeToSteps = async () => {
      try {
        // Is the sensor available?
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(String(isAvailable));
        if (!isAvailable) return;

        // Steps from 12:00 AM today until now
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        let baseSteps = 0;
        try {
          const pastStepCount = await Pedometer.getStepCountAsync(start, end);
          if (pastStepCount) {
            baseSteps = pastStepCount.steps;
            setCurrentSteps(baseSteps);
          }
        } catch (e) {
          console.log('Past step count not available:', e);
        }

        // Live steps while the app is open
        subscription = Pedometer.watchStepCount((result) => {
          setCurrentSteps(baseSteps + result.steps);
        });
      } catch (e) {
        console.log('Pedometer error:', e);
      }
    };

    subscribeToSteps();

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  const toggleTask = (index: number) => {
    setDoneTasks((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  if (loading) {
    return (
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
        <ActivityIndicator size="small" color={TEAL} />
        <Text style={{ marginTop: 10, color: MUTED }}>Analyzing your health profile...</Text>
      </View>
    );
  }

  if (!aiData) return null;

  const goals = aiData.goals || {};
  const tasks: any[] = aiData.tasks || [];

  // Progress check
  const stepGoal = goals.step_count || 0;
  const stepPct = stepGoal > 0 ? currentSteps / stepGoal : 0;
  const isGoalReached = stepGoal > 0 && currentSteps >= stepGoal;

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.titleRow}>
        <View style={[styles.iconBox, { backgroundColor: '#DFF5F1' }]}>
          <Ionicons name="sparkles" size={20} color={TEAL} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Today's AI Health Plan</Text>
          <Text style={styles.mutedSmall}>Personalized for your profile</Text>
        </View>
      </View>

      {/* 3 goal tiles */}
      <View style={styles.goalsContainer}>
        {/* Water */}
        <View style={[styles.goalBox, { backgroundColor: '#F0F9FF', borderColor: '#D6EEFB' }]}>
          <View style={[styles.goalIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="water" size={18} color="#0EA5E9" />
          </View>
          <Text style={styles.goalValue}>{goals.water_litres} L</Text>
          <Text style={styles.goalLabel}>Water Target</Text>
        </View>

        {/* Steps: real steps vs goal */}
        <View
          style={[
            styles.goalBox,
            isGoalReached
              ? { backgroundColor: '#E3F7F4', borderColor: TEAL }
              : { backgroundColor: '#EEFAF8', borderColor: '#CFEDE8' },
          ]}
        >
          <View style={[styles.goalIconBox, { backgroundColor: isGoalReached ? '#FEF3C7' : '#D4F1EC' }]}>
            <Ionicons
              name={isGoalReached ? 'trophy' : 'walk'}
              size={18}
              color={isGoalReached ? '#D97706' : TEAL}
            />
          </View>
          <Text style={[styles.goalValue, { color: isGoalReached ? '#0E9488' : INK }]}>
            {fmt(currentSteps)}
          </Text>
          <Text style={styles.goalSub}>/ {fmt(stepGoal)}</Text>
          <MiniBar pct={stepPct} colors={['#7DDCCF', TEAL]} />
          <Text style={[styles.goalLabel, { marginTop: 5 }]}>
            {isGoalReached
              ? 'Goal Reached!'
              : isPedometerAvailable === 'false'
              ? 'Sensor unavailable'
              : 'Steps Today'}
          </Text>
        </View>

        {/* Sleep */}
        <View style={[styles.goalBox, { backgroundColor: '#FFF5EC', borderColor: '#FFDFC8' }]}>
          <View style={[styles.goalIconBox, { backgroundColor: '#FFE8D6' }]}>
            <Ionicons name="moon" size={18} color="#F97316" />
          </View>
          <Text style={styles.goalValue}>{goals.sleep_hours} hr</Text>
          <Text style={styles.goalLabel}>Sleep Target</Text>
        </View>
      </View>

      {/* Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>Daily Health Protocol</Text>
        {tasks.length > 0 && (
          <View style={styles.donePill}>
            <Text style={styles.donePillText}>
              {doneTasks.length} of {tasks.length} done
            </Text>
          </View>
        )}
      </View>

      {tasks.map((item: any, index: number) => (
        <TaskItem
          key={index}
          item={item}
          done={doneTasks.includes(index)}
          onToggle={() => toggleTask(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: TEAL,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontSize: 17, fontWeight: '800', color: INK },
  mutedSmall: { fontSize: 12, color: MUTED, marginTop: 1 },

  goalsContainer: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 20 },
  goalBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  goalIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  goalValue: { fontSize: 16, fontWeight: '800', color: INK },
  goalSub: { fontSize: 11, color: MUTED, marginTop: 1, marginBottom: 6 },
  goalLabel: { fontSize: 11.5, color: MUTED, marginTop: 3, textAlign: 'center' },
  miniTrack: {
    height: 6,
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#D5E8E5',
    overflow: 'hidden',
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  subTitle: { fontSize: 16, fontWeight: '800', color: INK },
  donePill: {
    backgroundColor: '#E3F7F4',
    borderColor: '#B5E3DC',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  donePillText: { fontSize: 11.5, fontWeight: '800', color: TEAL },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F4FBFA',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  taskItemDone: { backgroundColor: '#E8F7F4', borderColor: '#B5E3DC' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#9FD6CE',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkboxDone: { backgroundColor: TEAL, borderColor: TEAL },
  taskText: { fontSize: 14.5, color: INK, fontWeight: '700', lineHeight: 20 },
  taskTextDone: { textDecorationLine: 'line-through', color: '#6B7280' },
  insightRow: { flexDirection: 'row', marginTop: 5 },
  insightText: { flex: 1, marginLeft: 6, fontSize: 12.5, color: MUTED, lineHeight: 18 },
});