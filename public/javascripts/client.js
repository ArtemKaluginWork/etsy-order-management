/* eslint-disable */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator) {
  run().catch(error => console.error(error));
}

async function run() {
  try {
    const { publicKey } = await fetch('webpush/subscribe', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    }).then(resp => resp.json());
    const registration = await navigator.serviceWorker
      .register('/javascripts/worker.js');
    const subscription = await registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    await fetch('webpush/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (e) {
    console.log(e.message);
  }
}
