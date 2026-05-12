// Generate unique ID format: GRV-2026-8F4K29
const generateApplicationId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRV-${year}-${randomStr}`;
};

// Keyword-based AI Classification Logic
const classifyComplaint = (text) => {
  if (!text) return { category: 'General', priority: 'Low', assignedDepartment: 'General Administration' };
  
  const lowerText = text.toLowerCase();

  let category = 'General';
  let assignedDepartment = 'General Administration';
  let priority = 'Low';

  // 1. Department & Category Routing
  const routingEngine = {
    'Electricity': {
      keywords: ['power', 'electricity', 'blackout', 'बिजली', 'current', 'wire', 'shock', 'transformer'],
      dept: 'Electricity Department'
    },
    'Water Supply': {
      keywords: ['water', 'leakage', 'पानी', 'pipe', 'plumbing', 'dry', 'supply'],
      dept: 'Water Supply Department'
    },
    'Roads & Infrastructure': {
      keywords: ['pothole', 'road damage', 'सड़क', 'highway', 'street', 'bridge', 'construction'],
      dept: 'Public Works Department'
    },
    'Sanitation & Waste': {
      keywords: ['garbage', 'drainage', 'कचरा', 'trash', 'smell', 'sewage', 'sweeper', 'dustbin'],
      dept: 'Municipal Sanitation Department'
    }
  };

  for (const [cat, data] of Object.entries(routingEngine)) {
    if (data.keywords.some(kw => lowerText.includes(kw))) {
      category = cat;
      assignedDepartment = data.dept;
      break;
    }
  }

  // 2. Priority Detection
  const urgentWords = ['accident', 'emergency', 'fire', 'hospital', 'danger', 'death', 'murder', 'suicide', 'fatal', 'blast', 'blood'];
  const highWords = ['bribe', 'corrupt', 'threat', 'harassment', 'leak', 'police', 'stolen', 'robbery', 'assault'];
  const mediumWords = ['delay', 'pending', 'query', 'request', 'feedback', 'noise'];

  if (urgentWords.some(kw => lowerText.includes(kw))) {
    priority = 'Urgent';
  } else if (highWords.some(kw => lowerText.includes(kw))) {
    priority = 'High';
  } else if (mediumWords.some(kw => lowerText.includes(kw))) {
    priority = 'Medium';
  }

  return { category, priority, assignedDepartment };
};

module.exports = { generateApplicationId, classifyComplaint };