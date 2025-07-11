const WildlifeReport = require('../models/WildlifeReport');

exports.getThreats = async (req, res) => {
  try {
    // Fetch all wildlife reports and populate the submittedBy user's name and email
    const threats = await WildlifeReport.find({})
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 }); // Sort by most recent

    // You might want to transform the data here to match the frontend's `Threat` interface more closely
    const transformedThreats = threats.map(report => ({
      id: report._id.toString(),
      type: report.category, // Map category to type
      severity: report.urgency, // Map urgency to severity
      title: report.title,
      description: report.description,
      location: report.location,
      coordinates: { lat: report.location.lat, lng: report.location.lng },
      reportedAt: report.submittedAt.toISOString(),
      reportedBy: report.submittedBy ? `${report.submittedBy.firstName} ${report.submittedBy.lastName}` : 'Unknown',
      status: report.status,
      // estimatedThreatLevel: report.severity, // If you have a numerical threat level
      // evidence: report.photos, // If you want to use photos as evidence
      lastUpdate: report.updatedAt ? report.updatedAt.toISOString() : report.submittedAt.toISOString(),
    }));

    res.status(200).json({ threats: transformedThreats });
  } catch (error) {
    console.error('Error fetching threats:', error);
    res.status(500).json({ message: 'Server error, could not fetch threats.' });
  }
}; 