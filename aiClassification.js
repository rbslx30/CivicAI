// Keyword-based AI Classification Logic
const classifyComplaint = (text) => {
  if (!text) return { category: 'General', priority: 'Low', assignedDepartment: 'General Administration' };
  
  const lowerText = text.toLowerCase();

  let category = 'General';
  let assignedDepartment = 'General Administration';
  let priority = 'Low';

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

  if (['accident', 'emergency', 'fire', 'danger', 'death'].some(kw => lowerText.includes(kw))) priority = 'Urgent';
  else if (['bribe', 'corrupt', 'threat', 'leak', 'police'].some(kw => lowerText.includes(kw))) priority = 'High';
  else if (['delay', 'pending', 'query', 'noise'].some(kw => lowerText.includes(kw))) priority = 'Medium';

  return { category, priority, assignedDepartment };
};
module.exports = { classifyComplaint };