const getRangerDashboardData = async (req, res) => {
  try {
    // In a real application, fetch personalized data for the logged-in ranger
    // For now, we'll provide mock data.

    const stats = {
      reportsToVerify: 5, // Example: count of reports assigned to this ranger
      patrolsCompleted: 18, // Example: count of patrols completed by this ranger
      threatsDetected: 2,   // Example: count of threats detected by this ranger
      responseTime: "12 min", // Example: average response time for this ranger
    };

    const urgentAlerts = [
      {
        id: "alert1",
        type: "poaching",
        location: "Sector B-3, Akagera NP",
        reporter: "Automated Sensor",
        time: "1 hour ago",
        status: "active",
        priority: "critical",
      },
      {
        id: "alert2",
        type: "illegal_entry",
        location: "Western Boundary, Volcanoes NP",
        reporter: "Patrol Team Alpha",
        time: "30 minutes ago",
        status: "responding",
        priority: "high",
      },
    ];

    const pendingReports = [
      {
        id: "pr1",
        title: "Illegal charcoal production site",
        location: "Gishwati Forest outskirts",
        submittedBy: "Local Resident",
        submittedAt: "2024-06-12 10:00",
        urgency: "high",
        evidence: ["photos", "video"],
      },
      {
        id: "pr2",
        title: "Injured chimpanzee sighting",
        location: "Nyungwe Forest Canopy Walk",
        submittedBy: "Tourist",
        submittedAt: "2024-06-11 16:30",
        urgency: "critical",
        evidence: ["photos"],
      },
    ];

    const todayPatrols = [
      {
        id: "patrol1",
        route: "Eastern Sector Patrol",
        status: "in_progress",
        duration: "2 hours",
        findings: "Observing animal behavior. All clear.",
        ranger: "You",
      },
      {
        id: "patrol2",
        route: "Southern Wetland Survey",
        status: "scheduled",
        duration: "4 hours",
        findings: "To be started",
        ranger: "Alice Mukamana",
      },
    ];

    res.json({
      stats,
      urgentAlerts,
      pendingReports,
      todayPatrols,
    });

  } catch (error) {
    console.error('Error fetching ranger dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching ranger dashboard data' });
  }
};

module.exports = {
  getRangerDashboardData,
}; 