self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

// Push reminders sent by /api/cron/reminders through Firebase Cloud Messaging.
// FCM wraps data-only messages as { data: {...}, from, ... }.
self.addEventListener('push', (e) => {
  let payload = {};
  try { payload = e.data ? e.data.json() : {}; } catch { payload = {}; }
  const d = payload.data || payload.notification || payload;
  e.waitUntil(
    self.registration.showNotification(d.title || 'The Daily Singer', {
      body: d.body || '',
      tag: d.tag || 'daily-singer',
      icon: '/icon.png',
      badge: '/icon.png',
      data: { url: d.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const c of clientList) {
        if ('focus' in c) {
          if ('navigate' in c) c.navigate(url);
          return c.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
