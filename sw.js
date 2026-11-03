// Service worker của HàBu Order (để cài web thành app trên điện thoại).
// Luôn lấy bản mới nhất từ mạng; chỉ khi mất mạng mới mở bản đã lưu lần trước.
// Nhờ vậy mỗi lần bạn tải index.html mới lên GitHub, khách vẫn thấy ngay bản mới.
const CACHE = 'habu-order-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Chỉ xử lý việc mở trang; ảnh, video, Google Sheets... để trình duyệt tự lo như bình thường
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req)
        .then(hit => hit || caches.match('./index.html'))
        .then(hit => hit || caches.match('./'))
        .then(hit => hit || Response.error()))
  );
});
