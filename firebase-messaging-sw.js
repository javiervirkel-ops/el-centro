importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAaPjMnW3vUhRpXczijB9HacKWyqtyUeS8",
  authDomain: "mykonos-pibes---el-centro.firebaseapp.com",
  databaseURL: "https://mykonos-pibes---el-centro-default-rtdb.firebaseio.com",
  projectId: "mykonos-pibes---el-centro",
  storageBucket: "mykonos-pibes---el-centro.firebasestorage.app",
  messagingSenderId: "321874389654",
  appId: "1:321874389654:web:d44c90dabbbab5adb570b7"
});

const messaging = firebase.messaging();

// Se dispara cuando llega una notificación y la app está cerrada o en segundo plano
// El mensaje viene solo con "data" (sin "notification") para tener una unica via de aviso, sin duplicados.
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const titulo = d.titulo || 'El Centro';
  const texto = d.texto || '';
  self.registration.showNotification(titulo, {
    body: texto,
    icon: 'icon-192.png',
    tag: 'el-centro'
  });
  try{
    if(self.setAppBadge) self.setAppBadge(1);
  }catch(e){}
});

// Al tocar la notificacion: si la app ya esta abierta en una pestana, la enfoca.
// Si no, abre una nueva (el root siempre arranca en el feed/Inicio).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
