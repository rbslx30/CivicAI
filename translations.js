/* ============================================
   AI GRIEVANCE SYSTEM — translations.js
   Dynamic Multilingual Integration via Google Translate
   ============================================ */

(function() {
  'use strict';

  // 1. Inject Google Translate Container
  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  gtDiv.style.display = 'none';
  document.body.appendChild(gtDiv);

  // 2. Setup Initialization Callback
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      // Supports all the Indian languages found in your native UI dropdown
      includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,sa,kok,mai,ne,doi,ks,sat',
      autoDisplay: false
    }, 'google_translate_element');
  };

  // 3. Inject Google Translate Script dynamically
  const gtScript = document.createElement('script');
  gtScript.type = 'text/javascript';
  gtScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(gtScript);

  // 4. Inject CSS to completely hide default Google Translate UI elements and tooltips
  const style = document.createElement('style');
  style.innerHTML = `
    /* Hide the Google Translate top banner pushing the page down */
    body { top: 0 !important; position: static !important; }
    .skiptranslate > iframe.skiptranslate { display: none !important; visibility: hidden !important; }
    
    /* Hide the native Google Translate widget */
    #google_translate_element { display: none !important; }
    
    /* Hide the tooltip that appears on hover over translated text */
    .goog-tooltip { display: none !important; }
    .goog-tooltip:hover { display: none !important; }
    
    /* Remove yellow background highlight from translated strings */
    .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
  `;
  document.head.appendChild(style);

  // 5. Intercept and Sync Custom Dropdown directly with the invisible Google Translate Select
  document.addEventListener('DOMContentLoaded', () => {
    const selectors = document.querySelectorAll('.lang-selector');

    // Look up what language the user last chose directly from Google's cookie
    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
      return null;
    }

    const savedLang = getCookie('googtrans');
    if (savedLang) {
      // Google's cookie format is typically '/en/hi'
      const langCode = decodeURIComponent(savedLang).split('/').pop();
      selectors.forEach(select => {
        if (select.querySelector('option[value="' + langCode + '"]')) {
          select.value = langCode;
          
          // Synchronize with the grievance form's "Preferred Language" dropdown
          const formLang = document.getElementById('language');
          if (formLang) {
            const langMap = { 'en':'English', 'hi':'Hindi', 'bn':'Bengali', 'te':'Telugu', 'mr':'Marathi', 'ta':'Tamil', 'ur':'Urdu', 'gu':'Gujarati', 'kn':'Kannada', 'ml':'Malayalam', 'pa':'Punjabi' };
            if (langMap[langCode]) formLang.value = langMap[langCode];
          }
        }
      });
    }

    selectors.forEach(select => {
      select.addEventListener('change', (e) => {
        const lang = e.target.value;
        
        const triggerTranslate = () => {
          const googleSelect = document.querySelector('.goog-te-combo');
          if (googleSelect) {
            googleSelect.value = lang;
            // Dispatch event so Google Translate recognizes the programmatic DOM change
            googleSelect.dispatchEvent(new Event('change'));
          } else {
            // Retry briefly if the script hasn't fully appended the widget yet
            setTimeout(triggerTranslate, 200);
          }
        };
        
        triggerTranslate();
        
        // Sync all other custom dropdowns that might exist on the page
        selectors.forEach(s => {
          if (s !== select) s.value = lang;
        });
        
        // Synchronize with the grievance form's "Preferred Language" dropdown
        const formLang = document.getElementById('language');
        if (formLang) {
          const langMap = { 'en':'English', 'hi':'Hindi', 'bn':'Bengali', 'te':'Telugu', 'mr':'Marathi', 'ta':'Tamil', 'ur':'Urdu', 'gu':'Gujarati', 'kn':'Kannada', 'ml':'Malayalam', 'pa':'Punjabi' };
          if (langMap[lang]) formLang.value = langMap[lang];
        }
      });
    });
  });

  // Provide a safe fallback function just in case any leftover script from earlier attempts tries to call this
  window.applyTranslations = function() {
    // Safely ignored — handled fully by Google Translate API
  };
})();