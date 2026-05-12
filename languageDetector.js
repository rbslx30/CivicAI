// Scalable language detection logic
const detectLanguage = (text, userHint) => {
  if (!text) return 'English';

  // Trust explicit dropdown selection if provided
  if (userHint && userHint !== 'Auto' && userHint !== 'English') {
    return userHint;
  }

  // Simple Unicode block matching as a lightweight AI proxy for Indian Languages
  const unicodeRanges = [
    { regex: /[\u0900-\u097F]/, lang: 'Hindi / Marathi' },
    { regex: /[\u0980-\u09FF]/, lang: 'Bengali / Assamese' },
    { regex: /[\u0B00-\u0B7F]/, lang: 'Odia' },
    { regex: /[\u0C00-\u0C7F]/, lang: 'Telugu' },
    { regex: /[\u0C80-\u0CFF]/, lang: 'Kannada' },
    { regex: /[\u0D00-\u0D7F]/, lang: 'Malayalam' },
    { regex: /[\u0B80-\u0BFF]/, lang: 'Tamil' },
    { regex: /[\u0A80-\u0AFF]/, lang: 'Gujarati' },
    { regex: /[\u0A00-\u0A7F]/, lang: 'Punjabi' }
  ];

  for (let range of unicodeRanges) {
    if (range.regex.test(text)) return range.lang;
  }

  return 'English';
};

module.exports = { detectLanguage };