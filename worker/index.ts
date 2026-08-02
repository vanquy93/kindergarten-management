/// <reference lib="webworker" />
export type {};
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'KinderCare', message: 'Bạn có thông báo mới' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: '/app-icon.jpg',
      badge: '/app-icon.jpg',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: { url: data.url || '/dashboard/messages' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
