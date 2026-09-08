self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/community";
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if ("focus" in client) {
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              client.postMessage({ url: targetUrl });
            }
          } else {
            client.postMessage({ url: targetUrl });
          }
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })(),
  );
});
