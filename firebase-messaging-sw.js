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
messaging.onBackgroundMessage((payload) => {
  const titulo = (payload.notification && payload.notification.title) || 'El Centro';
  const texto = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(titulo, {
    body: texto,
    icon: 'icon-192.png',
    tag: 'el-centro'
  });
  try{
    if(self.setAppBadge) self.setAppBadge(1);
  }catch(e){}
});
