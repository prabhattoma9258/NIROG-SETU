import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import CalendarPicker from "./CalendarPicker";
import {
  fetchPregnancyInvestigations, savePregnancyInvestigation, PregnancyInvestigation,
} from "../../api/women";
import { INVESTIGATIONS } from "../../constants/pregnancyContent";
import { toStr, pretty } from "../../utils/dates";

function TestCard({ item, userId }: { item: PregnancyInvestigation; userId: string }) {
  const meta = INVESTIGATIONS.find((i) => i.key === item.key)!;
  const [done, setDone] = useState(item.done);
  const [date, setDate] = useState<string | null>(item.date);
  const [note, setNote] = useState(item.note || "");
  const [calOpen, setCalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const noteAllowed = item.key !== "viral_markers";

  const onSave = async () => {
    setMsg(null);
    if (done && !date) {
      setMsg({ ok: false, text: "Please pick the date of the test" });
      return;
    }
    try {
      setSaving(true);
      await savePregnancyInvestigation(userId, item.key, done, done ? date : null, done && noteAllowed ? note.trim() || null : null);
      setMsg({ ok: true, text: "Saved ✅" });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{meta.label}</Text>
      <Text style={s.hint}>{meta.about}</Text>

      <View style={s.optRow}>
        <TouchableOpacity style={[s.opt, done && s.optOn]} onPress={() => { setDone(true); setMsg(null); }}>
          <Text style={[s.optText, done && s.optTextOn]}>✓ Done</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.opt, !done && s.optOn]} onPress={() => { setDone(false); setMsg(null); }}>
          <Text style={[s.optText, !done && s.optTextOn]}>Not yet</Text>
        </TouchableOpacity>
      </View>

      {done && (
        <>
          <TouchableOpacity style={s.dateBtn} onPress={() => setCalOpen(true)}>
            <Text style={s.dateText}>{date ? `📅 ${pretty(date)}` : "📅 When was it done? Pick a date"}</Text>
          </TouchableOpacity>
          {noteAllowed && (
            <TextInput
              style={s.input}
              value={note}
              onChangeText={setNote}
              placeholder="Short note (optional)"
            />
          )}
        </>
      )}

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
        <Text style={s.saveText}>{saving ? "Please wait..." : "Save"}</Text>
      </TouchableOpacity>
      {msg && <Text style={[s.msg, { color: msg.ok ? "#2e7d32" : "#b71c1c" }]}>{msg.text}</Text>}

      <CalendarPicker
        visible={calOpen}
        value={date ? new Date(`${date}T00:00:00`) : new Date()}
        onSelect={(d) => { setDate(toStr(d)); setCalOpen(false); setMsg(null); }}
        onClose={() => setCalOpen(false)}
      />
    </View>
  );
}

export default function PregnancyInvestigations({ userId }: { userId: string }) {
  const [list, setList] = useState<PregnancyInvestigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setList(await fetchPregnancyInvestigations(userId));
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#ec4899" /></View>;

  return (
    <View>
      {error && <View style={s.errorCard}><Text style={s.errorText}>{error}</Text></View>}

      <View style={[s.card, s.warnCard]}>
        <Text style={s.warnText}>
          Only note here whether a test was done and when. Do not enter report results in the app (especially viral markers); show them directly to your doctor.
        </Text>
      </View>

      {list.map((item) => (
        <TestCard key={item.key} item={item} userId={userId} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  center: { padding: 40, alignItems: "center" },
  card: { backgroundColor: "#fff0f6", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#ec4899", marginBottom: 4 },
  hint: { fontSize: 13, color: "#9d4b73", lineHeight: 18 },
  optRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  opt: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#f8bbd0", alignItems: "center" },
  optOn: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  optText: { fontSize: 14, fontWeight: "600", color: "#9d4b73" },
  optTextOn: { color: "#fff" },
  dateBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: "#f8bbd0", alignItems: "center" },
  dateText: { fontSize: 15, fontWeight: "600", color: "#333" },
  input: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#f8bbd0", padding: 12, marginTop: 10, fontSize: 14 },
  saveBtn: { backgroundColor: "#ec4899", borderRadius: 14, padding: 12, marginTop: 14, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  msg: { textAlign: "center", marginTop: 8, fontSize: 13, fontWeight: "600" },
  warnCard: { backgroundColor: "#fff7e6", borderColor: "#ffd591" },
  warnText: { color: "#8a5a00", fontSize: 13, lineHeight: 19 },
  errorCard: { backgroundColor: "#ffebee", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  errorText: { color: "#b71c1c", fontSize: 13 },
});