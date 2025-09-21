import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

export async function cue(_text?: string, haptics = true) {
  if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  const { sound } = await Audio.Sound.createAsync(require("@/assets/audio/beep.mp3"), { shouldPlay: true });
  setTimeout(() => sound.unloadAsync(), 1500);
}
