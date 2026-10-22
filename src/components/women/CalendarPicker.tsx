import { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  value: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarPicker({ visible, value, onSelect, onClose }: Props) {
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());

  useEffect(() => {
    if (visible) {
      setYear(value.getFullYear());
      setMonth(value.getMonth());
    }
  }, [visible]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const nextDisabled =
    year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth());

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const goNext = () => {
    if (nextDisabled) return;
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const isSelected = (d: number) =>
    value.getFullYear() === year && value.getMonth() === month && value.getDate() === d;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.bg}>
        <View style={s.box}>
          {/* Month header */}
          <View style={s.header}>
            <TouchableOpacity onPress={goPrev} style={s.arrow}>
              <Text style={s.arrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthText}>
              {MONTHS[month]} {year}
            </Text>
            <TouchableOpacity onPress={goNext} style={s.arrow} disabled={nextDisabled}>
              <Text style={[s.arrowText, nextDisabled && { opacity: 0.25 }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday names */}
          <View style={s.row}>
            {DAYS.map((d) => (
              <Text key={d} style={s.dayName}>{d}</Text>
            ))}
          </View>

          {/* Dates */}
          <View style={s.grid}>
            {cells.map((d, i) => {
              if (d === null) return <View key={`e${i}`} style={s.cell} />;
              const date = new Date(year, month, d);
              const future = date.getTime() > today.getTime();
              const selected = isSelected(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={s.cell}
                  disabled={future}
                  onPress={() => onSelect(date)}
                >
                  <View style={[s.dateCircle, selected && s.dateSelected]}>
                    <Text style={[s.dateText, future && s.dateFuture, selected && s.dateTextSel]}>
                      {d}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeText}>Band karo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  box: { backgroundColor: "#fff", borderRadius: 24, padding: 18, width: "92%", maxWidth: 380 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fde7f1", alignItems: "center", justifyContent: "center" },
  arrowText: { fontSize: 24, color: "#ec4899", fontWeight: "bold", marginTop: -3 },
  monthText: { fontSize: 18, fontWeight: "700", color: "#333" },
  row: { flexDirection: "row", marginBottom: 6 },
  dayName: { width: "14.28%", textAlign: "center", color: "#c98aa8", fontWeight: "600", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", height: 44, alignItems: "center", justifyContent: "center" },
  dateCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dateSelected: { backgroundColor: "#ec4899" },
  dateText: { fontSize: 15, color: "#333", fontWeight: "500" },
  dateFuture: { color: "#ccc" },
  dateTextSel: { color: "#fff", fontWeight: "700" },
  closeBtn: { marginTop: 10, padding: 12, alignItems: "center" },
  closeText: { color: "#9d4b73", fontWeight: "600" },
});