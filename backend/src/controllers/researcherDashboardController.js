const getResearcherDashboardData = async (req, res) => {
  try {
    // In a real application, fetch personalized data for the logged-in researcher
    // For now, we'll provide mock data.

    const stats = {
      publishedFindings: 7, // Example: count of findings published by this researcher
      activeProjects: 2,    // Example: count of active projects led by this researcher
      volunteerCollaborators: 15, // Example: count of volunteers collaborated with
      datasetDownloads: 230, // Example: count of downloads of datasets uploaded by this researcher
    };

    const activeProjects = [
      {
        id: "projA",
        title: "Impact of Climate Change on Rwandan Biodiversity",
        description: "Long-term study on species adaptation and ecosystem resilience.",
        status: "data_collection",
        location: "Nyungwe NP",
        startDate: "2023-09-01",
        volunteersNeeded: 5,
      },
      {
        id: "projB",
        title: "Ecotourism Revenue vs. Conservation Funding",
        description: "Analyzing the economic contribution of ecotourism to conservation.",
        status: "analysis",
        location: "Kigali, Various Parks",
        startDate: "2024-01-15",
        volunteersNeeded: 0,
      },
    ];

    const recentPublications = [
      {
        id: "pubX",
        title: "Habitat Fragmentation Effects on Primates in Gishwati",
        journal: "Primates Conservation Journal",
        date: "2024-05-20",
        downloads: 95,
        citations: 15,
      },
      {
        id: "pubY",
        title: "Sustainable Land Use Practices in Rural Rwanda",
        journal: "Environmental Management",
        date: "2024-03-10",
        downloads: 180,
        citations: 22,
      },
    ];

    const collaborationRequests = [
      {
        id: "collabR1",
        title: "Data Collection for Akagera Herbivore Study",
        requiredSkills: ["GPS navigation", "Wildlife tracking"],
        volunteers: 3,
        target: 8,
        deadline: "2024-07-20",
      },
      {
        id: "collabR2",
        title: "Translation of Field Guides to Kinyarwanda",
        requiredSkills: ["Kinyarwanda fluency", "Conservation knowledge"],
        volunteers: 1,
        target: 2,
        deadline: "2024-08-01",
      },
    ];

    res.json({
      stats,
      activeProjects,
      recentPublications,
      collaborationRequests,
    });

  } catch (error) {
    console.error('Error fetching researcher dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching researcher dashboard data' });
  }
};

module.exports = {
  getResearcherDashboardData,
}; 