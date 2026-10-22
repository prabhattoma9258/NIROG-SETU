import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  mode: "health" | "women";
  onChange: (m: "health" | "women") => void;
};

export default function ModeSwitch({ mode, onChange }: Props) {
  return (
    <View style={s.wrap}>
      <TouchableOpacity
        style={[s.pill, mode === "health" && s.activeHealth]}
        onPress={() => onChange("health")}
      >
        <Text style={[s.text, mode === "health" && s.textHealth]}>🩺 Health</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.pill, mode === "women" && s.activeWomen]}
        onPress={() => onChange("women")}
      >
        <Text style={[s.text, mode === "women" && s.textWomen]}>🌸 Women</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#fde7f1",
    borderRadius: 999,
    padding: 4,
  },
  pill: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999 },
  activeHealth: { backgroundColor: "#fff", elevation: 2 },
  activeWomen: { backgroundColor: "#ec4899", elevation: 3 },
  text: { fontWeight: "600", color: "#9d4b73" },
  textHealth: { color: "#333" },
  textWomen: { color: "#fff" },
});