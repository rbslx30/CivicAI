const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('./models/Complaint'); // Updated path
const { runAIAnalysis } = require('./services/aiClassifier');
const { generateApplicationId } = require('./utils/idGenerator'); // Updated path

dotenv.config();

const demoComplaints = [
  "सड़क पर बहुत गहरा गड्ढा है, दुर्घटना हो सकती है। (Deep pothole on road)",
  "No water supply in our colony for the last 3 days. Pipes are leaking.",
  "Street lights not working near the main square, unsafe for women.",
  "Garbage heap has not been cleared for a week. Terrible smell.",
  "Electricity voltage is very low, damaging home appliances.",
  "Urgent: Fire hazard spotted near the chemical warehouse!",
  "Cyber fraud: Someone stole my bank OTP and withdrew money."
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Seeding Demo Data...");

    for (const text of demoComplaints) {
      const aiResult = await runAIAnalysis(text);
      const complaint = new Complaint({
        name: "Demo Citizen",
        mobile: "9876543210",
        email: "demo@civicai.gov",
        state: "Maharashtra",
        district: "Mumbai",
        originalComplaint: text,
        applicationId: generateApplicationId(),
        category: aiResult.category,
        priority: aiResult.priority,
        assignedDepartment: aiResult.department,
        detectedLanguage: aiResult.detectedLanguage,
        translatedComplaint: aiResult.translatedText,
        confidenceScore: aiResult.confidenceScore,
        aiAnalysis: aiResult,
        status: Math.random() > 0.5 ? 'In Progress' : 'Submitted',
        timelineLogs: [{ status: 'Submitted', remarks: 'Seeded via Demo Logic' }]
      });
      await complaint.save();
    }

    console.log("✅ Demo data seeded successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();