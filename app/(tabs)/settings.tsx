import { useSessionStore } from "@/hooks/useSessionStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

export default function Settings() {
  const { haptics, splitEveryMs, toggleHaptics, setSplitEvery } = useSettingsStore();
  const { targetPost, setTargetPost } = useSessionStore();
  const [target, setTarget] = useState(Math.floor(targetPost / 1000).toString());
  const [split, setSplit] = useState(splitEveryMs ? Math.floor(splitEveryMs / 1000).toString() : "");

  return (
    <View style={s.c}>
      <Text style={s.t}>Настройки</Text>

      <View style={s.row}>
        <Text>Вибро</Text>
        <Switch value={haptics} onValueChange={toggleHaptics} />
      </View>

      <View style={s.block}>
        <Text style={s.label}>Цель после контракций (сек)</Text>
        <TextInput
          value={target}
          onChangeText={setTarget}
          keyboardType="number-pad"
          style={s.input}
          onBlur={() => setTargetPost(Math.max(0, parseInt(target || "0", 10) * 1000))}
        />
      </View>

      <View style={s.block}>
        <Text style={s.label}>Сплит каждые (сек), пусто = выкл</Text>
        <TextInput
          value={split}
          onChangeText={setSplit}
          keyboardType="number-pad"
          style={s.input}
          onBlur={() => {
            const v = split.trim() === "" ? null : Math.max(0, parseInt(split || "0", 10) * 1000);
            setSplitEvery(v);
          }}
        />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  t: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  block: { marginTop: 16 },
  label: { marginBottom: 8, opacity: 0.7 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16 },
});
