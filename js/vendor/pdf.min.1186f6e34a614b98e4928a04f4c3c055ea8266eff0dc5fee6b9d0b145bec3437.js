(function() {
  if (typeof window === 'undefined') {
    return;
  }

  var CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var cdnScriptUrl = CDN_BASE + 'pdf.min.js';
  var cdnWorkerUrl = CDN_BASE + 'pdf.worker.min.js';

  if (!window.__pdfjsCdnWorkerUrl) {
    window.__pdfjsCdnWorkerUrl = cdnWorkerUrl;
  }

  if (window.__pdfjsCdnPromise && typeof window.__pdfjsCdnPromise.then === 'function') {
    return;
  }

  window.__pdfjsCdnPromise = new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.src = cdnScriptUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
      } else {
        resolve(null);
      }
    };
    script.onerror = function() {
      reject(new Error('Failed to load PDF.js from CDN'));
    };
    document.head.appendChild(script);
  });
})();
