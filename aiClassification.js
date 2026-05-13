// Keyword-based AI Classification Logic
const classifyComplaint = (text) => {
  if (!text) return { category: 'General', priority: 'Low', assignedDepartment: 'General Administration' };
  
  const lowerText = text.toLowerCase();

  let category = 'General';
  let assignedDepartment = 'General Administration';
  let priority = 'Low';

  const routingEngine = {
    'Water Issue': {
      keywords: ['water', 'pipeline', 'tap', 'leak', 'drainage', 'drinking', 'pani', 'पानी'],
      dept: 'Water Supply'
    },
    'Power Issue': {
      keywords: ['electricity', 'power cut', 'blackout', 'wire', 'current', 'transformer', 'बिजली', 'light'],
      dept: 'Electricity Board'
    },
    'Roads & Infrastructure': {
      keywords: ['road', 'pothole', 'street', 'highway', 'bridge', 'सड़क', 'construction'],
      dept: 'Public Works Department'
    },
    'Sanitation & Waste': {
      keywords: ['garbage', 'cleaning', 'trash', 'smell', 'कचरा', 'dustbin', 'sweeper', 'waste'],
      dept: 'Sanitation / Waste Management'
    },
    'Health & Medical': {
      keywords: ['hospital', 'doctor', 'disease', 'dengue', 'malaria', 'clinic', 'health', 'medicine'],
      dept: 'Public Health'
    },
    'Law & Order': {
      keywords: ['police', 'crime', 'theft', 'robbery', 'assault', 'harassment', 'safety', 'law'],
      dept: 'Police / Law & Order'
    },
    'Fire Safety': {
      keywords: ['fire', 'burn', 'cylinder blast', 'smoke', 'आग'],
      dept: 'Fire Department'
    },
    'Traffic Issue': {
      keywords: ['traffic', 'signal', 'jam', 'parking', 'vehicle', 'accident'],
      dept: 'Traffic Department'
    },
    'Environment': {
      keywords: ['tree', 'cutting', 'pollution', 'park', 'noise', 'smoke'],
      dept: 'Environment Department'
    },
    'Education': {
      keywords: ['school', 'teacher', 'college', 'student', 'education', 'exam'],
      dept: 'Education Department'
    },
    'Transport': {
      keywords: ['bus', 'train', 'ticket', 'transport', 'rto', 'license'],
      dept: 'Transport Authority'
    },
    'Digital Services': {
      keywords: ['portal', 'website', 'online', 'payment fail', 'server down', 'app'],
      dept: 'IT & Digital Services'
    },
    'Emergency': {
      keywords: ['emergency', 'disaster', 'flood', 'earthquake', 'collapse'],
      dept: 'Emergency Services'
    },
    'Women Welfare': {
      keywords: ['woman', 'child', 'abuse', 'domestic', 'orphan'],
      dept: 'Women & Child Welfare'
    }
  };

  // Deterministic Matching
  for (const [cat, data] of Object.entries(routingEngine)) {
    if (data.keywords.some(kw => lowerText.includes(kw))) {
      category = cat;
      assignedDepartment = data.dept;
      break;
    }
  }

  // Priority Determination
  if (['accident', 'emergency', 'fire', 'danger', 'death', 'murder', 'blast'].some(kw => lowerText.includes(kw))) {
    priority = 'Urgent';
  } else if (['bribe', 'corrupt', 'threat', 'harassment', 'robbery'].some(kw => lowerText.includes(kw))) {
    priority = 'High';
  } else if (['delay', 'pending', 'query', 'noise'].some(kw => lowerText.includes(kw))) {
    priority = 'Medium';
  }

  return { category, priority, assignedDepartment };
};
module.exports = { classifyComplaint };