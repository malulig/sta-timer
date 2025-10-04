import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

/* импорт крутилок */
import PhaseSecondsEditor from "../../components/inputs/PhaseSecondsEditor";
import TimeWheel from "../../components/inputs/TimeWheel";

/* фазы и метаданные */
type PhaseKey = "inhale" | "hold1" | "exhale" | "hold2";
type PhaseDurations = Record<PhaseKey, number>;
const PHASE_META: Record<PhaseKey, { label: string; color: string }> = {
  inhale: { label: "Вдох", color: "#22c55e" },
  hold1: { label: "Задержка", color: "#eab308" },
  exhale: { label: "Выдох", color: "#38bdf8" },
  hold2: { label: "Задержка (на выдохе)", color: "#fca5a5" },
};
const ORDER: PhaseKey[] = ["inhale", "hold1", "exhale", "hold2"];
const DEFAULT_DURATIONS: PhaseDurations = { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function secondsToMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return { m, s };
}

export default function Square() {
  const router = useRouter();

  const size = 260;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [durations, setDurations] = useState<PhaseDurations>(DEFAULT_DURATIONS);
  const [sessionTotal, setSessionTotal] = useState<number>(300);
  const [sessionLeft, setSessionLeft] = useState<number>(sessionTotal);

  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const phaseKey = ORDER[phaseIndex] ?? "inhale";
  const meta = PHASE_META[phaseKey] ?? PHASE_META.inhale;

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [remainingPhase, setRemainingPhase] = useState<number>(durations[phaseKey]);
  const progress = useSharedValue(0);
  const pausedAtProgress = useRef<number>(0);
  const advancingRef = useRef(false);
  const currentColor = meta.color;

  const startPhase = useCallback(
    (durationSec: number) => {
      cancelAnimation(progress);
      progress.value = 0;
      pausedAtProgress.current = 0;
      advancingRef.current = false;

      const durMs = Math.max(1, Math.round(durationSec * 1000));
      progress.value = withTiming(1, { duration: durMs, easing: Easing.linear }, (finished) => {
        if (finished) runOnJS(onPhaseMaybeComplete)("timing");
      });
    },
    [progress]
  );

  const onPhaseMaybeComplete = useCallback(
    (source: "timing" | "poll") => {
      if (advancingRef.current) return;
      if (!isRunning) return;

      if (sessionLeft <= 0.0001) {
        advancingRef.current = true;
        setIsRunning(false);
        setIsPaused(false);
        cancelAnimation(progress);
        progress.value = 0;
        return;
      }

      advancingRef.current = true;
      setPhaseIndex((idx) => (idx + 1) % ORDER.length);
    },
    [isRunning, sessionLeft, progress]
  );

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      const remainPhase = Math.max(0, durations[phaseKey] * (1 - progress.value));
      setRemainingPhase(Math.max(0, Math.ceil(remainPhase)));
      setSessionLeft((prev) => Math.max(0, +(prev - 0.1).toFixed(1)));
      if (progress.value >= 0.999) onPhaseMaybeComplete("poll");
    }, 100);
    return () => clearInterval(id);
  }, [isRunning, isPaused, phaseKey, durations, progress, onPhaseMaybeComplete]);

  useEffect(() => {
    const phaseDur = durations[phaseKey];
    const nextDur = Math.min(phaseDur, sessionLeft);
    setRemainingPhase(nextDur);
    if (isRunning && !isPaused && sessionLeft > 0) startPhase(nextDur);
    else {
      cancelAnimation(progress);
      progress.value = 0;
      pausedAtProgress.current = 0;
    }
  }, [phaseKey]);

  const handleStart = useCallback(() => {
    setSessionLeft(sessionTotal);
    setPhaseIndex(0);
    setIsPaused(false);
    setIsRunning(true);
    const firstDur = Math.min(durations[ORDER[0]], sessionTotal);
    startPhase(firstDur);
  }, [durations, sessionTotal, startPhase]);

  const handlePause = useCallback(() => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    pausedAtProgress.current = progress.value;
    cancelAnimation(progress);
  }, [isRunning, isPaused, progress]);

  const handleResume = useCallback(() => {
    if (!isRunning || !isPaused || sessionLeft <= 0) return;
    setIsPaused(false);
    const remainingFrac = 1 - pausedAtProgress.current;
    const planned = durations[phaseKey] * remainingFrac;
    const durMs = Math.max(1, Math.round(Math.min(planned, sessionLeft) * 1000));
    advancingRef.current = false;
    progress.value = withTiming(1, { duration: durMs, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(onPhaseMaybeComplete)("timing");
    });
  }, [isRunning, isPaused, durations, phaseKey, sessionLeft, progress, onPhaseMaybeComplete]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    cancelAnimation(progress);
    progress.value = 0;
    pausedAtProgress.current = 0;
    advancingRef.current = false;
  }, [progress]);

  const handleResetIdle = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    pausedAtProgress.current = 0;
    advancingRef.current = false;

    setIsRunning(false);
    setIsPaused(false);

    setSessionLeft(sessionTotal); // секундомер сессии -> начало
    setPhaseIndex(0); // вернуться на первую фазу (Вдох)
    setRemainingPhase(durations.inhale); // время внутри круга -> длительность вдоха
  }, [sessionTotal, durations, progress]);

  const animatedProps = useAnimatedProps(() => {
    const dashoffset = circumference * (1 - progress.value);
    return { strokeDashoffset: dashoffset } as any;
  }, [circumference]);

  const onChangeSession = useCallback(
    (nextSeconds: number) => {
      setSessionTotal(nextSeconds);
      setSessionLeft(nextSeconds);
      if (isRunning) handleStop();
    },
    [isRunning, handleStop]
  );

  const onChangePhase = useCallback(
    (key: PhaseKey, nextSeconds: number) => {
      setDurations((prev) => ({ ...prev, [key]: nextSeconds }));
      if (key === phaseKey) setRemainingPhase(Math.min(nextSeconds, sessionLeft));
    },
    [phaseKey, sessionLeft]
  );

  const totalPhaseSeconds = durations.inhale + durations.hold1 + durations.exhale + durations.hold2;
  const phaseNumber = ORDER.indexOf(phaseKey) + 1 || 1;
  const sessionMMSS = secondsToMMSS(sessionLeft);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")} style={styles.backBtn}>
          <Text style={{ fontSize: 16 }}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Квадратное дыхание</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.circleWrapper}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={currentColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation={-90}
              originX={size / 2}
              originY={size / 2}
            />
          </Svg>
          <View style={styles.centerLabelWrapper}>
            <Text style={[styles.phaseName, { color: currentColor }]}>{meta.label}</Text>
            <Text style={styles.timeLeft}>
              {String(Math.floor(remainingPhase / 60)).padStart(2, "0")}:{String(remainingPhase % 60).padStart(2, "0")}
            </Text>
            <Text style={styles.subtle}>
              {phaseNumber}/4 • фазы {Math.floor(totalPhaseSeconds / 60)}м {totalPhaseSeconds % 60}с
            </Text>
            <Text style={styles.subtle}>
              сессия {String(sessionMMSS.m).padStart(2, "0")}:{String(Math.round(sessionMMSS.s)).padStart(2, "0")}
            </Text>
          </View>
        </View>

        <View style={styles.inputs}>
          <PhaseSecondsEditor
            label="Вдох"
            color={PHASE_META.inhale.color}
            value={durations.inhale}
            onChange={(v) => onChangePhase("inhale", v)}
          />
          <PhaseSecondsEditor
            label="Задержка"
            color={PHASE_META.hold1.color}
            value={durations.hold1}
            onChange={(v) => onChangePhase("hold1", v)}
          />
          <PhaseSecondsEditor
            label="Выдох"
            color={PHASE_META.exhale.color}
            value={durations.exhale}
            onChange={(v) => onChangePhase("exhale", v)}
          />
          <PhaseSecondsEditor
            label="Задержка (выдох)"
            color={PHASE_META.hold2.color}
            value={durations.hold2}
            onChange={(v) => onChangePhase("hold2", v)}
          />
        </View>

        <View style={styles.inputs}>
          <TimeWheel valueSeconds={sessionTotal} onChange={onChangeSession} label="Сессия всего" />
        </View>

        <View style={styles.controls}>
          {!isRunning && (
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleStart}>
              <Text style={styles.btnText}>Старт</Text>
            </Pressable>
          )}
          {isRunning && !isPaused && (
            <Pressable style={[styles.btn, styles.btnWarn]} onPress={handlePause}>
              <Text style={styles.btnText}>Пауза</Text>
            </Pressable>
          )}
          {isRunning && isPaused && (
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleResume}>
              <Text style={styles.btnText}>Продолжить</Text>
            </Pressable>
          )}

          {/* СВИТЧ: Стоп ↔ Сброс */}
          {isRunning ? (
            <Pressable style={[styles.btn, styles.btnDanger]} onPress={handleStop}>
              <Text style={styles.btnText}>Стоп</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={handleResetIdle}>
              <Text style={[styles.btnText, styles.btnGhostText]}>Сброс</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 8, borderRadius: 8, backgroundColor: "#f3f4f6" },
  headerTitle: { marginLeft: 12, fontSize: 18, fontWeight: "600" },
  container: { flex: 1, alignItems: "center", padding: 16, gap: 16 },
  circleWrapper: { width: "100%", alignItems: "center", justifyContent: "center", marginTop: 8 },
  centerLabelWrapper: { position: "absolute", alignItems: "center" },
  phaseName: { fontSize: 18, fontWeight: "700" },
  timeLeft: { fontSize: 28, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  subtle: { fontSize: 12, color: "#6b7280", marginTop: 2, textAlign: "center" },
  inputs: { width: "100%", gap: 10 },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 12 },
  btn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  btnText: { fontWeight: "700", color: "white" },
  btnPrimary: { backgroundColor: "#0ea5e9" },
  btnWarn: { backgroundColor: "#f7c673ff" },
  btnDanger: { backgroundColor: "#ef4444" },
  btnGhost: { backgroundColor: "#f7c673ff" },
  btnGhostText: { color: "#111827" },
  legend: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { fontSize: 14 },
  colorDotLg: { width: 14, height: 14, borderRadius: 7 },
});
