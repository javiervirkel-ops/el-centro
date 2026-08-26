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
    tag: 'el-centro',
    data: { postId: d.postId || '', destino: d.destino || '' }
  });
  try{
    if(self.setAppBadge) self.setAppBadge(1);
  }catch(e){}
});

// Al tocar la notificacion: si la app ya esta abierta en una pestana, la enfoca y le avisa
// (por postMessage) que abra el post puntual o el chat. Si no esta abierta, abre una nueva
// con el destino en la URL, y la app misma lo interpreta al arrancar (ver postIdDesdeNotificacion
// y chatDesdeNotificacion).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const postId = (event.notification.data && event.notification.data.postId) || '';
  const destino = (event.notification.data && event.notification.data.destino) || '';
  const esChat = destino === 'chat';
  const targetUrl = esChat ? '/?chat=1' : (postId ? ('/?post=' + encodeURIComponent(postId)) : '/');
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (esChat) client.postMessage({ type: 'abrirChat' });
          else if (postId) client.postMessage({ type: 'abrirPost', postId });
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
