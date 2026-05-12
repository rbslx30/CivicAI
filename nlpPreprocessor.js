// Advanced NLP Preprocessing Pipeline (Preparation for BERT/IndicBERT)
const preprocessText = (text) => {
  if (!text) return [];
  
  // 1. Text Normalization (lowercase, remove special punctuation but keep regional unicode characters)
  const normalized = text.toLowerCase().replace(/[^\w\s\u0900-\u0D7F]/g, ' ');
  
  // 2. Tokenization
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1);
  
  // 3. Stop-word filtering (Basic English/Hindi mock array for structural readiness)
  const stopWords = new Set(['is','the','and','to','a','in','it','of','for','hai','ki','aur','se','ko']);
  const cleanTokens = tokens.filter(t => !stopWords.has(t));
  
  return cleanTokens;
};

module.exports = { preprocessText };