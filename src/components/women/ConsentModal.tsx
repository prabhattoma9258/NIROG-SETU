import { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

type Props = {
  visible: boolean;
  loading: boolean;
  onAccept: () => void;
  onCancel: () => void;
};

export default function ConsentModal({ visible, loading, onAccept, onCancel }: Props) {
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.9);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.bg}>
        <Animated.View style={[s.box, { transform: [{ scale }] }]}>
          <Text style={s.title}>🌸 Women's Health</Text>
          <Text style={s.msg}>
            Aapka health data private rahega aur sirf aapke account se juda hoga.
            Aage badhne ke liye permission dein.
          </Text>
          <View style={s.row}>
            <TouchableOpacity style={[s.btn, s.cancel]} onPress={onCancel}>
              <Text style={s.cancelText}>Abhi nahi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, s.ok, loading && { opacity: 0.6 }]}
              onPress={onAccept}
              disabled={loading}
            >
              <Text style={s.okText}>{loading ? "Ruko..." : "OK, aage badhein"}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  box: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "88%", maxWidth: 360 },
  title: { fontSize: 18, fontWeight: "700", color: "#ec4899", textAlign: "center", marginBottom: 8 },
  msg: { color: "#444", textAlign: "center", lineHeight: 20 },
  row: { flexDirection: "row", gap: 10, marginTop: 18 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  cancel: { backgroundColor: "#f3f3f3" },
  ok: { backgroundColor: "#ec4899" },
  cancelText: { fontWeight: "600", color: "#333" },
  okText: { fontWeight: "600", color: "#fff" },
});

// permission hai ye women section ki 