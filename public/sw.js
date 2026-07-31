/*
 * 우앤주전력 — 알림용 서비스워커
 *
 * 이 파일이 하는 일은 알림 하나뿐이다. fetch 핸들러를 두지 않으므로
 * 사이트의 네트워크 요청·캐시에는 전혀 관여하지 않는다(오프라인 캐싱으로
 * 오래된 화면이 남는 사고를 원천 차단한다).
 *
 *  1) push                    — 서버가 보낸 알림을 화면에 띄운다
 *  2) notificationclick       — 알림을 누르면 어드민 화면을 연다
 *  3) pushsubscriptionchange  — 브라우저가 구독을 갱신하면 서버에 다시 등록한다
 *
 * 경로가 /sw.js(루트)여야 사이트 전체 범위를 가진다. public/ 밖으로 옮기지 말 것.
 */

const ICON  = '/images/app-icon-512.png';
const BADGE = '/images/app-icon-512.png';

self.addEventListener('install', () => {
  // 새 버전을 즉시 활성화한다. 알림 문구를 고쳤는데 며칠 뒤에 반영되면 곤란하다.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  /*
   * 페이로드가 없거나 깨진 경우에도 알림은 반드시 띄운다.
   * 크롬·사파리는 푸시를 받고도 알림을 띄우지 않으면 "이 사이트가 백그라운드에서
   * 무언가 했다"는 경고를 사용자에게 보여주고, 반복되면 구독을 취소해 버린다.
   */
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = data.title || '우앤주전력';
  const options = {
    body: data.body || '사이트에 새로운 움직임이 있습니다.',
    icon: ICON,
    badge: BADGE,
    tag: data.tag || 'wnj-notify',
    // 같은 tag로 대체될 때도 소리·진동을 다시 울린다(안드로이드)
    renotify: Boolean(data.tag),
    // 견적문의 접수는 직접 닫기 전까지 남긴다. 나머지는 자동으로 사라져도 된다.
    requireInteraction: data.type === 'lead',
    vibrate: data.type === 'lead' ? [200, 100, 200, 100, 200] : [120, 60, 120],
    timestamp: Date.now(),
    data: { url: data.url || '/admin' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const target = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려 있는 창이 있으면 새 창을 띄우지 않고 그 창을 쓴다.
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client) client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});

/*
 * 브라우저가 구독을 스스로 폐기하고 새로 발급하는 경우가 있다.
 * 그대로 두면 알림이 조용히 끊기고, 사장님은 "알림이 안 온다"는 사실조차 모른다.
 * 새 구독을 만들어 서버의 기존 행을 갱신한다(oldEndpoint로 어느 기기인지 식별).
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const oldSub = event.oldSubscription || (await self.registration.pushManager.getSubscription());
        const oldEndpoint = oldSub ? oldSub.endpoint : null;

        let appServerKey = oldSub && oldSub.options ? oldSub.options.applicationServerKey : null;
        if (!appServerKey) {
          const res = await fetch('/api/push/key');
          const { publicKey } = await res.json();
          if (!publicKey) return;
          appServerKey = urlBase64ToUint8Array(publicKey);
        }

        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSub.toJSON(), oldEndpoint }),
        });
      } catch (e) {
        // 여기서 실패해도 할 수 있는 일이 없다. 어드민 화면을 열면 다시 등록된다.
      }
    })(),
  );
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = self.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}
