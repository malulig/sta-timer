import { useSessionStore } from "@/hooks/useSessionStore";
import { initDb } from "@/lib/db";
import { Link } from "expo-router";
import { useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRESETS = [30_000, 60_000, 90_000, 120_000, 150_000, 180_000];

export default function Home() {
  const setTargetPost = useSessionStore((s) => s.setTargetPost);

  useEffect(() => {
    initDb();
  }, []);

  return (
    <View style={s.c}>
      <Text style={s.h1}>STA Post-Contraction Timer</Text>
      <Text style={s.sub}>Выбери цель «после контракций», затем открой Session</Text>
      <FlatList
        data={PRESETS}
        keyExtractor={(v) => String(v)}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.preset} onPress={() => setTargetPost(item)}>
            <Text style={s.presetText}>
              +{Math.floor(item / 60000)}:{String(Math.floor(item / 1000) % 60).padStart(2, "0")}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Link href="/(tabs)/session" style={{ marginTop: 12, color: "#1e40af", fontWeight: "700" }}>
        Перейти к Session →
      </Link>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  sub: { opacity: 0.7, marginBottom: 16 },
  preset: {
    backgroundColor: "#eee",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  presetText: { fontSize: 18, fontWeight: "700" },
});
