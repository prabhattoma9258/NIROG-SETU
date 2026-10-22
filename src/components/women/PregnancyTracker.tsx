import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import CalendarPicker from "./CalendarPicker";
import DoctorButtons from "./DoctorButtons";
import PregnancyLogs from "./PregnancyLogs";
import PregnancyNotes from "./PregnancyNotes";
import PregnancyCheckIn from "./PregnancyCheckIn";
import PregnancyInvestigations from "./PregnancyInvestigations";
import { fetchPregnancyData, startPregnancy, endPregnancy, PregnancyData } from "../../api/women";
import {
  DOCTOR, TRIMESTER_INFO, EXERCISE, DIET, CHECKUPS, CHECKUP_NOTE, DANGER_SIGNS,
} from "../../constants/pregnancyContent";
import { toStr, pretty } from "../../utils/dates";

const TRI = ["", "First", "Second", "Third"];

type View_ =
  | "home" | "checkin" | "exercise" | "diet" | "checkups"
  | "warning" | "doctor" | "logs" | "visit" | "tests";

const TILES: { id: View_; icon: string; label: string }[] = [
  { id: "checkin", icon: "💬", label: "How are you feeling today" },
  { id: "logs", icon: "⚖️", label: "Weight & BP" },
  { id: "visit", icon: "📝", label: "My visits & questions" },
  { id: "tests", icon: "🧪", label: "My tests" },
  { id: "exercise", icon: "🧘‍♀️", label: "Exercise" },
  { id: "diet", icon: "🥗", label: "Diet" },
  { id: "checkups", icon: "📅", label: "Checkups & scans" },
  { id: "warning", icon: "🚨", label: "Warning signs" },
  { id: "doctor", icon: "👩‍⚕️", label: "Ask the doctor" },
];

// ---------- small helpers ----------
function Sub({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <View>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.subTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ items, color = "#9d4b73" }: { items: string[]; color?: string }) {
  return (
    <>
      {items.map((t) => (
        <Text key={t} style={[s.bullet, { color }]}>• {t}</Text>
      ))}
    </>
  );
}

