import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import CalendarPicker from "./CalendarPicker";
import CycleHero from "./periods/CycleHero";
import {
  fetchPeriodData, savePeriodDate, saveMissedPeriod, deleteMissedPeriod,
  PeriodData, PeriodEntry,
} from "../../api/women";
import { toStr, pretty, daysFromToday } from "../../utils/dates";

const FLOW_LABEL: Record<string, string> = { light: "Light", medium: "Normal", heavy: "Heavy" };
const FLOWS = [
  { id: "light", label: "Light", icon: "💧" },
  { id: "medium", label: "Normal", icon: "💧💧" },
  { id: "heavy", label: "Heavy", icon: "💧💧💧" },
];

const PAIN_LABEL: Record<string, string> = { painful: "Painful", painless: "Painless" };
const PAINS = [
  { id: "painful", label: "Had pain 😣" },
  { id: "painless", label: "No pain 🙂" },
];

const TESTS = [
  { id: "negative", label: "Negative" },
  { id: "positive", label: "Positive" },
  { id: "not_done", label: "Not taken" },
];
const TEST_LABEL: Record<string, string> = {
  negative: "Test negative", positive: "Test positive", not_done: "Test not taken",
};

const PATTERN: Record<string, { label: string; hint: string }> = {
  regular: { label: "Regular ✅", hint: "Cycle is between 21 and 35 days" },
  short: { label: "Short cycle ⚠️", hint: "Cycle is shorter than 21 days" },
  prolonged: { label: "Long cycle ⚠️", hint: "Cycle is longer than 35 days" },
  unknown: { label: "Not known yet", hint: "2 dates are needed to find a pattern" },
};

type Tab = "today" | "log" | "history";
type LogMode = "period" | "missed";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "🏠 Today" },
  { id: "log", label: "➕ Log" },
  { id: "history", label: "📜 History" },
];

const addDays = (s: string, n: number) => {
  const [y, m, d] = s.split("-").map(Number);
  return toStr(new Date(y, m - 1, d + n));
};
const toDate = (s: string) => new Date(`${s}T00:00:00`);

const rangeText = (p: PeriodEntry) =>
  p.endDate ? `${pretty(p.startDate)} to ${pretty(p.endDate)}` : `Started ${pretty(p.startDate)}`;

const extras = (p: PeriodEntry) => {
  const parts: string[] = [];
  if (p.flow) parts.push(`Flow: ${FLOW_LABEL[p.flow]}`);
  if (p.pain) parts.push(PAIN_LABEL[p.pain]);
  if (p.spotting === true) parts.push("Spotting in between");
  return parts.join("  •  ");
};

