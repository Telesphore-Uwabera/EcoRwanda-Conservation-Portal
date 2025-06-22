require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocketService = require('./services/websocketService');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Make WebSocket service available globally
global.wsService = wsService;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const volunteerDashboardRoutes = require('./routes/volunteerDashboard');
const researcherDashboardRoutes = require('./routes/researcherDashboard');
const rangerDashboardRoutes = require('./routes/rangerDashboard');
const adminDashboardRoutes = require('./routes/adminDashboard');
const userManagementRoutes = require('./routes/userManagement');
const patrolRoutes = require('./routes/patrolRoutes');
const threatRoutes = require('./routes/threats');
const dataHubRoutes = require('./routes/dataHub');
const analyticsRoutes = require('./routes/analytics');
const systemSettingsRoutes = require('./routes/systemSettings');
const reportsRoutes = require('./routes/reports');
const researchProjectRoutes = require('./routes/researchProjectRoutes');
const announcementsRoutes = require('./routes/announcements');
const chatRoutes = require('./routes/chat');
const collaborationRoutes = require('./routes/collaboration');
const volunteerRequestsRoutes = require('./routes/volunteerRequests');
const conservationProjectsRoutes = require('./routes/conservationProjects');
const applicationRoutes = require('./routes/applicationRoutes');
const activityRoutes = require('./routes/activities');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/volunteer-dashboard', volunteerDashboardRoutes);
app.use('/api/researcher-dashboard', researcherDashboardRoutes);
app.use('/api/ranger-dashboard', rangerDashboardRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/patrols', patrolRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/data-hub', dataHubRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', systemSettingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/researchprojects', researchProjectRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/volunteer-requests', volunteerRequestsRoutes);
app.use('/api/conservation-projects', conservationProjectsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/system-settings', systemSettingsRoutes);
app.use('/api/activities', activityRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('EcoRwanda Conservation Portal API is running');
});

// Connect to MongoDB with detailed error handling
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 