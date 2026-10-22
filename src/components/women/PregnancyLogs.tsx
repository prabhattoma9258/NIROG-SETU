import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from "react-native";
import CalendarPicker from "./CalendarPicker";
import { fetchPregnancyLogs, savePregnancyLog, deletePregnancyLog, PregnancyLog } from "../../api/women";
import { DOCTOR } from "../../constants/pregnancyContent";
import { toStr, pretty } from "../../utils/dates";

export default function PregnancyLogs({ userId, week }: { userId: string; week: number }) {
  const [logs, setLogs] = useState<PregnancyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [calOpen, setCalOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      setLogs(await fetchPregnancyLogs(userId));
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    const w = weight.trim() ? parseFloat(weight) : null;
    const s = sys.trim() ? parseInt(sys) : null;
    const d = dia.trim() ? parseInt(dia) : null;
    if (w === null && s === null && d === null) {
      setError("Please enter at least weight or BP");
      return;
    }
    try {
      setSaving(true);
      await savePregnancyLog(userId, toStr(date), w, s, d);
      setSuccess("Saved ✅");
      setWeight(""); setSys(""); setDia("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (l: PregnancyLog) =>
    Alert.alert("Delete this entry?", pretty(l.date), [
      { text: "No", style: "cancel" },
      {
        text: "Yes, delete",
        style: "destructive",
        onPress: async () => {
          try { await deletePregnancyLog(userId, l.date); await load(); }
          catch (e: any) { setError(e?.message || "Failed to delete"); }
        },
      },
    ]);

  const msg = `Hello ${DOCTOR.name}, I am in week ${week} of my pregnancy. My BP reading is ${logs[0]?.systolic}/${logs[0]?.diastolic}.`;

  const withWeight = logs.filter((l) => l.weight !== null);
  const diff =
    withWeight.length >= 2
      ? Math.round((withWeight[0].weight! - withWeight[withWeight.length - 1].weight!) * 10) / 10
      : null;

  if (loading) return <View style={s2.center}><ActivityIndicator size="large" color="#ec4899" /></View>;

  return (
    <View>
      {logs[0]?.highBp && (
        <View style={s2.redCard}>
          <Text style={s2.redTitle}>⚠️ Your BP is high ({logs[0].systolic}/{logs[0].diastolic})</Text>
          <Text style={s2.redText}>
            Rest for a while and measure again. If it is still high, or if you also have a severe headache, blurred vision, or pain in the upper abdomen, inform your doctor today.
          </Text>
          <View style={s2.docRow}>
            <TouchableOpacity
              style={[s2.docBtn, { backgroundColor: "#25D366" }]}
              onPress={() => Linking.openURL(`https://wa.me/${DOCTOR.whatsapp}?text=${encodeURIComponent(msg)}`)}
            >
              <Text style={s2.docBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s2.docBtn, { backgroundColor: "#ec4899" }]}
              onPress={() => Linking.openURL(`tel:${DOCTOR.phone}`)}
            >
              <Text style={s2.docBtnText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && <View style={s2.errorCard}><Text style={s2.errorText}>{error}</Text></View>}
      {success && <View style={s2.successCard}><Text style={s2.successText}>{success}</Text></View>}

      <View style={s2.card}>
        <Text style={s2.cardTitle}>Add a new record</Text>

        <Text style={s2.label}>Which day?</Text>
        <TouchableOpacity style={s2.dateBtn} onPress={() => setCalOpen(true)}>
          <Text style={s2.dateText}>📅 {pretty(toStr(date))}</Text>
        </TouchableOpacity>

        <Text style={s2.label}>Weight (kg)</Text>
        <TextInput style={s2.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="e.g. 62.5" />

        <Text style={s2.label}>BP (systolic / diastolic)</Text>
        <View style={s2.row}>
          <TextInput style={[s2.input, { flex: 1 }]} value={sys} onChangeText={setSys} keyboardType="number-pad" placeholder="120" />
          <Text style={s2.slash}>/</Text>
          <TextInput style={[s2.input, { flex: 1 }]} value={dia} onChangeText={setDia} keyboardType="number-pad" placeholder="80" />
        </View>

        <TouchableOpacity style={[s2.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
          <Text style={s2.saveText}>{saving ? "Please wait..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <CalendarPicker
        visible={calOpen}
        value={date}
        onSelect={(d) => { setDate(d); setCalOpen(false); setSuccess(null); }}
        onClose={() => setCalOpen(false)}
      />

      {diff !== null && (
        <View style={s2.card}>
          <Text style={s2.cardTitle}>Weight change</Text>
          <Text style={s2.big}>{diff > 0 ? "+" : ""}{diff} kg</Text>
          <Text style={s2.hint}>From your first record until now. Ask your doctor how much gain is healthy for you.</Text>
        </View>
      )}

      <View style={s2.card}>
        <Text style={s2.cardTitle}>📜 Your records ({logs.length})</Text>
        {logs.length === 0 ? (
          <Text style={s2.hint}>No records yet.</Text>
        ) : (
          logs.slice(0, 15).map((l) => (
            <View key={l.date} style={s2.histRow}>
              <View style={{ flex: 1 }}>
                <Text style={s2.histDate}>{pretty(l.date)}</Text>
                <Text style={s2.hint}>
                  {l.weight !== null ? `${l.weight} kg` : ""}
                  {l.weight !== null && l.systolic !== null ? "  •  " : ""}
                  {l.systolic !== null ? `BP ${l.systolic}/${l.diastolic}` : ""}
                  {l.highBp ? "  ⚠️ high" : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDelete(l)}><Text style={s2.del}>✕</Text></TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const s2 = StyleSheet.create({
  center: { padding: 40, alignItems: "center" },
  card: { backgroundColor: "#fff0f6", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#ec4899", marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#9d4b73", marginTop: 12 },
  hint: { fontSize: 13, color: "#9d4b73", lineHeight: 18 },
  big: { fontSize: 24, fontWeight: "800", color: "#333", marginVertical: 4 },
  input: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#f8bbd0", padding: 12, marginTop: 6, fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  slash: { fontSize: 22, color: "#9d4b73", marginTop: 6 },
  dateBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 6, borderWidth: 1, borderColor: "#f8bbd0", alignItems: "center" },
  dateText: { fontSize: 15, fontWeight: "600", color: "#333" },
  saveBtn: { backgroundColor: "#ec4899", borderRadius: 14, padding: 14, marginTop: 16, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  histRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f8d7e6", marginTop: 6 },
  histDate: { fontSize: 14, fontWeight: "700", color: "#333" },
  del: { fontSize: 18, color: "#c98aa8", paddingHorizontal: 8 },
  redCard: { backgroundColor: "#ffebee", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  redTitle: { fontSize: 16, fontWeight: "800", color: "#c62828", marginBottom: 4 },
  redText: { fontSize: 13, color: "#b71c1c", lineHeight: 19, fontWeight: "600" },
  docRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  docBtn: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  docBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  errorCard: { backgroundColor: "#ffebee", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  errorText: { color: "#b71c1c", fontSize: 13 },
  successCard: { backgroundColor: "#e8f5e9", borderRadius: 16, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#a5d6a7" },
  successText: { color: "#2e7d32", fontWeight: "600", textAlign: "center" },
});