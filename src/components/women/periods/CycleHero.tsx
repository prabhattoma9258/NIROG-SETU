import { View, Text, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { PeriodAnalysis, PeriodEntry } from "../../../api/women";
import { toStr, daysFromToday } from "../../../utils/dates";
import { CYCLE_HTML } from "./cycleHtml";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Web par WebView nahi chalta, isliye wahan iframe; phone par WebView hi
function HtmlView({ html, style }: { html: string; style?: any }) {
  if (Platform.OS === "web") {
    return (
      <View style={[{ overflow: "hidden" }, style]}>
        <iframe
          srcDoc={html}
          title="animation"
          scrolling="no"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "transparent",
            pointerEvents: "none",
          }}
        />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={style}
      scrollEnabled={false}
      bounces={false}
      javaScriptEnabled
      opaque={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    />
  );
}

// "2026-10-19" mein n din jodo
const addDays = (s: string, n: number) => {
  const [y, m, d] = s.split("-").map(Number);
  return toStr(new Date(y, m - 1, d + n));
};

type Props = {
  analysis: PeriodAnalysis;
  periods: PeriodEntry[]; // nayi date pehle
};

export default function CycleHero({ analysis: a, periods }: Props) {
  const last = periods[0];
  if (!last) return null;

  const cycleLen = a.avgCycle;
  const periodLen = a.avgPeriodDays || last.days || 5;
  const day = -daysFromToday(last.startDate) + 1; // cycle ka aaj kaunsa din hai
  const daysLeft = daysFromToday(a.nextPeriod); // period mein kitne din

  // Phases (andaza): ovulation = cycle ke aakhri se 14 din pehle
  const ov = cycleLen - 14;
  const phases = [
    { key: "menstrual", label: "Period", from: 1, to: periodLen, color: "#ec4899" },
    { key: "follicular", label: "Follicular", from: periodLen + 1, to: ov - 2, color: "#f9a8d4" },
    { key: "ovulation", label: "Ovulation", from: ov - 1, to: ov + 1, color: "#60a5fa" },
    { key: "luteal", label: "Luteal", from: ov + 2, to: cycleLen, color: "#14b8a6" },
  ].filter((p) => p.to >= p.from);

  const current = phases.find((p) => day >= p.from && day <= p.to);
  const late = day > cycleLen;

  const headline =
    daysLeft > 0 ? `${daysLeft} din` : daysLeft === 0 ? "Aaj" : `${-daysLeft} din late`;

  // Aaj ke aas-paas ke 7 din
  const today = toStr(new Date());
  const strip = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));

  const inPeriod = (ds: string) => {
    // jo period save hain
    for (const p of periods) {
      const end = p.endDate || addDays(p.startDate, periodLen - 1);
      if (ds >= p.startDate && ds <= end) return true;
    }
    // agla period (andaza)
    return ds >= a.nextPeriod && ds <= addDays(a.nextPeriod, periodLen - 1);
  };
  const inFertile = (ds: string) =>
    !!a.fertileStart && !!a.fertileEnd && ds >= a.fertileStart && ds <= a.fertileEnd;

  const hasHtml = CYCLE_HTML.trim().length > 20;

  return (
    <View>
      {/* 🎥 ANIMATION CARD */}
      <View style={s.heroCard}>
        {/* pointerEvents none: animation scroll ko na roke */}
        <View style={s.videoWrap} pointerEvents="none">
          {hasHtml ? (
            <HtmlView html={CYCLE_HTML} style={s.web} />
          ) : (
            <View style={s.fallback}>
              <Text style={{ fontSize: 80 }}>💧</Text>
            </View>
          )}
        </View>

        <View style={s.overlay}>
          <View style={{ flex: 1 }}>
            <Text style={s.ovLabel}>Period expected in</Text>
            <Text style={s.ovValue}>{headline}</Text>
          </View>
          <View style={s.ovRight}>
            <Text style={s.ovLabel}>Cycle day</Text>
            <Text style={s.ovValue}>{late ? `${day}` : `${day} / ${cycleLen}`}</Text>
          </View>
        </View>

        {/* Phase bar */}
        <View style={s.barWrap}>
          <View style={s.bar}>
            {phases.map((p) => (
              <View key={p.key} style={{ flex: p.to - p.from + 1, backgroundColor: p.color }} />
            ))}
          </View>
          {!late && (
            <View style={[s.marker, { left: `${Math.min(98, ((day - 0.5) / cycleLen) * 100)}%` }]} />
          )}
          <View style={s.labels}>
            {phases.map((p) => (
              <Text key={p.key} style={[s.phaseLabel, { flex: p.to - p.from + 1 }]} numberOfLines={1}>
                {p.label}
              </Text>
            ))}
          </View>
        </View>

        <Text style={s.phaseNow}>
          {late
            ? "Period abhi tak shuru nahi hua. Agar der ho toh doctor se poochhein."
            : current
            ? `Aaj: ${current.label} phase (andaza)`
            : ""}
        </Text>
      </View>

      {/* 📅 CALENDAR STRIP */}
      <View style={s.calCard}>
        <Text style={s.calTitle}>Cycle Calendar</Text>
        <View style={s.strip}>
          {strip.map((ds) => {
            const isToday = ds === today;
            const dayName = DAYS[new Date(ds + "T00:00:00").getDay()];
            const dayNum = parseInt(ds.split("-")[2]);
            return (
              <View key={ds} style={[s.dayBox, isToday && s.dayToday]}>
                <Text style={[s.dayName, isToday && s.dayTextOn]}>{dayName}</Text>
                <Text style={[s.dayNum, isToday && s.dayTextOn]}>{dayNum}</Text>
                <View style={s.dotRow}>
                  {inPeriod(ds) && <View style={[s.dot, { backgroundColor: isToday ? "#fff" : "#ec4899" }]} />}
                  {inFertile(ds) && <View style={[s.dot, { backgroundColor: isToday ? "#fff" : "#14b8a6" }]} />}
                </View>
              </View>
            );
          })}
        </View>
        <View style={s.legend}>
          <View style={[s.dot, { backgroundColor: "#ec4899" }]} /><Text style={s.legendText}>Period</Text>
          <View style={[s.dot, { backgroundColor: "#14b8a6", marginLeft: 14 }]} /><Text style={s.legendText}>Fertile days (andaza)</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  heroCard: { backgroundColor: "#fff", borderRadius: 24, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  videoWrap: { height: 210, borderRadius: 18, overflow: "hidden", backgroundColor: "#fff0f6" },
  web: { flex: 1, backgroundColor: "transparent" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },

  overlay: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 14,
    marginTop: -34, marginHorizontal: 8, elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  ovRight: { alignItems: "flex-end" },
  ovLabel: { fontSize: 12, color: "#9d4b73" },
  ovValue: { fontSize: 22, fontWeight: "800", color: "#ec4899", marginTop: 2 },

  barWrap: { marginTop: 18, marginHorizontal: 4 },
  bar: { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 },
  marker: { position: "absolute", top: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff", borderWidth: 3, borderColor: "#333" },
  labels: { flexDirection: "row", marginTop: 8 },
  phaseLabel: { fontSize: 10, color: "#9d4b73", fontWeight: "600" },
  phaseNow: { fontSize: 13, color: "#555", marginTop: 10, textAlign: "center" },

  calCard: { backgroundColor: "#fff", borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  calTitle: { fontSize: 16, fontWeight: "800", color: "#333", marginBottom: 12 },
  strip: { flexDirection: "row", justifyContent: "space-between" },
  dayBox: { width: 44, paddingVertical: 8, borderRadius: 14, alignItems: "center", backgroundColor: "#fff0f6" },
  dayToday: { backgroundColor: "#ec4899" },
  dayName: { fontSize: 11, color: "#9d4b73", fontWeight: "600" },
  dayNum: { fontSize: 17, fontWeight: "800", color: "#333", marginTop: 2 },
  dayTextOn: { color: "#fff" },
  dotRow: { flexDirection: "row", gap: 3, height: 8, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  legendText: { fontSize: 11, color: "#9d4b73", marginLeft: 5 },
});