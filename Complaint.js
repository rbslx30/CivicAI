const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true, default: 'IN-MP-BHO' }, // Multi-tenant Identifier
  name: String,
  mobile: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to the User who submitted the complaint
  email: String,
  category: String,
  description: String,
  state: String,
  district: String,
  evidence: String, // To store Base64 strings from frontend
  
  // Existing fields kept to prevent app crashes:
  applicationId: { type: String, required: true, unique: true },
  originalComplaint: { type: String, required: true },
  translatedComplaint: { type: String },
  detectedLanguage: { type: String, default: 'Auto' },
  priority: { type: String, required: true, default: 'Low' },
  assignedDepartment: { type: String, required: true, default: 'General' },
  assignedOfficer: { type: String, default: 'Unassigned' },
  confidenceScore: { type: Number, default: 0 },
  frustrationLevel: { type: Number, default: 2 }, // 1-5 scale
  fraudScore: { type: Number, default: 0 }, // 0-100 probability
  resolutionEstimate: { type: String, default: '3-5 Days' },
  urgencyScore: { type: Number, default: 0 },
  routingStatus: { type: String, default: 'Pending' },
  escalationStatus: { type: String, default: 'None' },
  slaDeadline: { type: Date },
  status: { type: String, default: 'Submitted' },
  autoEscalated: { type: Boolean, default: false },
  
  aiAnalysis: {
    detectedLanguage: String,
    translatedText: String,
    category: String,
    priority: String,
    department: String,
    sentiment: String,
    confidenceScore: Number,
    urgencyScore: Number,
    routingStatus: String,
    recommendedAuthority: String,
    reason: { type: String, default: 'No specific AI reasoning provided.' } // Consolidated AI reason
  },
  
  internalNotes: [
    { officer: String, note: String, timestamp: { type: Date, default: Date.now } }
  ],

  moderationHistory: [
    {
      action: String,
      performedBy: String,
      previousValue: String,
      newValue: String,
      remarks: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],

  timelineLogs: [
    {
      status: String,
      remarks: String,
      performedBy: { type: String, default: 'AI-System' }, // Audit Logging
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { 
  timestamps: true 
});

// Performance Indexes for Production
complaintSchema.index({ applicationId: 1 });
complaintSchema.index({ tenantId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ assignedDepartment: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);