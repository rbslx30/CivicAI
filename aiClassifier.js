const { detectLanguage } = require('./languageDetector');
const { translateToEnglish } = require('./translator');
const { classifyComplaint } = require('./aiClassification');

/**
 * AI Classification Engine Wrapper 
 * Orchestrates translation, language detection, and NLP classification.
 */
const runAIAnalysis = async (text) => {
  console.log("[AI] Starting Analysis Pipeline...");

  try {
    // 1. Language Detection
    console.log("[AI] Detecting Language...");
    const detectedLanguage = detectLanguage ? detectLanguage(text) : 'Auto';

    // 2. Translation
    console.log("[AI] Translating Complaint...");
    const translatedText = translateToEnglish ? await translateToEnglish(text) : text;

    // 3. Classification (Category, Department, Priority)
    console.log("[AI] Running Complaint Classification..."); // Log for classification start
    const { department, priority, confidence, reason } = classifyComplaint(translatedText);

    return {
      detectedLanguage,
      translatedText,
      category: department, // The department is the primary category for routing, aligning with the schema
      priority,
      department: department,
      sentiment: 'Neutral',
      confidenceScore: confidence,
      frustrationLevel: priority === 'Critical' ? 5 : (priority === 'High' ? 4 : (priority === 'Medium' ? 3 : 2)),
      fraudScore: 5,
      resolutionEstimate: priority === 'Critical' ? 'Immediate' : (priority === 'High' ? '24 Hours' : '3-5 Days'), // Dynamic resolution estimate
      aiAnalysis: { // Store the detailed AI analysis object
        detectedLanguage, translatedText, category: department, priority, department, sentiment: 'Neutral',
        confidenceScore: confidence, urgencyScore: 0, routingStatus: 'Auto-routed', recommendedAuthority: department,
        reason: reason // Consolidated reason string
      } 
    };
  } catch (error) {
    console.error("[AI] Pipeline Error:", error); // Log any errors during the AI pipeline
    
    // Graceful fallback to prevent grievance drop during API timeouts
    return {
      detectedLanguage: 'Auto',
      translatedText: text,
      category: 'Other / Miscellaneous',
      priority: 'Medium',
      department: 'General Administration',
      confidenceScore: 80, // Default confidence for fallback
      frustrationLevel: 2, // Default frustration level for fallback
      aiAnalysis: { // Fallback for aiAnalysis object
        detectedLanguage: 'Auto', translatedText: text, category: 'Other / Miscellaneous', priority: 'Medium',
        department: 'General Administration', confidenceScore: 80, urgencyScore: 0, routingStatus: 'Fallback',
        recommendedAuthority: 'General Administration', reason: "AI analysis failed. Defaulted to General Administration with Medium priority."
      }
    };
  }
};

module.exports = { runAIAnalysis };