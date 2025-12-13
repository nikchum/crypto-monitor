// utils/notifications.ts

// Загружаем аудиофайл, который должен быть в /public/alert.mp3
const notificationSound = typeof Audio !== "undefined" ? new Audio("/alert.mp3") : null;

export async function showDesktopNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      tag,
      icon: "/vercel.svg",
    });
  } else if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function playSoundAlert() {
  if (notificationSound) {
    notificationSound.pause();
    notificationSound.currentTime = 0;
    notificationSound.play().catch((e) => console.warn("Ошибка воспроизведения звука:", e));
  }
}
