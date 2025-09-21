import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen name="(tabs)/index" options={{ title: "Home" }} />
      <Tabs.Screen name="(tabs)/session" options={{ title: "Session" }} />
      <Tabs.Screen name="(tabs)/logs" options={{ title: "Logs" }} />
      <Tabs.Screen name="(tabs)/settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