// ---------- small helpers ----------
function Opt({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.optBtn, on && s.optBtnOn]} onPress={onPress}>
      <Text style={[s.optText, on && s.optTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Row({ icon, label, value, sub, last }: { icon: string; label: string; value: string; sub?: string; last?: boolean }) {
  return (
    <View style={[s.infoRow, !last && s.infoRowLine]}>
      <Text style={s.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
        {sub ? <Text style={s.infoSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

type Props = {
  userId: string;
  // Opens the Pregnancy tab when the test is positive (lmp = date of last period)
  onStartPregnancy?: (lmp: string | null) => void;
};

export default function PeriodTracker({ userId, onStartPregnancy }: Props) {
  const [data, setData] = useState<PeriodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState<Tab>("today");
  const [logMode, setLogMode] = useState<LogMode>("period");

  // "Period started" form
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date | null>(null);
  const [flow, setFlow] = useState<string | null>(null);
  const [pain, setPain] = useState<string | null>(null);
  const [spotting, setSpotting] = useState<boolean | null>(null);

  // "Period missed" form (null = automatically uses the expected date)
  const [missedDate, setMissedDate] = useState<Date | null>(null);
  const [missedTest, setMissedTest] = useState<string | null>(null);

  const [calFor, setCalFor] = useState<"start" | "end" | "missed" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setData(await fetchPeriodData(userId));
    } catch (e: any) {
      setError(e?.message || "Could not load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const openTab = (t: Tab) => {
    setError(null);
    setSuccess(null);
    setTab(t);
  };

  const openMissedForm = () => {
    setError(null);
    setSuccess(null);
    setLogMode("missed");
    setTab("log");
  };

  const onSave = async () => {
    setError(null);
    setSuccess(null);

    if (end && toStr(end) < toStr(start)) {
      setError("End date cannot be before the start date");
      return;
    }

    try {
      setSaving(true);
      await savePeriodDate(userId, toStr(start), end ? toStr(end) : null, flow, pain, spotting);
      setEnd(null);
      setFlow(null);
      setPain(null);
      setSpotting(null);
      await load();
      setSuccess("Period saved ✅");
      setTab("today");
    } catch (e: any) {
      setError(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  const a = data?.analysis;
  const periods = data?.periods ?? [];
  const last = periods[0];
  const missed = data?.missed ?? [];
  const latestMissed = missed[0];

  const todayS = toStr(new Date());

  // How many days the period is late
  const lateDays = a ? -daysFromToday(a.nextPeriod) : 0;
  // If a "missed" entry was already logged in the last few days, don't ask again
  const alreadyLogged = a ? missed.some((m) => m.date >= addDays(a.nextPeriod, -3)) : false;
  const showLatePrompt = !!a && lateDays >= 5 && !alreadyLogged;

  // "When was the period due" date: the app already knows it, so pre-fill it
  const expected = a && a.nextPeriod <= todayS ? a.nextPeriod : null;
  const missedShown = missedDate ?? (expected ? toDate(expected) : new Date());

  const showPregnancyCard =
    !!onStartPregnancy &&
    latestMissed?.test === "positive" &&
    daysFromToday(latestMissed.date) >= -60;

  const onSaveMissed = async () => {
    setError(null);
    setSuccess(null);
    if (!missedTest) {
      setError("Please select the pregnancy test result");
      return;
    }
    try {
      setSaving(true);
      await saveMissedPeriod(userId, toStr(missedShown), missedTest);
      setMissedTest(null);
      setMissedDate(null);
      await load();
      setSuccess("Saved ✅");
      setTab("today");
    } catch (e: any) {
      setError(e?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteMissed = (date: string) =>
    Alert.alert("Delete this entry?", pretty(date), [
      { text: "No", style: "cancel" },
      {
        text: "Yes, delete",
        style: "destructive",
        onPress: async () => {
          try { await deleteMissedPeriod(userId, date); await load(); }
          catch (e: any) { setError(e?.message || "Could not delete"); }
        },
      },
    ]);

  return (
    <View style={s.wrap}>
      {/* 3 SMALL TABS */}
      <View style={s.seg}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <TouchableOpacity key={t.id} style={[s.segItem, on && s.segItemOn]} onPress={() => openTab(t.id)}>
              <Text style={[s.segText, on && s.segTextOn]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <View style={s.errorCard}>
          <Text style={s.errorTitle}>Something went wrong:</Text>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      {success && (
        <View style={s.successCard}>
          <Text style={s.successText}>{success}</Text>
        </View>
      )}

      {/* ================= 🏠 TODAY ================= */}
      {tab === "today" && (
        <>
          {showPregnancyCard && (
            <View style={s.pregCard}>
              <Text style={s.pregTitle}>🎉 Your test was positive</Text>
              <Text style={s.pregText}>
                You can start the pregnancy tracker. You will get your pregnancy week, estimated due date and important information. Please visit a doctor for your first checkup.
              </Text>
              <TouchableOpacity
                style={s.pregBtn}
                onPress={() => onStartPregnancy && onStartPregnancy(last?.startDate ?? null)}
              >
                <Text style={s.pregBtnText}>Start pregnancy tracker</Text>
              </TouchableOpacity>
            </View>
          )}

          {showLatePrompt && (
            <View style={[s.card, s.warnCard]}>
              <Text style={s.warnTitle}>Period is {lateDays} days late</Text>
              <Text style={s.warnText}>Did you take a pregnancy test? Note the result here, it will help your doctor.</Text>
              <TouchableOpacity style={s.warnBtn} onPress={openMissedForm}>
                <Text style={s.warnBtnText}>Log test result</Text>
              </TouchableOpacity>
            </View>
          )}

          {a && periods.length > 0 ? (
            <CycleHero analysis={a} periods={periods} />
          ) : (
            <View style={s.card}>
              <Text style={s.cardTitle}>No period saved yet</Text>
              <Text style={s.hint}>Enter the date of your last period, then your next period and fertile days will be shown.</Text>
              <TouchableOpacity
                style={s.saveBtn}
                onPress={() => { setLogMode("period"); openTab("log"); }}
              >
                <Text style={s.saveText}>Add first period</Text>
              </TouchableOpacity>
            </View>
          )}

          {a && last && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Your cycle details</Text>

              <Row icon="🗓️" label="Last period" value={rangeText(last)} sub={extras(last) || undefined} />
              <Row
                icon="📅"
                label="Next period"
                value={`${pretty(a.nextPeriod)}${a.estimated ? " (estimate)" : ""}`}
              />
              <Row
                icon="🔁"
                label="Cycle"
                value={a.estimated ? "Estimate for now: 28 days" : `${a.avgCycle} days  •  ${PATTERN[a.pattern].label}`}
                sub={a.estimated ? undefined : PATTERN[a.pattern].hint}
              />
              {a.avgPeriodDays ? (
                <Row icon="⏱️" label="Period length" value={`${a.avgPeriodDays} days`} />
              ) : null}
              {a.fertileStart && a.fertileEnd ? (
                <Row
                  icon="🌱"
                  label="Fertile days (estimate)"
                  value={`${pretty(a.fertileStart)} to ${pretty(a.fertileEnd)}`}
                  sub="This is only an estimate, not exact."
                  last
                />
              ) : null}
            </View>
          )}

          {a?.estimated ? (
            <View style={[s.card, s.warnCard]}>
              <Text style={s.warnText}>
                Only 1 period is saved so far, so this is an estimate. For an accurate pattern, also add the date of last month's period.
              </Text>
            </View>
          ) : a?.note ? (
            <View style={[s.card, s.warnCard]}>
              <Text style={s.warnText}>{a.note}</Text>
            </View>
          ) : null}
        </>
      )}

      {/* ================= ➕ LOG ================= */}
      {tab === "log" && (
        <>
          {/* One at a time, not both together */}
          <View style={s.toggle}>
            <TouchableOpacity
              style={[s.toggleItem, logMode === "period" && s.toggleItemOn]}
              onPress={() => { setLogMode("period"); setError(null); }}
            >
              <Text style={[s.toggleText, logMode === "period" && s.toggleTextOn]}>Period started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleItem, logMode === "missed" && s.toggleItemOn]}
              onPress={() => { setLogMode("missed"); setError(null); }}
            >
              <Text style={[s.toggleText, logMode === "missed" && s.toggleTextOn]}>❓ Period missed</Text>
            </TouchableOpacity>
          </View>

          {logMode === "period" ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>Period details</Text>

              <Text style={s.fieldLabel}>When did it start?</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setCalFor("start")}>
                <Text style={s.dateText}>📅 {pretty(toStr(start))}</Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>When did it end?</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setCalFor("end")}>
                <Text style={s.dateText}>{end ? `📅 ${pretty(toStr(end))}` : "📅 Select date"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEnd(null)}>
                <Text style={[s.skipText, !end && s.skipOn]}>
                  {end ? "✕ Remove end date" : "✓ Still ongoing (add end date later)"}
                </Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>How was the flow?</Text>
              <View style={s.flowRow}>
                {FLOWS.map((f) => {
                  const on = flow === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[s.flowBtn, on && s.flowBtnOn]}
                      onPress={() => setFlow(on ? null : f.id)}
                    >
                      <Text style={s.flowIcon}>{f.icon}</Text>
                      <Text style={[s.flowText, on && s.flowTextOn]}>{f.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={s.tiny}>Light = very little bleeding, Heavy = a lot of bleeding</Text>

              <Text style={s.fieldLabel}>Was there pain during the period?</Text>
              <View style={s.optRow}>
                {PAINS.map((p) => (
                  <Opt key={p.id} label={p.label} on={pain === p.id} onPress={() => setPain(pain === p.id ? null : p.id)} />
                ))}
              </View>

              <Text style={s.fieldLabel}>Was there light bleeding (spotting) between two periods?</Text>
              <View style={s.optRow}>
                <Opt label="Yes" on={spotting === true} onPress={() => setSpotting(spotting === true ? null : true)} />
                <Opt label="No" on={spotting === false} onPress={() => setSpotting(spotting === false ? null : false)} />
              </View>

              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
                <Text style={s.saveText}>{saving ? "Please wait..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.card}>
              <Text style={s.cardTitle}>❓ Period missed</Text>
              <Text style={s.hint}>
                Did your due date pass without your period starting? Note down the pregnancy test result here.
              </Text>

              <Text style={s.fieldLabel}>When was the period due?</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setCalFor("missed")}>
                <Text style={s.dateText}>📅 {pretty(toStr(missedShown))}</Text>
              </TouchableOpacity>
              {expected && missedDate === null && (
                <Text style={s.tiny}>This date was calculated by the app from your cycle. You can change it if it is wrong.</Text>
              )}

              <Text style={s.fieldLabel}>Pregnancy test result?</Text>
              <View style={s.optRow}>
                {TESTS.map((t) => (
                  <Opt key={t.id} label={t.label} on={missedTest === t.id} onPress={() => setMissedTest(missedTest === t.id ? null : t.id)} />
                ))}
              </View>

              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={onSaveMissed} disabled={saving}>
                <Text style={s.saveText}>{saving ? "Please wait..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* ================= 📜 HISTORY ================= */}
      {tab === "history" && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Periods ({periods.length})</Text>
            {periods.length > 0 ? (
              periods.slice(0, 12).map((p) => (
                <View key={p.startDate} style={s.histRow}>
                  <Text style={s.histRange}>{rangeText(p)}</Text>
                  <Text style={s.histSub}>
                    {p.days ? `${p.days} days` : "no end date"}
                    {extras(p) ? `  •  ${extras(p)}` : ""}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={s.hint}>No period saved yet.</Text>
            )}
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>❓ Missed periods ({missed.length})</Text>
            {missed.length > 0 ? (
              missed.slice(0, 10).map((m) => (
                <View key={m.date} style={s.missedRow}>
                  <Text style={s.missedText}>
                    {pretty(m.date)}  •  {TEST_LABEL[m.test]}
                  </Text>
                  <TouchableOpacity onPress={() => onDeleteMissed(m.date)}>
                    <Text style={s.del}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={s.hint}>No entries.</Text>
            )}
          </View>
        </>
      )}

      <CalendarPicker
        visible={calFor !== null}
        value={calFor === "end" ? end ?? start : calFor === "missed" ? missedShown : start}
        onSelect={(d) => {
          if (calFor === "start") setStart(d);
          else if (calFor === "end") setEnd(d);
          else if (calFor === "missed") setMissedDate(d);
          setCalFor(null);
          setSuccess(null);
        }}
        onClose={() => setCalFor(null)}
      />

      <Text style={s.disclaimer}>This information is for general purposes and is not a substitute for medical advice.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { padding: 40, alignItems: "center" },
  wrap: { paddingHorizontal: 20, paddingBottom: 30 },

  // 3 small tabs
  seg: { flexDirection: "row", backgroundColor: "#fde7f1", borderRadius: 16, padding: 4, marginBottom: 14 },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  segItemOn: { backgroundColor: "#fff", elevation: 2 },
  segText: { fontSize: 13, fontWeight: "700", color: "#9d4b73" },
  segTextOn: { color: "#ec4899" },

  // Period started / missed switch
  toggle: { flexDirection: "row", gap: 8, marginBottom: 14 },
  toggleItem: {
    flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center",
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#f8bbd0",
  },
  toggleItemOn: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  toggleText: { fontSize: 14, fontWeight: "700", color: "#9d4b73" },
  toggleTextOn: { color: "#fff" },

  card: {
    backgroundColor: "#fff0f6", borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#f8bbd0",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#ec4899", marginBottom: 4 },
  hint: { fontSize: 13, color: "#9d4b73", lineHeight: 18 },
  tiny: { fontSize: 11, color: "#c98aa8", marginTop: 6 },

  // cycle details rows
  infoRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 },
  infoRowLine: { borderBottomWidth: 1, borderBottomColor: "#f8d7e6" },
  infoIcon: { fontSize: 20, width: 34, marginTop: 2 },
  infoLabel: { fontSize: 12, color: "#9d4b73", fontWeight: "600" },
  infoValue: { fontSize: 15, color: "#333", fontWeight: "700", marginTop: 2 },
  infoSub: { fontSize: 12, color: "#9d4b73", marginTop: 2, lineHeight: 17 },

  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#9d4b73", marginTop: 14 },
  dateBtn: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginTop: 8,
    borderWidth: 1, borderColor: "#f8bbd0", alignItems: "center",
  },
  dateText: { fontSize: 16, fontWeight: "600", color: "#333" },
  skipText: { fontSize: 13, color: "#9d4b73", marginTop: 8, textAlign: "center" },
  skipOn: { color: "#ec4899", fontWeight: "700" },

  flowRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  flowBtn: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, paddingVertical: 12,
    alignItems: "center", borderWidth: 1, borderColor: "#f8bbd0",
  },
  flowBtnOn: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  flowIcon: { fontSize: 12 },
  flowText: { fontSize: 14, fontWeight: "600", color: "#9d4b73", marginTop: 4 },
  flowTextOn: { color: "#fff" },

  optRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  optBtn: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#f8bbd0",
  },
  optBtnOn: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  optText: { fontSize: 14, fontWeight: "600", color: "#9d4b73" },
  optTextOn: { color: "#fff" },

  saveBtn: { backgroundColor: "#ec4899", borderRadius: 14, padding: 14, marginTop: 18, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  missedRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#f8d7e6", marginTop: 4,
  },
  missedText: { flex: 1, fontSize: 13, color: "#333" },
  del: { fontSize: 18, color: "#c98aa8", paddingHorizontal: 8 },

  pregCard: {
    backgroundColor: "#e8f5e9", borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#a5d6a7",
  },
  pregTitle: { fontSize: 16, fontWeight: "800", color: "#2e7d32", marginBottom: 4 },
  pregText: { fontSize: 13, color: "#2e7d32", lineHeight: 19 },
  pregBtn: { backgroundColor: "#2e7d32", borderRadius: 14, padding: 14, marginTop: 12, alignItems: "center" },
  pregBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  warnCard: { backgroundColor: "#fff7e6", borderColor: "#ffd591" },
  warnTitle: { fontSize: 16, fontWeight: "800", color: "#8a5a00", marginBottom: 4 },
  warnText: { color: "#8a5a00", fontSize: 14, lineHeight: 20 },
  warnBtn: { backgroundColor: "#f59e0b", borderRadius: 14, padding: 12, marginTop: 12, alignItems: "center" },
  warnBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  errorCard: { backgroundColor: "#ffebee", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#ef9a9a" },
  errorTitle: { fontWeight: "700", color: "#c62828", marginBottom: 2 },
  errorText: { color: "#b71c1c", fontSize: 13, lineHeight: 18 },
  successCard: { backgroundColor: "#e8f5e9", borderRadius: 16, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#a5d6a7" },
  successText: { color: "#2e7d32", fontWeight: "600", textAlign: "center" },

  histRow: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f8d7e6", marginTop: 6 },
  histRange: { fontSize: 15, fontWeight: "600", color: "#333" },
  histSub: { fontSize: 13, color: "#9d4b73", marginTop: 2 },
  disclaimer: { fontSize: 12, color: "#c98aa8", textAlign: "center", marginTop: 6 },
});