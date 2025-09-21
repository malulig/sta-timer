import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function RoundButton({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[s.btn, disabled && { opacity: 0.5 }]}>
      <Text style={s.txt}>{title}</Text>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  btn: { backgroundColor: "#222", paddingVertical: 16, paddingHorizontal: 24, borderRadius: 32, alignItems: "center" },
  txt: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
