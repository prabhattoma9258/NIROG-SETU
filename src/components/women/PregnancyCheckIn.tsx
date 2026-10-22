import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import DoctorButtons from "./DoctorButtons";
import { fetchPregnancyComplaints, savePregnancyComplaints, PregnancyComplaintDay } from "../../api/women";
import {
  DOCTOR, COMPLAINTS, INFORM_DOCTOR_KEYS, OTHER_SYMPTOMS, DANGER_SIGNS,
} from "../../constants/pregnancyContent";
import { toStr, pretty } from "../../utils/dates";

const labelOf = (k: string) => COMPLAINTS.find((c) => c.key === k)?.label ?? k;

export default function PregnancyCheckIn({ userId, week }: { userId: string; week: number }) {
  const today = toStr(new Date());

  const [history, setHistory] = useState<PregnancyComplaintDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picked, setPicked] = useState<string[]>([]); // complaint keys
  const [others, setOthers] = useState<string[]>([]); // common symptoms + serious symptoms
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      const list = await fetchPregnancyComplaints(userId);
      setHistory(list);
      const t = list.find((d) => d.date === today);
      if (t) {
        setPicked(t.complaints);
        setOthers(t.others);
        setNote(t.note || "");
      }
    } catch (e: any) {
      setError(e?.message || "Could not load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) => {
    setSuccess(null);
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await savePregnancyComplaints(userId, today, picked, others, note.trim() || null);
      setSuccess("Today's record saved ✅");
      await load();
    } catch (e: any) {
      setError(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#ec4899" /></View>;

  const danger = others.filter((o) => DANGER_SIGNS.includes(o));
  const inform = picked.filter((k) => INFORM_DOCTOR_KEYS.includes(k));
  const all = [...picked.map(labelOf), ...others];
  const msg = `Hello ${DOCTOR.name}, I am in week ${week} of my pregnancy. I am having these problems: ${all.join(", ")}.`;

  const Chip = ({ label, on, red, onPress }: { label: string; on: boolean; red?: boolean; onPress: () => void }) => (
    <TouchableOpacity style={[s.chip, red && s.chipRed, on && (red ? s.chipRedOn : s.chipOn)]} onPress={onPress}>
      <Text style={[s.chipText, on && { color: "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {error && <View style={s.errorCard}><Text style={s.errorText}>{error}</Text></View>}
      {success && <View style={s.successCard}><Text style={s.successText}>{success}</Text></View>}

      <View style={s.card}>
        <Text style={s.cardTitle}>What is troubling you today?</Text>
        <Text style={s.hint}>Select whatever you are experiencing. Leave it empty if nothing is wrong.</Text>
        <View style={s.chipWrap}>
          {COMPLAINTS.map((c) => (
            <Chip key={c.key} label={c.label} on={picked.includes(c.key)} onPress={() => toggle(picked, setPicked, c.key)} />
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Anything else?</Text>
        <View style={s.chipWrap}>
          {OTHER_SYMPTOMS.map((o) => (
            <Chip key={o} label={o} on={others.includes(o)} onPress={() => toggle(others, setOthers, o)} />
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={[s.cardTitle, { color: "#c62828" }]}>These symptoms can be serious</Text>
        <View style={s.chipWrap}>
          {DANGER_SIGNS.map((d) => (
            <Chip key={d} label={d} red on={others.includes(d)} onPress={() => toggle(others, setOthers, d)} />
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Anything else to add (optional)</Text>
        <TextInput style={s.input} value={note} onChangeText={setNote} placeholder="Anything you want to tell the doctor" multiline />
      </View>

      {danger.length > 0 ? (
        <View style={s.redCard}>
          <Text style={s.redTitle}>⚠️ Do not delay</Text>
          <Text style={s.redText}>These symptoms can be serious. Call your doctor now or go to the nearest hospital.</Text>
          <DoctorButtons message={msg} />
        </View>
      ) : inform.length > 0 ? (
        <View style={s.warnCard}>
          <Text style={s.warnTitle}>Please tell your doctor</Text>
          <Text style={s.warnText}>Your doctor should know about this symptom. If the pain is severe or the bleeding is heavy, do not delay.</Text>
          <DoctorButtons message={msg} />
        </View>
      ) : all.length > 0 ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>This is common</Text>
          <Text style={s.hint}>This is common during pregnancy. Rest and drink plenty of water. If it gets worse or bothers you a lot, tell your doctor.</Text>
          <DoctorButtons message={msg} />
        </View>
      ) : null}

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
        <Text style={s.saveText}>{saving ? "Please wait..." : "Save today's record"}</Text>
      </TouchableOpacity>

      <View style={[s.card, { marginTop: 14 }]}>
        <Text style={s.cardTitle}>📜 Previous records</Text>
        {history.filter((h) => h.date !== today).length === 0 ? (
          <Text style={s.hint}>No previous records yet.</Text>
        ) : (
          history.filter((h) => h.date !== today).slice(0, 7).map((h) => (
            <View key={h.date} style={s.histRow}>
              <Text style={s.histDate}>{pretty(h.date)}</Text>
              <Text style={s.hint}>{[...h.complaints.map(labelOf), ...h.others].join(", ") || "Note only"}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { padding: 40, alignItems: "center" },
  card: { backgroundColor: "#fff0f6", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#ec4899", marginBottom: 4 },
  hint: { fontSize: 13, color: "#9d4b73", lineHeight: 18 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#f8bbd0" },
  chipRed: { borderColor: "#ef9a9a" },
  chipOn: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  chipRedOn: { backgroundColor: "#c62828", borderColor: "#c62828" },
  chipText: { fontSize: 13, color: "#9d4b73", fontWeight: "600" },
  input: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#f8bbd0", padding: 12, marginTop: 8, fontSize: 14 },
  redCard: { backgroundColor: "#ffebee", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  redTitle: { fontSize: 16, fontWeight: "800", color: "#c62828", marginBottom: 4 },
  redText: { fontSize: 13, color: "#b71c1c", lineHeight: 19, fontWeight: "600" },
  warnCard: { backgroundColor: "#fff7e6", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#ffd591" },
  warnTitle: { fontSize: 16, fontWeight: "800", color: "#8a5a00", marginBottom: 4 },
  warnText: { fontSize: 13, color: "#8a5a00", lineHeight: 19 },
  saveBtn: { backgroundColor: "#ec4899", borderRadius: 14, padding: 14, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  histRow: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#f8d7e6", marginTop: 8 },
  histDate: { fontSize: 14, fontWeight: "700", color: "#333" },
  errorCard: { backgroundColor: "#ffebee", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  errorText: { color: "#b71c1c", fontSize: 13 },
  successCard: { backgroundColor: "#e8f5e9", borderRadius: 16, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#a5d6a7" },
  successText: { color: "#2e7d32", fontWeight: "600", textAlign: "center" },
});