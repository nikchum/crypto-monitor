// utils/notifications.ts

// Загружаем аудиофайл, который должен быть в /public/alert.mp3
const notificationSound = typeof Audio !== "undefined" ? new Audio("/alert.mp3") : null;

export function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  // Запрос разрешения нужен только, если оно 'default' (не задано)
  if (Notification.permission === "default") {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("Разрешение на уведомления получено.");
        }
      })
      // Добавляем catch, если requestPermission вернет ошибку (маловероятно)
      .catch((e) => console.error("Ошибка при запросе разрешения:", e));
  }
}

export async function showDesktopNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  console.log(Notification.permission);

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      tag,
      icon: "/vercel.svg",
    });
  } else if (Notification.permission === "default" || Notification.permission === "denied") {
    Notification.requestPermission();
  }
}

export function playSoundAlert() {
  if (notificationSound) {
    notificationSound.pause();
    notificationSound.currentTime = 0;

    // 1. Сохраняем промис, возвращаемый методом play()
    const playPromise = notificationSound.play();

    if (playPromise !== undefined) {
      // 2. Используем .then() для обработки успешного запуска
      playPromise
        .then(() => {
          console.log("✅ Звуковое оповещение активно и успешно запущено.");
        })
        // 3. Используем .catch() для обработки ошибок, включая NotAllowedError
        .catch((e) => {
          // e — это ошибка, например, NotAllowedError
          console.warn("❌ Ошибка воспроизведения звука (Блокировка браузера):", e);
        });
    } else {
      // Это маловероятный сценарий для современных браузеров,
      // но полезно для покрытия старых реализаций.
      console.warn("Воспроизведение звука запущено, но без промиса.");
    }
  }
}