// ---------- MAIN ----------
export default function PregnancyTracker({
  userId,
  defaultLmp,
}: {
  userId: string;
  defaultLmp?: string | null;
}) {
  const [data, setData] = useState<PregnancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // If a positive test came from the Period tab, the last period date is pre-filled
  const [lmp, setLmp] = useState<Date>(defaultLmp ? new Date(`${defaultLmp}T00:00:00`) : new Date());
  const [calOpen, setCalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View_>("home");
  const [water, setWater] = useState(0);

  const load = async () => {
    try {
      setError(null);
      setData(await fetchPregnancyData(userId));
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const onStart = async () => {
    try {
      setSaving(true);
      setError(null);
      await startPregnancy(userId, toStr(lmp));
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () =>
    Alert.alert(
      "Stop the tracker?",
      "Your pregnancy date and all records in this tracker (weight, BP, complaints, tests) will be removed.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, stop it",
          style: "destructive",
          onPress: async () => {
            try { await endPregnancy(userId); setView("home"); await load(); }
            catch (e: any) { setError(e?.message || "Failed to stop the tracker"); }
          },
        },
      ]
    );

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#ec4899" /></View>;

  const back = () => setView("home");
  const tri = data?.trimester ?? 1;

  // ----- pregnancy not started yet -----
  if (!data) {
    return (
      <View style={s.wrap}>
        {error && <View style={s.errorCard}><Text style={s.errorText}>{error}</Text></View>}
        <View style={s.card}>
          <Text style={s.cardTitle}>🤰 Start your pregnancy tracker</Text>
          <Text style={s.hint}>LMP means the first day of your last period.</Text>
          <TouchableOpacity style={s.dateBtn} onPress={() => setCalOpen(true)}>
            <Text style={s.dateText}>📅 {pretty(toStr(lmp))}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={onStart} disabled={saving}>
            <Text style={s.saveText}>{saving ? "Please wait..." : "Start"}</Text>
          </TouchableOpacity>
        </View>
        <CalendarPicker
          visible={calOpen}
          value={lmp}
          onSelect={(d) => { setLmp(d); setCalOpen(false); }}
          onClose={() => setCalOpen(false)}
        />
        <Text style={s.disclaimer}>This information is for guidance only and is not a substitute for a doctor's advice.</Text>
      </View>
    );
  }

  // ----- separate screens -----
  let body: React.ReactNode = null;

  if (view === "checkin") {
    body = (
      <Sub title="💬 How are you feeling today?" onBack={back}>
        <PregnancyCheckIn userId={userId} week={data.week} />
      </Sub>
    );
  } else if (view === "logs") {
    body = (
      <Sub title="⚖️ Weight & BP" onBack={back}>
        <PregnancyLogs userId={userId} week={data.week} />
      </Sub>
    );
  } else if (view === "visit") {
    body = (
      <Sub title="📝 My visits & questions" onBack={back}>
        <PregnancyNotes userId={userId} week={data.week} />
      </Sub>
    );
  } else if (view === "tests") {
    body = (
      <Sub title="🧪 My tests" onBack={back}>
        <PregnancyInvestigations userId={userId} />
      </Sub>
    );
  } else if (view === "exercise") {
    body = (
      <Sub title="🧘‍♀️ Exercise" onBack={back}>
        <View style={s.card}><Text style={s.hint}>{EXERCISE.intro}</Text></View>
        {EXERCISE.doList.map((e) => (
          <View key={e.title} style={s.card}>
            <Text style={s.cardTitle}>{e.icon} {e.title}</Text>
            <Text style={s.hint}>{e.note}</Text>
          </View>
        ))}
        <View style={s.card}>
          <Text style={s.cardTitle}>❌ Avoid these</Text>
          <Bullets items={EXERCISE.avoidList} />
        </View>
        <View style={s.redCard}>
          <Text style={s.redTitle}>Stop immediately if:</Text>
          <Bullets items={EXERCISE.stopSigns} color="#b71c1c" />
          <Text style={s.redText}>And inform your doctor.</Text>
        </View>
      </Sub>
    );
  } else if (view === "diet") {
    body = (
      <Sub title="🥗 Diet" onBack={back}>
        <View style={s.card}><Text style={s.hint}>{DIET.intro}</Text></View>
        <View style={s.card}>
          <Text style={s.cardTitle}>💡 For this trimester</Text>
          <Text style={s.hint}>{DIET.trimesterTip[tri]}</Text>
        </View>
        {DIET.groups.map((g) => (
          <View key={g.title} style={s.card}>
            <Text style={s.cardTitle}>{g.icon} {g.title}</Text>
            <Text style={s.hint}>{g.items}</Text>
          </View>
        ))}
        <View style={s.card}>
          <Text style={s.cardTitle}>❌ Avoid these</Text>
          <Bullets items={DIET.avoid} />
        </View>
        <View style={[s.card, s.warnCard]}><Text style={s.warnText}>{DIET.note}</Text></View>
      </Sub>
    );
  } else if (view === "checkups") {
    body = (
      <Sub title="📅 Checkups & scans" onBack={back}>
        {CHECKUPS.map((c) => (
          <View key={c.when} style={s.card}>
            <Text style={s.cardTitle}>{c.when}</Text>
            <Text style={s.hint}>{c.what}</Text>
          </View>
        ))}
        <View style={[s.card, s.warnCard]}><Text style={s.warnText}>{CHECKUP_NOTE}</Text></View>
      </Sub>
    );
  } else if (view === "warning") {
    body = (
      <Sub title="🚨 When to see a doctor immediately" onBack={back}>
        <View style={s.redCard}>
          <Bullets items={DANGER_SIGNS} color="#b71c1c" />
          <Text style={s.redText}>If you notice any of these, don't delay.</Text>
          <DoctorButtons message={`Hello ${DOCTOR.name}, I am in week ${data.week} of my pregnancy and I need urgent advice.`} />
        </View>
      </Sub>
    );
  } else if (view === "doctor") {
    body = (
      <Sub title="👩‍⚕️ Ask the doctor" onBack={back}>
        <View style={s.card}>
          <Text style={s.cardTitle}>{DOCTOR.name}</Text>
          <Text style={s.hint}>
            Feel free to ask any question directly. Your pregnancy week will be filled in the message automatically.
          </Text>
          <DoctorButtons message={`Hello ${DOCTOR.name}, I am in week ${data.week} of my pregnancy. I have a question: `} />
        </View>
      </Sub>
    );
  }

  if (body) {
    return (
      <View style={s.wrap}>
        {body}
        <Text style={s.disclaimer}>This information is for guidance only and is not a substitute for a doctor's advice.</Text>
      </View>
    );
  }

  // ----- HOME -----
  const info = TRIMESTER_INFO[tri];
  return (
    <View style={s.wrap}>
      {error && <View style={s.errorCard}><Text style={s.errorText}>{error}</Text></View>}

      <View style={s.bigCard}>
        <Text style={s.bigLabel}>{TRI[data.trimester]} trimester</Text>
        <Text style={s.bigValue}>Week {data.week}</Text>
        <Text style={s.bigSub}>{data.day} days completed</Text>
        <View style={s.barBg}><View style={[s.barFill, { width: `${data.progress}%` }]} /></View>
        <Text style={s.bigSub}>{data.progress}% of the journey complete</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>📅 Due date</Text>
        <Text style={s.value}>{pretty(data.dueDate)}</Text>
        <Text style={s.hint}>{data.daysLeft} days left</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{info.title}</Text>
        <Text style={s.miniHead}>👶 In the baby</Text>
        <Bullets items={info.baby} />
        <Text style={s.miniHead}>🌸 In your body</Text>
        <Bullets items={info.body} />
      </View>

      <View style={s.grid}>
        {TILES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[s.tile, t.id === "warning" && s.tileRed]}
            onPress={() => setView(t.id)}
          >
            <Text style={s.tileIcon}>{t.icon}</Text>
            <Text style={[s.tileText, t.id === "warning" && { color: "#c62828" }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>💧 Today's water</Text>
        <View style={s.waterRow}>
          <TouchableOpacity style={s.waterBtn} onPress={() => setWater(Math.max(0, water - 1))}>
            <Text style={s.waterBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.waterCount}>{water} / 10 glasses</Text>
          <TouchableOpacity style={s.waterBtn} onPress={() => setWater(Math.min(10, water + 1))}>
            <Text style={s.waterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {water >= 8 && <Text style={s.hint}>Well done! 🎉</Text>}
      </View>

      <TouchableOpacity onPress={onReset}>
        <Text style={s.reset}>Stop tracker</Text>
      </TouchableOpacity>
      <Text style={s.disclaimer}>This information is for guidance only and is not a substitute for a doctor's advice.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { padding: 40, alignItems: "center" },
  wrap: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { backgroundColor: "#fff0f6", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#ec4899", marginBottom: 4 },
  value: { fontSize: 17, fontWeight: "700", color: "#333", marginVertical: 4 },
  hint: { fontSize: 13, color: "#9d4b73", lineHeight: 19 },
  bullet: { fontSize: 13, lineHeight: 20, marginTop: 3 },
  miniHead: { fontSize: 13, fontWeight: "700", color: "#333", marginTop: 10 },

  bigCard: { backgroundColor: "#ec4899", borderRadius: 24, padding: 22, marginBottom: 14, alignItems: "center" },
  bigLabel: { color: "#ffe0ee", fontSize: 14 },
  bigValue: { color: "#fff", fontSize: 34, fontWeight: "bold", marginVertical: 6 },
  bigSub: { color: "#ffe0ee", fontSize: 13, marginTop: 2 },
  barBg: { width: "100%", height: 8, borderRadius: 4, backgroundColor: "#f9a8d4", marginTop: 12, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: "#fff" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  tile: {
    width: "47.5%", backgroundColor: "#fff", borderRadius: 18, paddingVertical: 18, paddingHorizontal: 10,
    alignItems: "center", borderWidth: 1, borderColor: "#f8bbd0",
  },
  tileRed: { borderColor: "#ef9a9a", backgroundColor: "#ffebee" },
  tileIcon: { fontSize: 28, marginBottom: 6 },
  tileText: { fontSize: 13, fontWeight: "700", color: "#9d4b73", textAlign: "center" },

  waterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginVertical: 8 },
  waterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#ec4899", alignItems: "center", justifyContent: "center" },
  waterBtnText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  waterCount: { fontSize: 18, fontWeight: "700", color: "#333" },

  backBtn: { paddingVertical: 8 },
  backText: { color: "#ec4899", fontWeight: "700", fontSize: 14 },
  subTitle: { fontSize: 20, fontWeight: "800", color: "#ec4899", marginBottom: 12 },

  redCard: { backgroundColor: "#ffebee", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  redTitle: { fontSize: 16, fontWeight: "800", color: "#c62828", marginBottom: 4 },
  redText: { fontSize: 13, color: "#b71c1c", marginTop: 8, lineHeight: 19, fontWeight: "600" },
  warnCard: { backgroundColor: "#fff7e6", borderColor: "#ffd591" },
  warnText: { color: "#8a5a00", fontSize: 13, lineHeight: 19 },

  dateBtn: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: "#f8bbd0", alignItems: "center" },
  dateText: { fontSize: 16, fontWeight: "600", color: "#333" },
  saveBtn: { backgroundColor: "#ec4899", borderRadius: 14, padding: 14, marginTop: 16, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  errorCard: { backgroundColor: "#ffebee", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  errorText: { color: "#b71c1c", fontSize: 13 },
  reset: { textAlign: "center", color: "#c98aa8", fontSize: 13, marginTop: 4 },
  disclaimer: { fontSize: 12, color: "#c98aa8", textAlign: "center", marginTop: 10 },
});