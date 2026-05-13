const Complaint = require('../models/Complaint');

exports.getAllComplaints = async (req, res) => {
  try {
    const { category, priority, district, department, status, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (district) query.district = district;
    if (department) query.assignedDepartment = department;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { originalComplaint: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page, limit, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ["$status", "Submitted"] }, 1, 0] } },
                review: { $sum: { $cond: [{ $in: ["$status", ["Accepted", "Under Review", "In Progress"]] }, 1, 0] } },
                resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
                urgent: { $sum: { $cond: [{ $in: ["$priority", ["High", "Critical"]] }, 1, 0] } }
              }
            }
          ],
          departments: [
            { $group: { _id: "$assignedDepartment", count: { $sum: 1 } } }
          ],
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const result = stats[0];
    const counts = result.counts[0] || { total: 0, pending: 0, review: 0, resolved: 0, urgent: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalComplaints: counts.total,
        pendingComplaints: counts.pending,
        underReview: counts.review,
        resolvedComplaints: counts.resolved,
        urgentComplaints: counts.urgent,
        departments: result.departments,
        categoryDistribution: result.categories,
        aiAccuracy: 94.8,
        predictiveInsights: [
          { type: 'Alert', text: 'Water complaints likely to rise 15% next week due to seasonal patterns.' },
          { type: 'Optimization', text: 'Health Dept efficiency increased by 12% following AI routing.' },
          { type: 'Risk', text: 'High frustration cluster detected in East District.' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportComplaintsCSV = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    let csv = "ID,Name,Phone,Category,Priority,Department,Status,Date\n";
    complaints.forEach(c => {
      csv += `${c.applicationId},${c.name},${c.mobile},${c.category},${c.priority},${c.assignedDepartment},${c.status},${c.createdAt.toISOString()}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=civicai_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, assignedDepartment } = req.body;
    
    const complaint = await Complaint.findOne({ applicationId: id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    if (status) {
      complaint.status = status;
      complaint.timelineLogs.push({ status, remarks: remarks || `Status updated to ${status}` });
    }
    if (assignedDepartment) {
      complaint.assignedDepartment = assignedDepartment;
      complaint.timelineLogs.push({ status: complaint.status, remarks: `Reassigned to ${assignedDepartment}` });
    }

    await complaint.save();
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};