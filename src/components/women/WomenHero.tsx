import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import { HERO_HTML } from "./heroHtml";

type Props = {
  name: string;
  mode?: "health" | "women"; // optional now (switch removed from here)
  onModeChange?: (m: "health" | "women") => void; // optional now
  chip: string; // live status, e.g. "Next period in 4 days"
};

export default function WomenHero({ name, chip }: Props) {
  const hasHtml = HERO_HTML.trim().length > 20;

  return (
    <LinearGradient
      colors={["#fdd0e4", "#f9a8d4", "#ec74b4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.card}
    >
      <View style={s.left}>
        <Text style={s.hello} numberOfLines={2}>Hello, {name}! 👋</Text>
        <Text style={s.sub}>Welcome to your Women's Health</Text>
        <View style={s.chip}>
          <View style={s.chipDot} />
          <Text style={s.chipText}>{chip}</Text>
        </View>
      </View>

      {/* pointerEvents none: the animation must not block scrolling */}
      <View style={s.right} pointerEvents="none">
        {hasHtml ? (
          <WebView
            originWhitelist={["*"]}
            source={{ html: HERO_HTML }}
            style={s.web}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled
            opaque={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={s.fallback}>🏃‍♀️</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 28, padding: 18, flexDirection: "row", alignItems: "center",
    overflow: "hidden", minHeight: 176,
  },
  left: { flex: 1, paddingRight: 6 },
  hello: { fontSize: 24, fontWeight: "800", color: "#6b1d4a" },
  sub: { fontSize: 13, color: "#8f2d64", marginTop: 4, lineHeight: 18 },
  chip: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.8)", paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 999, marginTop: 14,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0f9d8a", marginRight: 7 },
  chipText: { fontSize: 12, fontWeight: "700", color: "#7a1f4f" },
  right: { width: 132, height: 160, marginRight: -10 },
  web: { flex: 1, backgroundColor: "transparent" },
  fallback: { fontSize: 72, textAlign: "center", marginTop: 40 },
});