'use strict';

(() => {
  const host = String(window.location.hostname || '').toLowerCase();
  const localPreview = host === 'localhost'
    || host === '127.0.0.1'
    || host === '::1'
    || host === '[::1]'
    || /(^|\.)monkeycode-ai\.live$/.test(host);

  window.KOS_CONFIG = {
    gasBridgeUrl: localPreview ? '' : 'https://script.google.com/macros/s/AKfycbyqxmkMpqAp2ZvTROe2BQbL0rC5bYt_OtYkaeTSVYZN8hkrBqkAzntXJBpIUDslw-cbng/exec'
  };
})();
