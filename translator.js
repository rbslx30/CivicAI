// Server-side translation using Google Translate free-tier API
const translateToEnglish = async (text) => {
  if (!text || text === 'N/A') return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    
    if (typeof fetch === 'undefined') {
      console.warn('[AI] Fetch API missing (requires Node v18+). Skipping translation.');
      return text;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation API error');
    
    const data = await response.json();
    let translatedText = '';
    if (data && data[0]) {
      data[0].forEach(part => { if (part[0]) translatedText += part[0]; });
    }
    return translatedText || text;
  } catch (error) {
    console.warn('AI Translation Engine Fallback:', error.message);
    return text; // Graceful fallback to original text if offline
  }
};

module.exports = { translateToEnglish };