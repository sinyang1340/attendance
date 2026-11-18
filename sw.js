// 앱 화면 파일을 휴대폰에 저장해 두어 빨리 열리게 합니다.
// 출퇴근 기록(구글 서버로 보내는 요청)은 저장하지 않고 항상 인터넷으로 보냅니다.
// 인터넷이 될 때는 항상 새 파일을 받아 오므로, 화면을 고쳐 올리면 다음에 열 때 반영됩니다.
// 저장해 둔 파일 목록을 바꿨다면 아래 버전 이름을 바꿔 주세요.
const VERSION = "att-v2";
const FILES = ["./", "./index.html", "./config.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return; // 구글 서버 요청은 건드리지 않음
  // 화면 파일: 인터넷이 되면 새로 받고, 안 되면 저장해 둔 것을 씀
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
