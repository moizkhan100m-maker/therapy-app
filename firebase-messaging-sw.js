const firebaseConfig = {
  apiKey: "AIzaSyAaqvSzj0ye06G1wVMf58LlfXe4mPYfYPA",
  authDomain: "therapyapp-7c635.firebaseapp.com",
  projectId: "therapyapp-7c635",
  storageBucket: "therapyapp-7c635.firebasestorage.app",
  messagingSenderId: "718396625415",
  appId: "1:718396625415:web:84c32f5df4cee6f0db50a2"
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

async function enableNotifications() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await messaging.getToken({
      vapidKey: "YOUR_VAPID_KEY"
    });

    console.log("DEVICE TOKEN:", token);
    alert("Notifications enabled!");
  } else {
    alert("Permission denied");
  }
}

enableNotifications();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(() => console.log("SW registered"));
}

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
