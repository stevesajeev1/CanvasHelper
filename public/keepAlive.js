setInterval(async () => {
    (await navigator.serviceWorker.ready).active.postMessage('keepAlive');
}, 60 * 1000);