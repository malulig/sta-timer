import BigTimer from "@/components/BigTimer";
import RoundButton from "@/components/ui/RoundButton";
import { useSessionStore } from "@/hooks/useSessionStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { mmss } from "@/lib/format";
import { insertLog } from "@/lib/logs";
import { cue } from "@/utils/audio";
import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useRef } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function Session() {
  useKeepAwake();

  const {
    running,
    start,
    pause,
    stop,
    markFirstContraction,
    elapsedTotal,
    elapsedPost,
    firstContractionAt,
    targetPost,
  } = useSessionStore();

  const { haptics, splitEveryMs } = useSettingsStore();
  const nextSplitRef = useRef<number>(splitEveryMs ?? 0);

  useEffect(() => {
    nextSplitRef.current = splitEveryMs ?? 0;
  }, [splitEveryMs]);

  useEffect(() => {
    if (!running || !firstContractionAt || !splitEveryMs) return;
    if (elapsedPost >= nextSplitRef.current) {
      cue("split", haptics);
      nextSplitRef.current += splitEveryMs;
    }
  }, [elapsedPost, running, firstContractionAt, splitEveryMs, haptics]);

  useEffect(() => {
    if (!running || !firstContractionAt) return;
    if (elapsedPost >= targetPost) {
      cue("goal", haptics);
      Alert.alert("Цель достигнута", "Можешь завершать когда удобно.");
    }
  }, [elapsedPost, targetPost, running, firstContractionAt, haptics]);

  const onStop = () => {
    const res = stop();
    insertLog({
      createdAt: Date.now(),
      targetPost,
      contractionAt: res.firstContractionAt ?? null,
      elapsedTotal: res.elapsedTotal,
      elapsedPost: res.elapsedPost,
      note: null,
    });
    Alert.alert("Сессия сохранена", `Общее: ${mmss(res.elapsedTotal)}\nПосле: ${mmss(res.elapsedPost)}`);
  };

  return (
    <View style={s.c}>
      <Text style={s.t}>Сессия</Text>
      <BigTimer label="Общее время" value={mmss(elapsedTotal)} />
      <BigTimer label="После контракций" value={mmss(elapsedPost)} />
      <Text style={s.target}>Цель: +{mmss(targetPost)}</Text>

      <View style={{ height: 16 }} />
      {!running ? <RoundButton title="Start" onPress={start} /> : <RoundButton title="Pause" onPress={pause} />}
      <View style={{ height: 10 }} />
      <RoundButton
        title="Первая контракция"
        onPress={markFirstContraction}
        disabled={!running || !!firstContractionAt}
      />
      <View style={{ height: 10 }} />
      <RoundButton title="Stop & Save" onPress={onStop} />
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  t: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  target: { textAlign: "center", opacity: 0.7, marginTop: 8 },
});
