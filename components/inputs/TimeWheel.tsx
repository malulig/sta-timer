import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  valueSeconds: number;
  onChange: (nextSeconds: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
};

function useStepper(onStep: (delta: number) => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(1);

  const start = (dir: 1 | -1) => {
    onStep(dir);
    speedRef.current = 1;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const d = dir * Math.min(10, speedRef.current);
      onStep(d);
      speedRef.current += 1;
    }, 120);
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    speedRef.current = 1;
  };

  useEffect(() => stop, []);
  return { start, stop };
}

export default function TimeWheel({
  valueSeconds,
  onChange,
  min = 0,
  max = 59 * 60 + 59,
  step = 1,
  label = "Сессия всего",
}: Props) {
  const [editing, setEditing] = useState<boolean>(false); // по умолчанию ВЫКЛЮЧЕН

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const mm = Math.floor(valueSeconds / 60);
  const ss = valueSeconds % 60;

  const change = (delta: number) => onChange(clamp(valueSeconds + delta * step));

  const { start: startMinusM, stop: stopMinusM } = useStepper((d) => change(-60 * d));
  const { start: startPlusM, stop: stopPlusM } = useStepper((d) => change(60 * d));
  const { start: startMinusS, stop: stopMinusS } = useStepper((d) => change(-1 * d));
  const { start: startPlusS, stop: stopPlusS } = useStepper((d) => change(1 * d));

  const stopAllHolds = () => {
    stopMinusM();
    stopPlusM();
    stopMinusS();
    stopPlusS();
  };

  const toggleEditing = () => {
    setEditing((prev) => {
      const next = !prev;
      if (!next) stopAllHolds();
      return next;
    });
  };

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: "#111827" }]} />
      <Text style={styles.label}>{label}</Text>

      <View style={styles.wheelGroup}>
        {editing && (
          <Pressable
            style={styles.step}
            onPress={() => change(-60)}
            onPressIn={() => startMinusM(-1)}
            onPressOut={stopMinusM}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
        )}

        <Pressable onPress={toggleEditing} hitSlop={12}>
          <Text style={[styles.value, editing && styles.valueActive]}>{String(mm).padStart(2, "0")}</Text>
        </Pressable>

        {editing && (
          <Pressable
            style={styles.step}
            onPress={() => change(60)}
            onPressIn={() => startPlusM(1)}
            onPressOut={stopPlusM}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.colon}>:</Text>

      <View style={styles.wheelGroup}>
        {editing && (
          <Pressable
            style={styles.step}
            onPress={() => change(-1)}
            onPressIn={() => startMinusS(-1)}
            onPressOut={stopMinusS}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
        )}

        <Pressable onPress={toggleEditing} hitSlop={12}>
          <Text style={[styles.value, editing && styles.valueActive]}>{String(ss).padStart(2, "0")}</Text>
        </Pressable>

        {editing && (
          <Pressable
            style={styles.step}
            onPress={() => change(1)}
            onPressIn={() => startPlusS(1)}
            onPressOut={stopPlusS}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 5, width: "100%" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { width: 140, fontSize: 16 },
  wheelGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  step: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 18, fontWeight: "700", color: "#111827" },
  value: {
    minWidth: 54,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1044b3ff",
    backgroundColor: "#e0e7ff",
    paddingVertical: 10,
    paddingHorizontal: 2,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  valueActive: {
    backgroundColor: "#dbeafe",
  },
  colon: { fontSize: 18, fontWeight: "700" },
});
