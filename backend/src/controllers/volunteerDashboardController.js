const getVolunteerDashboardData = async (req, res) => {
  try {
    // In a real application, you would fetch personalized data for the logged-in volunteer
    // For now, we'll provide mock data.
    
    const stats = {
      reportsSubmitted: 15, // Example: fetched from reports DB for this user
      projectsJoined: 3,   // Example: fetched from projects DB for this user
      impactScore: 1250,   // Example: calculated based on user activities
      rank: "Silver Volunteer", // Example: based on impact score
    };

    const recentReports = [
      {
        id: "rep1",
        title: "Illegal Logging Sighting",
        status: "pending",
        location: "Nyungwe Forest",
        submittedAt: "2024-06-10",
        urgency: "high",
      },
      {
        id: "rep2",
        title: "Rare Bird Sighting",
        status: "verified",
        location: "Akagera National Park",
        submittedAt: "2024-06-05",
        urgency: "low",
      },
    ];

    const availableProjects = [
      {
        id: "proj1",
        title: "Forest Restoration in Gishwati",
        description: "Join us to plant 10,000 trees in Gishwati-Mukura National Park.",
        status: "active",
        location: "Gishwati-Mukura NP",
        startDate: "2024-07-01",
        volunteersNeeded: 20,
      },
      {
        id: "proj2",
        title: "Wildlife Monitoring in Akagera",
        description: "Assist rangers with camera trap setup and data collection.",
        status: "planning",
        location: "Akagera National Park",
        startDate: "2024-08-15",
        volunteersNeeded: 5,
      },
    ];

    res.json({
      stats,
      recentReports,
      availableProjects,
    });

  } catch (error) {
    console.error('Error fetching volunteer dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching volunteer dashboard data' });
  }
};

module.exports = {
  getVolunteerDashboardData,
}; 