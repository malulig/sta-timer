import { mmss } from "@/lib/format";
import { listLogs, LogItem } from "@/lib/logs";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Logs() {
  const [items, setItems] = useState<LogItem[]>([]);
  useEffect(() => {
    setItems(listLogs());
  }, []);
  return (
    <View style={s.c}>
      <Text style={s.t}>Журнал</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text>Цель: +{mmss(item.targetPost)}</Text>
            <Text>Контракции: {item.contractionAt ? new Date(item.contractionAt).toLocaleTimeString() : "—"}</Text>
            <Text>
              Общее: {mmss(item.elapsedTotal)} | После: {mmss(item.elapsedPost)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  t: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  card: { padding: 12, borderRadius: 12, backgroundColor: "#f3f3f3" },
  date: { fontWeight: "700", marginBottom: 4 },
});
