import { StyleSheet, Text, View } from "react-native";

export default function BigTimer({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { alignItems: "center", marginVertical: 8 },
  label: { opacity: 0.7, fontSize: 14 },
  value: { fontSize: 48, fontWeight: "800", letterSpacing: 2 },
});
