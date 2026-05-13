const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('./models/Complaint'); // Updated path
const { runAIAnalysis } = require('./services/aiClassifier');
const { generateApplicationId } = require('./utils/idGenerator'); // Updated path
const User = require('./models/User');
const bcrypt = require('bcryptjs');
dotenv.config();

const demoComplaints = [
  "सड़क पर बहुत गहरा गड्ढा है, दुर्घटना हो सकती है। (Deep pothole on road)",
  "No water supply in our colony for the last 3 days. Pipes are leaking.",
  "Street lights not working near the main square, unsafe for women.",
  "Garbage heap has not been cleared for a week. Terrible smell.",
  "Electricity voltage is very low, damaging home appliances. (Electricity Board)",
  "Urgent: Fire hazard spotted near the chemical warehouse!",
  "Cyber fraud: Someone stole my bank OTP and withdrew money.",
  "Illegal construction happening in the park area. (Construction & Encroachment)",
  "Stray dogs are a menace in our locality. (Animal Control)",
  "Pension not received for the last two months. (Government Schemes / Welfare)"
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding.");

    // Clear existing demo data and users to ensure a clean slate
    await Complaint.deleteMany({});
    await User.deleteMany({ email: { $in: ['demouser@civicai.ai', 'wateradmin@civicai.ai', 'superadmin@civicai.ai'] } });
    console.log("Cleared existing demo complaints and users.");

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await User.create({
      name: 'Demo Citizen', email: 'demouser@civicai.ai', password: hashedPassword, role: 'user'
    });
    const waterAdmin = await User.create({
      name: 'Water Dept Admin', email: 'wateradmin@civicai.ai', password: hashedPassword, role: 'department_admin', department: 'Water Supply Department'
    });
    const superAdmin = await User.create({
      name: 'Super Admin', email: 'superadmin@civicai.ai', password: hashedPassword, role: 'super_admin'
    });

    console.log("Demo users created: Demo Citizen, Water Dept Admin, Super Admin.");


    console.log("Seeding Demo Data...");

    for (const text of demoComplaints) {
      const aiResult = await runAIAnalysis(text);
      const complaint = new Complaint({
        name: "Demo Citizen",
        mobile: "9876543210",
        email: demoUser.email, // Link to demo user
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
        status: Math.random() > 0.6 ? 'Resolved' : (Math.random() > 0.3 ? 'In Progress' : 'Submitted'),
        assignedOfficer: aiResult.department === 'Water Supply Department' ? 'Officer John Doe' : 'AI System Auto-Assigned',
        timelineLogs: [{ status: 'Submitted', remarks: 'Seeded via Demo Logic' }],
        // Assign some complaints to the water department for testing water admin
        // This is a simple heuristic for demo, real AI would do this.
        ...(aiResult.department === 'Water Supply Department' && { assignedDepartment: 'Water Supply Department' })
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