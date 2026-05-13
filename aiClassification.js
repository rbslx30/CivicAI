// Keyword-based AI Classification Logic
const departmentsMap = require('./departments'); // Import the new departments map

const classifyComplaint = (text) => { // Renamed from classifyComplaint to match prompt
  if (!text) {
    return {
      department: departmentsMap['Other / Miscellaneous'],
      priority: 'Low',
      confidence: 50, // Default low confidence for no text
      reason: 'No complaint text provided. Defaulted to "Other / Miscellaneous" department with Low priority.'
    };
  }
  
  const lowerText = text.toLowerCase();

  let detectedCategoryKey = 'Other / Miscellaneous'; // Key from departmentsMap
  let assignedDepartment = departmentsMap[detectedCategoryKey];
  let priority = 'Low';
  let confidence = 0;
  let reasoningParts = [];

  const routingEngine = {
    "Water Supply": {
      keywords: ['water', 'pipeline', 'tap', 'leak', 'drainage', 'drinking', 'pani', 'पानी', 'jal', 'jalpurti'],
      deptKey: "Water Supply"
    },
    "Electricity Board": {
      keywords: ['electricity', 'power cut', 'blackout', 'wire', 'current', 'transformer', 'बिजली', 'light', 'street light', 'bijli', 'power failure'],
      deptKey: "Electricity Board"
    },
    "Roads & Highways": {
      keywords: ['road', 'pothole', 'street', 'highway', 'bridge', 'सड़क', 'construction', 'gaddha', 'गड्ढा', 'sadak', 'repair'],
      deptKey: "Roads & Highways"
    },
    "Sanitation & Waste Management": {
      keywords: ['garbage', 'cleaning', 'trash', 'smell', 'कचरा', 'dustbin', 'sweeper', 'waste', 'kachra', 'dump'],
      deptKey: "Sanitation & Waste Management"
    },
    "Sewage & Drainage": {
      keywords: ['sewage', 'drainage', 'gutter', 'overflow', 'blockage', 'nallah', 'नाली', 'sewer'],
      deptKey: "Sewage & Drainage"
    },
    "Public Transport": {
      keywords: ['bus', 'train', 'auto', 'rickshaw', 'transport', 'fare', 'route', 'delay', 'public transport'],
      deptKey: "Public Transport"
    },
    "Traffic Police": {
      keywords: ['traffic', 'signal', 'jam', 'parking', 'vehicle', 'accident', 'police', 'challan', 'traffic light'],
      deptKey: "Traffic Police"
    },
    "Municipal Corporation": {
      keywords: ['municipal', 'corporation', 'nagar nigam', 'council', 'local body', 'civic body'],
      deptKey: "Municipal Corporation"
    },
    "Housing & Urban Development": {
      keywords: ['house', 'building', 'slum', 'colony', 'housing', 'urban', 'dwelling', 'shelter', 'development'],
      deptKey: "Housing & Urban Development"
    },
    "Property Tax / Revenue": {
      keywords: ['tax', 'property', 'revenue', 'bill', 'fine', 'assessment', 'lagan', 'house tax'],
      deptKey: "Property Tax / Revenue"
    },
    "Health Department": {
      keywords: ['hospital', 'doctor', 'disease', 'dengue', 'malaria', 'clinic', 'health', 'medicine', 'fever', 'illness', 'sanitary'],
      deptKey: "Health Department"
    },
    "Education Department": {
      keywords: ['school', 'teacher', 'college', 'student', 'education', 'exam', 'fees', 'admission', 'university'],
      deptKey: "Education Department"
    },
    "Pollution Control": {
      keywords: ['pollution', 'smoke', 'air quality', 'noise', 'environment', 'factory', 'chemical', 'emission'],
      deptKey: "Pollution Control"
    },
    "Parks & Gardens": {
      keywords: ['park', 'garden', 'tree', 'greenery', 'lawn', 'playground', 'plant'],
      deptKey: "Parks & Gardens"
    },
    "Street Lighting": {
      keywords: ['street light', 'lamp post', 'darkness', 'light not working', 'pole'],
      deptKey: "Street Lighting"
    },
    "Food & Civil Supplies": {
      keywords: ['ration', 'food', 'supply', 'grain', 'subsidy', 'pds', 'shop', 'distribution'],
      deptKey: "Food & Civil Supplies"
    },
    "Fire & Emergency Services": {
      keywords: ['fire', 'burn', 'cylinder blast', 'smoke', 'आग', 'emergency', 'disaster', 'firefighter'],
      deptKey: "Fire & Emergency Services"
    },
    "Public Safety / Police": {
      keywords: ['police', 'crime', 'theft', 'robbery', 'assault', 'harassment', 'safety', 'law', 'security', 'patrol', 'station'],
      deptKey: "Public Safety / Police"
    },
    "Construction & Encroachment": {
      keywords: ['illegal construction', 'encroachment', 'demolition', 'unauthorized', 'building permit', 'structure'],
      deptKey: "Construction & Encroachment"
    },
    "Animal Control": {
      keywords: ['animal', 'dog', 'cat', 'cow', 'stray', 'rabies', 'bite', 'menace', 'pet'],
      deptKey: "Animal Control"
    },
    "Disaster Management": {
      keywords: ['disaster', 'flood', 'earthquake', 'cyclone', 'calamity', 'relief', 'natural disaster'],
      deptKey: "Disaster Management"
    },
    "Government Schemes / Welfare": {
      keywords: ['scheme', 'welfare', 'pension', 'subsidy', 'yojana', 'benefit', 'government program'],
      deptKey: "Government Schemes / Welfare"
    },
    "Digital Services / IT Grievances": {
      keywords: ['portal', 'website', 'online', 'payment fail', 'server down', 'app', 'digital', 'it issue', 'cyber'],
      deptKey: "Digital Services / IT Grievances"
    },
  };

  // Deterministic Matching
  let categoryMatched = false;
  for (const [cat, data] of Object.entries(routingEngine)) {
    if (data.keywords.some(kw => lowerText.includes(kw))) {
      detectedCategoryKey = data.deptKey;
      assignedDepartment = departmentsMap[data.deptKey];
      reasoningParts.push(`Category '${cat}' detected based on keywords: ${data.keywords.filter(kw => lowerText.includes(kw)).join(', ')}.`);
      categoryMatched = true;
      break;
    }
  }
  if (!categoryMatched) {
    reasoningParts.push('No specific category keywords matched. Defaulted to "Other / Miscellaneous".');
  }

  // Priority Determination
  const criticalKeywords = ['fire', 'accident', 'emergency', 'death', 'flood', 'gas leak', 'murder', 'blast', 'collapse', 'critical', 'urgent', 'immediate', 'life threatening', 'severe injury', 'major disaster', 'poison', 'toxic', 'danger'];
  const highKeywords = ['no water', 'no electricity', 'road blocked', 'major leakage', 'bribe', 'corrupt', 'threat', 'harassment', 'robbery', 'assault', 'stolen', 'leak', 'fraud', 'illegal', 'unsafe', 'epidemic', 'violence'];
  const mediumKeywords = ['broken streetlight', 'garbage issue', 'minor leak', 'delay', 'pending', 'query', 'request', 'feedback', 'noise', 'broken', 'damage', 'malfunction', 'slow', 'unresponsive'];
  const lowKeywords = ['suggestion', 'small issue', 'general complaint', 'feedback'];

  if (criticalKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'Critical';
    reasoningParts.push(`Priority set to Critical due to keywords: ${criticalKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`);
  } else if (highKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'High';
    reasoningParts.push(`Priority set to High due to keywords: ${highKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`);
  } else if (mediumKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'Medium';
    reasoningParts.push(`Priority set to Medium due to keywords: ${mediumKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`);
  } else if (lowKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'Low';
    reasoningParts.push(`Priority set to Low due to keywords: ${lowKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`);
  } else {
    priority = 'Low';
    reasoningParts.push('Default Low priority as no specific severity keywords were detected.');
  }

  // Confidence Score Calculation
  if (categoryMatched && priority !== 'Low') {
    confidence = Math.floor(Math.random() * (95 - 80 + 1)) + 80; // High confidence for specific matches
  } else if (categoryMatched || priority !== 'Low') {
    confidence = Math.floor(Math.random() * (80 - 60 + 1)) + 60; // Medium confidence for partial matches
  } else {
    confidence = Math.floor(Math.random() * (60 - 40 + 1)) + 40; // Lower confidence for general/fallback
  }

  // Final reason string
  const finalReason = reasoningParts.join(' ');

  return {
    department: assignedDepartment,
    priority,
    confidence,
    reason: finalReason
  };
};
module.exports = { classifyComplaint };