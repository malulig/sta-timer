import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  color: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

function useStepper(onStep: (delta: number) => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(1);

  const start = (dir: 1 | -1) => {
    stop();
    speedRef.current = 1;
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const d = dir * Math.min(10, speedRef.current);
        onStep(d);
        speedRef.current += 1;
      }, 120);
    }, 1000);
  };

  const stop = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
    speedRef.current = 1;
  };

  useEffect(() => stop, []);
  return { start, stop };
}

export default function PhaseSecondsEditor({ label, color, value, onChange, min = 1, max = 600, step = 1 }: Props) {
  const [editing, setEditing] = useState(false);
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const change = (delta: number) => onChange(clamp(value + delta * step));

  const { start: startHold, stop: stopHold } = useStepper((d) => change(d));

  const toggleEditing = () => {
    setEditing((prev) => {
      if (prev) stopHold();
      return !prev;
    });
  };

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>

      {editing && (
        <Pressable style={styles.step} onPress={() => change(-1)} onPressIn={() => startHold(-1)} onPressOut={stopHold}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
      )}

      <Pressable onPress={toggleEditing} hitSlop={10}>
        <Text style={[styles.value, editing && styles.valueActive]}>{value}</Text>
      </Pressable>

      {editing && (
        <Pressable style={styles.step} onPress={() => change(1)} onPressIn={() => startHold(1)} onPressOut={stopHold}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 5, width: "50%" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { width: 140, fontSize: 16 },
  step: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 20, fontWeight: "700", color: "#212d48ff" },
  value: {
    minWidth: 54,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1044b3ff",
    backgroundColor: "#e0e7ff",
    paddingVertical: 10,
    borderRadius: 8,
  },
  valueActive: { backgroundColor: "#dbeafe" },
});
