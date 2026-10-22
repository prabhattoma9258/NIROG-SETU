import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import CalendarPicker from "./CalendarPicker";
import { fetchPregnancyNotes, savePregnancyNotes } from "../../api/women";
import { toStr, pretty, daysFromToday } from "../../utils/dates";

export default function PregnancyNotes({ userId, week }: { userId: string; week: number }) {
  const [loading, setLoading] = useState(true);
  const [visitDate, setVisitDate] = useState<string | null>(null);
  const [visitNote, setVisitNote] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQ, setNewQ] = useState("");
  const [calOpen, setCalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const n = await fetchPregnancyNotes(userId);
        setVisitDate(n.nextVisitDate);
        setVisitNote(n.nextVisitNote || "");
        setQuestions(n.questions || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const persist = async (date: string | null, note: string, qs: string[]) => {
    try {
      setError(null);
      await savePregnancyNotes(userId, date, note || null, qs);
      setSuccess("Saved ✅");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    }
  };

  const addQuestion = async () => {
    const q = newQ.trim();
    if (!q) return;
    const next = [...questions, q];
    setQuestions(next);
    setNewQ("");
    await persist(visitDate, visitNote, next);
  };

  const removeQuestion = async (i: number) => {
    const next = questions.filter((_, idx) => idx !== i);
    setQuestions(next);
    await persist(visitDate, visitNote, next);
  };

  if (loading) return <View style={s3.center}><ActivityIndicator size="large" color="#ec4899" /></View>;

  const left = visitDate ? daysFromToday(visitDate) : null;
  const leftText =
    left === null ? "" : left > 0 ? `In ${left} days` : left === 0 ? "It's today!" : "This date has passed";

  return (
    <View>
      {error && <View style={s3.errorCard}><Text style={s3.errorText}>{error}</Text></View>}
      {success && <View style={s3.successCard}><Text style={s3.successText}>{success}</Text></View>}

      <View style={s3.card}>
        <Text style={s3.cardTitle}>📅 My next visit</Text>
        {visitDate ? (
          <>
            <Text style={s3.big}>{pretty(visitDate)}</Text>
            <Text style={s3.hint}>{leftText}</Text>
          </>
        ) : (
          <Text style={s3.hint}>Write down the date your doctor gave you for the next visit.</Text>
        )}

        <TouchableOpacity style={s3.dateBtn} onPress={() => setCalOpen(true)}>
          <Text style={s3.dateText}>{visitDate ? "📅 Change date" : "📅 Pick a date"}</Text>
        </TouchableOpacity>

        <TextInput
          style={s3.input}
          value={visitNote}
          onChangeText={setVisitNote}
          placeholder="Note (e.g. sugar test, come on an empty stomach)"
          multiline
        />
        <View style={s3.btnRow}>
          <TouchableOpacity style={s3.saveBtn} onPress={() => persist(visitDate, visitNote, questions)}>
            <Text style={s3.saveText}>Save</Text>
          </TouchableOpacity>
          {visitDate && (
            <TouchableOpacity
              style={s3.clearBtn}
              onPress={async () => { setVisitDate(null); setVisitNote(""); await persist(null, "", questions); }}
            >
              <Text style={s3.clearText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CalendarPicker
        visible={calOpen}
        value={visitDate ? new Date(visitDate + "T00:00:00") : new Date()}
        onSelect={async (d) => {
          const str = toStr(d);
          setVisitDate(str);
          setCalOpen(false);
          await persist(str, visitNote, questions);
        }}
        onClose={() => setCalOpen(false)}
      />

      <View style={s3.card}>
        <Text style={s3.cardTitle}>❓ Questions to ask the doctor</Text>
        <Text style={s3.hint}>Write down whatever comes to mind so you won't forget it at the visit.</Text>

        <View style={s3.addRow}>
          <TextInput
            style={[s3.input, { flex: 1, marginTop: 0 }]}
            value={newQ}
            onChangeText={setNewQ}
            placeholder="Write your question"
          />
          <TouchableOpacity style={s3.addBtn} onPress={addQuestion}>
            <Text style={s3.addText}>+</Text>
          </TouchableOpacity>
        </View>

        {questions.map((q, i) => (
          <View key={`${i}-${q}`} style={s3.qRow}>
            <Text style={s3.qText}>• {q}</Text>
            <TouchableOpacity onPress={() => removeQuestion(i)}><Text style={s3.del}>✕</Text></TouchableOpacity>
          </View>
        ))}
        {questions.length === 0 && <Text style={[s3.hint, { marginTop: 10 }]}>No questions yet.</Text>}
      </View>
    </View>
  );
}

const s3 = StyleSheet.create({
  center: { padding: 40, alignItems: "center" },
  card: { backgroundColor: "#fff0f6", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#f8bbd0" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#ec4899", marginBottom: 4 },
  big: { fontSize: 22, fontWeight: "800", color: "#333", marginVertical: 4 },
  hint: { fontSize: 13, color: "#9d4b73", lineHeight: 18 },
  input: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#f8bbd0", padding: 12, marginTop: 12, fontSize: 14 },
  dateBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "#f8bbd0", alignItems: "center" },
  dateText: { fontSize: 15, fontWeight: "600", color: "#333" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  saveBtn: { flex: 1, backgroundColor: "#ec4899", borderRadius: 14, padding: 12, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  clearBtn: { paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: "#f8bbd0", justifyContent: "center", backgroundColor: "#fff" },
  clearText: { color: "#9d4b73", fontWeight: "600" },
  addRow: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#ec4899", alignItems: "center", justifyContent: "center" },
  addText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  qRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#f8d7e6", marginTop: 8 },
  qText: { flex: 1, fontSize: 14, color: "#333", lineHeight: 20 },
  del: { fontSize: 18, color: "#c98aa8", paddingHorizontal: 8 },
  errorCard: { backgroundColor: "#ffebee", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  errorText: { color: "#b71c1c", fontSize: 13 },
  successCard: { backgroundColor: "#e8f5e9", borderRadius: 16, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#a5d6a7" },
  successText: { color: "#2e7d32", fontWeight: "600", textAlign: "center" },
});