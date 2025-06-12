require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

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
const patrolRoutes = require('./routes/patrols');
const threatRoutes = require('./routes/threats');
const dataHubRoutes = require('./routes/dataHub');
const analyticsRoutes = require('./routes/analytics');
const systemSettingsRoutes = require('./routes/systemSettings');

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
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code
    });
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 