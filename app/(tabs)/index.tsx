import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌊</Text>
      <Text style={styles.title}>Apnea Trainer</Text>
      <Text style={styles.subtitle}>Выберите тип тренировки</Text>

      <Pressable
        style={[styles.btn, styles.btnPrimary]}
        // ВАЖНО: идем на таб "square", НЕ "session"
        onPress={() => router.push("/(tabs)/square")}
      >
        <Text style={styles.btnText}>Square Breathing</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  logo: { fontSize: 40, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, minWidth: 220, alignItems: "center" },
  btnPrimary: { backgroundColor: "#2563eb" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
