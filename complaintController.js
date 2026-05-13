const Complaint = require('../models/Complaint');
const { generateApplicationId } = require('../utils/idGenerator');
const { runAIAnalysis } = require('../services/aiClassifier');

exports.createComplaint = async (req, res) => {
  console.log("Incoming complaint payload body:", req.body);

  const { fullName, mobile, description, state, district, category, language, email, evidence } = req.body;

  if (!fullName || !mobile || !description || !state || !district || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing. Please provide name, mobile, description, state, and district."
    });
  }

  if (description.trim().length < 15) {
    return res.status(400).json({
      success: false,
      message: "Description is too short for AI analysis. Please provide at least 15 characters."
    });
  }

  try {
    const aiResult = await runAIAnalysis(description);

    const newComplaint = new Complaint({
      applicationId: generateApplicationId(),
      name: fullName,
      mobile,
      email,
      state,
      district,
      originalComplaint: description,
      evidence,
      category: aiResult.category,
      priority: aiResult.priority,
      assignedDepartment: aiResult.department,
      detectedLanguage: aiResult.detectedLanguage,
      translatedComplaint: aiResult.translatedText,
      confidenceScore: aiResult.confidenceScore,
      aiAnalysis: aiResult,
      status: 'Submitted',
      timelineLogs: [{ status: 'Submitted', remarks: 'Grievance received and logged by the system.' }]
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      category: aiResult.category,
      priority: aiResult.priority,
      department: aiResult.department,
      data: savedComplaint
    });
  } catch (error) {
    console.error("Error in createComplaint controller:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred while creating the complaint." });
  }
};

exports.trackComplaint = async (req, res) => {
  const { id, phone } = req.query;

  if (!id && !phone) {
    return res.status(400).json({ success: false, message: 'Application ID or Phone Number is required for tracking.' });
  }

  try {
    const query = {};
    if (id && phone) {
      query.$and = [{ applicationId: id }, { mobile: phone }];
    } else if (id) {
      query.applicationId = id;
    } else {
      query.mobile = phone;
    }

    const complaint = await Complaint.findOne(query).sort({ createdAt: -1 }).lean();

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'No complaint found with the provided details.' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    console.error("Error in trackComplaint controller:", error);
    res.status(500).json({ success: false, message: 'An internal server error occurred during tracking.' });
  }
};