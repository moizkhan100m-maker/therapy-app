// Service Worker — My Daily Portal
const DB = 'wportal_v4';
const CHECK_INTERVAL = 60000; // 1 min

function getStore() {
  return new Promise(resolve => {
    // SW can't access localStorage directly — data passed via postMessage
    resolve(self._scheduleData || {});
  });
}

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

// Receive schedule data from main page
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    self._scheduleData = e.data.payload;
  }
  if (e.data?.type === 'PING') {
    checkAndNotify();
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});

function pad(n) { return String(n).padStart(2, '0'); }
function nowTime() {
  const n = new Date();
  return `${pad(n.getHours())}:${pad(n.getMinutes())}`;
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

async function fireNotif(title, body, tag) {
  const opts = {
    body,
    tag: tag || 'portal-notif',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="%231B9470"/><text x="50%" y="55%" text-anchor="middle" font-size="32" fill="white">🌿</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="%231B9470"/></svg>',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
  };
  return self.registration.showNotification(title, opts);
}

function checkAndNotify() {
  const data = self._scheduleData;
  if (!data) return;
  const nt = nowTime();
  const tk = todayKey();
  const dow = new Date().getDay();
  const fired = data.fired || {};

  // Custom reminders
  (data.notifications || []).forEach((n, i) => {
    if (!n.enabled) return;
    if (n.days?.length && !n.days.includes(dow)) return;
    const key = `notif_${n.id}_${tk}`;
    if (n.time === nt && !fired[key]) {
      fireNotif('📅 Daily Portal', n.label, key);
      fired[key] = true;
    }
  });

  // Affirmation
  if (data.affTime && data.affTime === nt) {
    const key = `aff_${tk}`;
    if (!fired[key]) {
      const affs = data.affs || [];
      const idx = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000) % affs.length;
      fireNotif('✨ Today\'s affirmation', affs[idx] || 'You are doing great. Keep going.', key);
      fired[key] = true;
    }
  }

  // Doom scroll start
  if (data.doomStart && data.doomStart === nt) {
    const key = `doom_s_${tk}`;
    if (!fired[key]) {
      fireNotif('🌀 Scroll window open', 'Your allowed scrolling window has started. Enjoy mindfully.', key);
      fired[key] = true;
    }
  }

  // Doom scroll end
  if (data.doomEnd && data.doomEnd === nt) {
    const key = `doom_e_${tk}`;
    if (!fired[key]) {
      fireNotif('✅ Scroll window closed', "Time's up. Put the phone down — you set this for a reason.", key);
      fired[key] = true;
    }
  }

  self._scheduleData = { ...data, fired };
}

// Periodic sync (if browser supports it)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'portal-check') e.waitUntil(checkAndNotify());
});

// Push (for future server integration)
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(fireNotif(data.title || 'My Portal', data.body || '', 'push'));
});
