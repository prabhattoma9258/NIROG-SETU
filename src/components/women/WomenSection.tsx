import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from "react-native";
import WomenHero from "./WomenHero";
import PeriodTracker from "./PeriodTracker";
import PregnancyTracker from "./PregnancyTracker";
import { fetchPeriodData, fetchPregnancyData } from "../../api/women";
import { daysFromToday } from "../../utils/dates";

type TabId = "period" | "pregnancy" | "pcos" | "perimenopause" | "teenage";

const TABS: { id: TabId; label: string; icon: string; desc: string }[] = [
  { id: "period", label: "Periods & Cycle", icon: "🩸", desc: "Your cycle, next period and fertile days" },
  { id: "pregnancy", label: "Pregnancy", icon: "🤰", desc: "Week-by-week guide and important tips" },
  { id: "pcos", label: "PCOS", icon: "🌿", desc: "Understand and manage PCOS" },
  { id: "perimenopause", label: "Perimenopause", icon: "🌸", desc: "Changes in the years before menopause" },
  { id: "teenage", label: "Teenage", icon: "🌼", desc: "Health information for growing girls" },
];

const dayWord = (n: number) => (n === 1 ? "day" : "days");

type Props = {
  userId: string;
  userName: string;
  mode: "health" | "women";
  onModeChange: (m: "health" | "women") => void;
};

export default function WomenSection({ userId, userName }: Props) {
  const [active, setActive] = useState<TabId>("period");
  // When a period test is positive, the date of the last period arrives here
  const [lmpHint, setLmpHint] = useState<string | null>(null);
  const slide = useRef(new Animated.Value(0)).current;

  // Small summary for the hero chip and the tab badges
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  const [daysToPeriod, setDaysToPeriod] = useState<number | null>(null);
  const [week, setWeek] = useState<number | null>(null);

  // Content slides in when the tab changes
  useEffect(() => {
    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [active]);

  // Refresh the summary whenever the tab changes (so new logs show up)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, pr] = await Promise.allSettled([fetchPeriodData(userId), fetchPregnancyData(userId)]);
      if (cancelled) return;

      if (p.status === "fulfilled" && p.value.periods.length > 0 && p.value.analysis) {
        setCycleDay(-daysFromToday(p.value.periods[0].startDate) + 1);
        setDaysToPeriod(daysFromToday(p.value.analysis.nextPeriod));
      } else {
        setCycleDay(null);
        setDaysToPeriod(null);
      }
      setWeek(pr.status === "fulfilled" && pr.value ? pr.value.week : null);
    })();
    return () => { cancelled = true; };
  }, [userId, active]);

  const current = TABS.find((t) => t.id === active)!;

  const chip =
    week !== null
      ? `Week ${week} of pregnancy`
      : daysToPeriod === null
      ? "Start tracking today"
      : daysToPeriod > 0
      ? `Next period in ${daysToPeriod} ${dayWord(daysToPeriod)}`
      : daysToPeriod === 0
      ? "Period expected today"
      : `Period ${-daysToPeriod} ${dayWord(-daysToPeriod)} late`;

  const badgeFor = (id: TabId): string | null => {
    if (id === "period" && cycleDay !== null && cycleDay > 0) return `Day ${cycleDay}`;
    if (id === "pregnancy" && week !== null) return `Wk ${week}`;
    return null;
  };

  return (
    <View>
      {/* 🌸 HERO CARD */}
      <View style={s.heroWrap}>
        <WomenHero name={userName} chip={chip} />
      </View>

      {/* 🌸 TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {TABS.map((t) => {
          const on = t.id === active;
          const badge = badgeFor(t.id);
          return (
            <TouchableOpacity key={t.id} style={[s.pill, on && s.pillOn]} onPress={() => setActive(t.id)}>
              <Text style={s.pillIcon}>{t.icon}</Text>
              <Text style={[s.pillText, on && s.pillTextOn]}>{t.label}</Text>
              {badge ? (
                <View style={[s.badge, on && s.badgeOn]}>
                  <Text style={[s.badgeText, on && s.badgeTextOn]}>{badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 🌸 TAB CONTENT */}
      <Animated.View
        style={{
          opacity: slide,
          transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}
      >
        {active === "period" ? (
          <PeriodTracker
            userId={userId}
            onStartPregnancy={(lmp) => {
              setLmpHint(lmp);
              setActive("pregnancy");
            }}
          />
        ) : active === "pregnancy" ? (
          <PregnancyTracker userId={userId} defaultLmp={lmpHint} />
        ) : (
          <View style={s.content}>
            <Text style={s.heroIcon}>{current.icon}</Text>
            <Text style={s.title}>{current.label}</Text>
            <Text style={s.desc}>{current.desc}</Text>
            <Text style={s.soon}>Coming soon...</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  // paddingTop reduced: the ModeSwitch no longer lives inside the hero area
  heroWrap: { paddingTop: 8, paddingHorizontal: 16 },

  tabRow: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#f8bbd0",
  },
  pillOn: { backgroundColor: "#ec4899", borderColor: "#ec4899", elevation: 3 },
  pillIcon: { fontSize: 15 },
  pillText: { fontWeight: "700", color: "#7a1f4f", fontSize: 14 },
  pillTextOn: { color: "#fff" },
  badge: { backgroundColor: "#fde7f1", paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 },
  badgeOn: { backgroundColor: "rgba(255,255,255,0.28)" },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#ec4899" },
  badgeTextOn: { color: "#fff" },

  content: {
    backgroundColor: "#fff0f6", marginHorizontal: 20, marginBottom: 30,
    padding: 28, borderRadius: 24, alignItems: "center",
    borderWidth: 1, borderColor: "#f8bbd0",
  },
  heroIcon: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "bold", color: "#ec4899", marginBottom: 6 },
  desc: { fontSize: 14, color: "#9d4b73", textAlign: "center", lineHeight: 20 },
  soon: { marginTop: 14, fontSize: 12, color: "#c98aa8" },
});