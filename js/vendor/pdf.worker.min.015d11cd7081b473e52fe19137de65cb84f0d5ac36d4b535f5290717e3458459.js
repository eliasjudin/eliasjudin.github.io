(function() {
  if (typeof importScripts !== 'function') {
    return;
  }

  var CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var workerUrl = CDN_BASE + 'pdf.worker.min.js';

  if (typeof self !== 'undefined' && !self.__pdfjsCdnWorkerUrl) {
    self.__pdfjsCdnWorkerUrl = workerUrl;
  }

  try {
    importScripts(workerUrl);
  } catch (error) {
    // Swallow import errors so the main thread can surface a user-friendly message.
  }
})();
