/* eslint-disable */
console.log('Loaded service worker!');

self.addEventListener('push', (ev) => {
  const { title, body } = ev.data.json();
  console.log('Got push', title, body);
  self.registration.showNotification(title, {
    body,
  });
});
