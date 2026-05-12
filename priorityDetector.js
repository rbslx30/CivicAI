// Severity and urgency detection system
const detectPriority = (text) => {
  if (!text) return 'Low';
  const lowerText = text.toLowerCase();
  
  const urgentWords = ['accident', 'emergency', 'fire', 'hospital', 'danger', 'death', 'murder', 'suicide', 'fatal', 'blast', 'blood', 'खतरा', 'आग', 'aphat', 'critical', 'contamination', 'outbreak', 'heart attack'];
  const highWords = ['bribe', 'corrupt', 'threat', 'harassment', 'leak', 'police', 'stolen', 'robbery', 'assault', 'dhokha'];
  const mediumWords = ['delay', 'pending', 'query', 'request', 'feedback', 'noise', 'awaz'];

  if (urgentWords.some(kw => lowerText.includes(kw))) return 'Urgent';
  if (highWords.some(kw => lowerText.includes(kw))) return 'High';
  if (mediumWords.some(kw => lowerText.includes(kw))) return 'Medium';

  return 'Low';
};

module.exports = { detectPriority };