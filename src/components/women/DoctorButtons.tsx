import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { DOCTOR } from "../../constants/pregnancyContent";

export default function DoctorButtons({ message }: { message: string }) {
  const openWhatsApp = () =>
    Linking.openURL(`https://wa.me/${DOCTOR.whatsapp}?text=${encodeURIComponent(message)}`).catch(() =>
      Alert.alert("WhatsApp nahi khula", "Doctor ko call karke dekhiye.")
    );

  return (
    <View style={s.row}>
      <TouchableOpacity style={[s.btn, { backgroundColor: "#25D366" }]} onPress={openWhatsApp}>
        <Text style={s.text}>💬 WhatsApp</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn, { backgroundColor: "#ec4899" }]} onPress={() => Linking.openURL(`tel:${DOCTOR.phone}`)}>
        <Text style={s.text}>📞 Call karo</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  text: { color: "#fff", fontWeight: "700", fontSize: 14 },
});