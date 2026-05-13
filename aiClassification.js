// Keyword-based AI Classification Logic
const departmentsMap = require('./departments'); // Import the new departments map

const classifyComplaint = (text) => {
  if (!text) {
    return {
      category: 'Other / Miscellaneous',
      priority: 'Low',
      assignedDepartment: departmentsMap['Other / Miscellaneous'],
      reasoning: {
        category: 'No text provided.',
        priority: 'Default low priority due to no text.',
        routing: 'Default routing to General Administration due to no text.'
      }
    };
  }
  
  const lowerText = text.toLowerCase();

  let category = 'Other / Miscellaneous';
  let assignedDepartment = departmentsMap['Other / Miscellaneous'];
  let priority = 'Low';
  let categoryReason = 'No specific keywords matched for category. Defaulted to Other / Miscellaneous.';
  let priorityReason = 'No specific keywords matched for priority. Defaulted to Low.';
  let routingReason = `Routed to ${assignedDepartment} based on category.`;

  const routingEngine = {
    'Water Supply': {
      keywords: ['water', 'pipeline', 'tap', 'leak', 'drainage', 'drinking', 'pani', 'पानी'],
      dept: departmentsMap['Water Supply']
    },
    'Electricity Board': {
      keywords: ['electricity', 'power cut', 'blackout', 'wire', 'current', 'transformer', 'बिजली', 'light', 'street light'],
      dept: departmentsMap['Electricity Board']
    },
    'Roads & Infrastructure': {
      keywords: ['road', 'pothole', 'street', 'highway', 'bridge', 'सड़क', 'construction'],
      dept: departmentsMap['Roads & Highways']
    },
    'Sanitation & Waste': {
      keywords: ['garbage', 'cleaning', 'trash', 'smell', 'कचरा', 'dustbin', 'sweeper', 'waste'],
      dept: departmentsMap['Sanitation & Waste Management']
    },
    'Health & Medical': {
      keywords: ['hospital', 'doctor', 'disease', 'dengue', 'malaria', 'clinic', 'health', 'medicine'],
      dept: departmentsMap['Health Department']
    },
    'Law & Order': {
      keywords: ['police', 'crime', 'theft', 'robbery', 'assault', 'harassment', 'safety', 'law'],
      dept: departmentsMap['Public Safety / Police']
    },
    'Fire Safety': {
      keywords: ['fire', 'burn', 'cylinder blast', 'smoke', 'आग'],
      dept: departmentsMap['Fire & Emergency Services']
    },
    'Traffic Issue': {
      keywords: ['traffic', 'signal', 'jam', 'parking', 'vehicle', 'accident'],
      dept: departmentsMap['Traffic Police']
    },
    'Environment': {
      keywords: ['tree', 'cutting', 'pollution', 'park', 'noise', 'smoke'],
      dept: departmentsMap['Pollution Control']
    },
    'Education': {
      keywords: ['school', 'teacher', 'college', 'student', 'education', 'exam'],
      dept: departmentsMap['Education Department']
    },
    'Transport': {
      keywords: ['bus', 'train', 'ticket', 'transport', 'rto', 'license'],
      dept: departmentsMap['Public Transport']
    },
    'Digital Services': {
      keywords: ['portal', 'website', 'online', 'payment fail', 'server down', 'app'],
      dept: departmentsMap['Digital Services / IT Grievances']
    },
    'Emergency': {
      keywords: ['emergency', 'disaster', 'flood', 'earthquake', 'collapse'],
      dept: departmentsMap['Disaster Management']
    },
    'Women Welfare': {
      keywords: ['woman', 'child', 'abuse', 'domestic', 'orphan'],
      dept: departmentsMap['Women & Child Welfare']
    },
    'Housing & Urban Development': {
      keywords: ['house', 'building', 'slum', 'colony', 'housing', 'urban'],
      dept: departmentsMap['Housing & Urban Development']
    },
    'Property Tax / Revenue': {
      keywords: ['tax', 'property', 'revenue', 'bill', 'fine'],
      dept: departmentsMap['Property Tax / Revenue']
    },
    'Food & Civil Supplies': {
      keywords: ['ration', 'food', 'supply', 'grain', 'subsidy'],
      dept: departmentsMap['Food & Civil Supplies']
    },
    'Animal Control': {
      keywords: ['animal', 'dog', 'cat', 'cow', 'stray', 'rabies'],
      dept: departmentsMap['Animal Control']
    },
    'Government Schemes / Welfare': {
      keywords: ['scheme', 'welfare', 'pension', 'subsidy', 'yojana'],
      dept: departmentsMap['Government Schemes / Welfare']
    },
    'Construction & Encroachment': {
      keywords: ['illegal construction', 'encroachment', 'demolition', 'unauthorized'],
      dept: departmentsMap['Construction & Encroachment']
    }
  };

  // Deterministic Matching
  for (const [cat, data] of Object.entries(routingEngine)) {
    if (data.keywords.some(kw => lowerText.includes(kw))) {
      category = cat;
      assignedDepartment = data.dept || departmentsMap['Other / Miscellaneous']; // Fallback to general if dept not explicitly set
      categoryReason = `Matched category '${category}' based on keywords: ${data.keywords.filter(kw => lowerText.includes(kw)).join(', ')}.`;
      routingReason = `Routed to ${assignedDepartment} based on category match.`;
      break;
    }
  }

  // Priority Determination
  const criticalKeywords = ['accident', 'emergency', 'fire', 'danger', 'death', 'murder', 'blast', 'collapse', 'critical', 'urgent', 'immediate', 'life threatening', 'severe injury', 'major disaster', 'poison', 'toxic'];
  const highKeywords = ['bribe', 'corrupt', 'threat', 'harassment', 'robbery', 'assault', 'stolen', 'leak', 'fraud', 'illegal', 'unsafe', 'epidemic', 'violence'];
  const mediumKeywords = ['delay', 'pending', 'query', 'request', 'feedback', 'noise', 'broken', 'damage', 'malfunction', 'slow', 'unresponsive'];

  if (criticalKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'Critical';
    priorityReason = `Priority set to Critical due to keywords: ${criticalKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`;
  } else if (highKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'Urgent';
    priorityReason = `Priority set to Urgent due to keywords: ${highKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`;
  } else if (mediumKeywords.some(kw => lowerText.includes(kw))) {
    priority = 'High';
    priorityReason = `Priority set to High due to keywords: ${mediumKeywords.filter(kw => lowerText.includes(kw)).join(', ')}.`;
  } else {
    priority = 'Medium';
    priorityReason = 'Default Medium priority as no specific high-priority keywords were detected.';
  }

  // If category is still 'Other / Miscellaneous' but a priority was detected, update routing reason
  if (category === 'Other / Miscellaneous' && priority !== 'Low') {
    routingReason = `Routed to ${assignedDepartment} as a general fallback, but with ${priority} priority detected.`;
  }

  return {
    category,
    priority,
    assignedDepartment,
    reasoning: {
      category: categoryReason,
      priority: priorityReason,
      routing: routingReason
    }
  };
};
module.exports = { classifyComplaint };