# EcoRwanda Conservation Portal 🌿

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://ecorwandaconservationportal.netlify.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Live-blue)](https://ecorwanda-conservation-portal.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

A comprehensive **Eco-Volunteer and Research Collaboration Portal** designed to facilitate collaboration between volunteers, researchers, and park rangers in ecological conservation efforts across Rwanda. This platform provides a centralized ecosystem for managing conservation activities, tracking wildlife reports, conducting research, and coordinating volunteer efforts.

## 🚀 Live Deployment

- **Frontend**: [https://ecorwandaconservationportal.netlify.app/](https://ecorwandaconservationportal.netlify.app/)
- **Backend API**: [https://ecorwanda-conservation-portal.onrender.com](https://ecorwanda-conservation-portal.onrender.com)

## 🎯 Project Overview

The EcoRwanda Conservation Portal is a full-stack web application that serves as a digital hub for conservation activities in Rwanda. It enables real-time collaboration between different stakeholders in wildlife conservation, research, and environmental protection.

### 🌟 Key Features

#### 🔐 **Authentication & Authorization**
- **Multi-role user system** (Administrator, Ranger, Researcher, Volunteer)
- **JWT-based authentication** with secure token management
- **Role-based access control** (RBAC) with protected routes
- **User verification system** with admin approval workflow
- **Password hashing** using bcryptjs
- **Session management** with automatic token refresh

#### 📱 **Real-time Communication**
- **WebSocket integration** for live notifications and chat
- **Real-time collaboration threads** for team discussions
- **Instant messaging system** between users
- **Live status updates** for reports and projects
- **Push notifications** for urgent wildlife reports

#### 🗺️ **Geospatial & Mapping**
- **Interactive maps** using React Map GL and MapLibre GL
- **GPS location tracking** for wildlife reports
- **Geolocation services** with reverse geocoding
- **Protected area mapping** with detailed boundaries
- **Threat mapping** with color-coded urgency levels
- **Location-based filtering** and search capabilities

#### 📊 **Analytics & Data Visualization**
- **Comprehensive dashboard analytics** for all user roles
- **Interactive charts** using Recharts library
- **Real-time statistics** on conservation activities
- **Patrol analytics** with performance metrics
- **User engagement tracking** and reporting
- **Data export capabilities** for research purposes

#### 🔄 **Offline Functionality**
- **Progressive Web App (PWA)** features
- **IndexedDB integration** for offline data storage
- **Offline-first architecture** for field work
- **Data synchronization** when connection is restored
- **Offline report submission** with automatic sync
- **Local caching** for improved performance

#### 📋 **Wildlife Reporting System**
- **Multi-category reporting** (poaching, habitat destruction, wildlife sightings, etc.)
- **Photo evidence upload** with MongoDB storage
- **GPS coordinates capture** for precise location tracking
- **Urgency level classification** (low, medium, high, critical)
- **Report verification workflow** by rangers
- **Status tracking** throughout investigation process

#### 🏞️ **Protected Area Management**
- **Comprehensive area profiles** with biodiversity data
- **Species tracking** with conservation status
- **Activity monitoring** and scheduling
- **Threat assessment** and mitigation planning
- **Resource management** and documentation
- **Geospatial boundaries** and mapping

#### 🔬 **Research Project Management**
- **Research proposal submission** and review
- **Publication management** with DOI tracking
- **Dataset sharing** and access control
- **Collaboration tools** for research teams
- **Volunteer request system** for field work
- **Research findings publication** platform

#### 👥 **Volunteer Management**
- **Volunteer application system** for research projects
- **Skill-based matching** for project requirements
- **Application tracking** and status updates
- **Volunteer dashboard** with personal statistics
- **Project participation** and contribution tracking
- **Certificate generation** for completed work

#### 🚔 **Patrol Management**
- **Patrol scheduling** and assignment
- **Real-time patrol tracking** with GPS
- **Patrol data collection** and reporting
- **Performance analytics** for patrol teams
- **Incident reporting** during patrols
- **Resource allocation** and management

#### 📢 **Communication & Notifications**
- **Announcement system** for important updates
- **Email notifications** using Nodemailer
- **In-app notification center** with real-time updates
- **Role-based messaging** system
- **Emergency alerts** for critical situations
- **Newsletter distribution** for stakeholders

#### ⚙️ **System Administration**
- **User management** with bulk operations
- **System settings** configuration
- **Data backup** and recovery
- **Performance monitoring** and logging
- **Security audit** trails
- **Maintenance mode** controls

## 🛠️ Technology Stack

### **Frontend Technologies**

#### **Core Framework & Build Tools**
- **React 18.3.1** - Modern UI library with hooks and functional components
- **TypeScript 5.5.3** - Type-safe JavaScript development
- **Vite 6.2.2** - Fast build tool and development server
- **SWC** - Ultra-fast JavaScript/TypeScript compiler

#### **UI Framework & Styling**
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
  - Accordion, Alert Dialog, Avatar, Badge, Button, Calendar, Card, Checkbox
  - Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu
  - Form, Hover Card, Input, Label, Menubar, Navigation Menu, Pagination
  - Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet
  - Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Tooltip
- **Material-UI (MUI) 7.1.1** - React component library
- **Lucide React** - Beautiful & consistent icon toolkit
- **Framer Motion 12.6.2** - Production-ready motion library

#### **State Management & Data Fetching**
- **React Query (TanStack Query) 5.56.2** - Server state management
- **React Hook Form 7.53.0** - Performant forms with validation
- **Zod 3.23.8** - TypeScript-first schema validation
- **Axios 1.9.0** - HTTP client for API requests

#### **Routing & Navigation**
- **React Router DOM 6.26.2** - Client-side routing
- **React Navigation** - Mobile navigation patterns

#### **Maps & Geospatial**
- **React Map GL 6.1.20** - React components for Mapbox GL JS
- **MapLibre GL 5.6.0** - Open-source mapping library
- **Leaflet 1.9.4** - Mobile-friendly interactive maps
- **React Leaflet 5.0.0** - React components for Leaflet maps
- **@react-google-maps/api 2.20.7** - Google Maps integration

#### **Data Visualization**
- **Recharts 2.15.3** - Composable charting library
- **Three.js 0.176.0** - 3D graphics library
- **@react-three/fiber 8.18.0** - React renderer for Three.js

#### **Authentication & Security**
- **NextAuth.js 4.24.11** - Complete authentication solution
- **Firebase 11.9.1** - Backend services integration

#### **File Handling & Storage**
- **AWS SDK 2.1692.0** - AWS services integration
- **Multer 2.0.1** - File upload middleware
- **Multer S3 3.0.1** - S3 file upload integration

#### **Utilities & Helpers**
- **Date-fns 3.6.0** - Modern JavaScript date utility library
- **Class Variance Author 0.7.1** - Component variant management
- **CLSX 2.1.1** - Conditional className utility
- **Tailwind Merge 2.5.2** - Tailwind CSS class merging
- **CMDK 1.0.0** - Command menu component
- **Embla Carousel React 8.3.0** - Carousel component
- **Input OTP 1.2.4** - One-time password input
- **React Day Picker 8.10.1** - Date picker component
- **React Hot Toast 2.5.2** - Toast notifications
- **Sonner 1.5.0** - Toast component library
- **Vaul 0.9.3** - Drawer component

#### **Development Tools**
- **Prettier 3.5.3** - Code formatter
- **Vitest 3.1.4** - Unit testing framework
- **Autoprefixer 10.4.20** - CSS vendor prefixing
- **PostCSS 8.4.47** - CSS transformation tool

### **Backend Technologies**

#### **Core Framework & Runtime**
- **Node.js 18.x** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **Nodemon 2.0.22** - Development server with auto-restart

#### **Database & ODM**
- **MongoDB 7.0** - NoSQL document database
- **Mongoose 8.15.1** - MongoDB object modeling tool
- **MongoDB Atlas** - Cloud database hosting

#### **Authentication & Security**
- **bcryptjs 3.0.2** - Password hashing library
- **jsonwebtoken 9.0.2** - JWT token generation and verification
- **CORS 2.8.5** - Cross-origin resource sharing

#### **Real-time Communication**
- **WebSocket (ws) 8.18.0** - Real-time bidirectional communication
- **Socket.io** - Real-time event-based communication

#### **File Upload & Storage**
- **Multer 2.0.1** - File upload middleware
- **Multer S3 3.0.1** - S3 file upload integration
- **AWS SDK 2.1692.0** - AWS services integration
- **Cloudinary** - Cloud image and video management

#### **Email & Notifications**
- **Nodemailer 7.0.3** - Email sending library
- **SMTP integration** for automated emails

#### **HTTP Client**
- **Axios 1.9.0** - Promise-based HTTP client

#### **Environment & Configuration**
- **dotenv 16.5.0** - Environment variable management

### **Deployment & Infrastructure**

#### **Frontend Hosting**
- **Netlify** - Static site hosting with continuous deployment
- **Vercel** - Alternative hosting platform

#### **Backend Hosting**
- **Render.com** - Cloud application hosting
- **Heroku** - Alternative platform-as-a-service

#### **Database Hosting**
- **MongoDB Atlas** - Cloud database service
- **MongoDB Compass** - Database GUI tool

#### **File Storage**
- **AWS S3** - Object storage service
- **Cloudinary** - Cloud media management

#### **Domain & DNS**
- **Freenom** - Free domain registration
- **GitHub Pages** - Free static site hosting

#### **Monitoring & Analytics**
- **UptimeRobot** - Website monitoring
- **Sentry** - Error tracking and monitoring
- **Google Analytics** - Web analytics service

### **Development & DevOps**

#### **Version Control**
- **Git** - Distributed version control
- **GitHub** - Code repository and collaboration

#### **Package Management**
- **npm** - Node.js package manager
- **Package-lock.json** - Dependency locking

#### **Code Quality**
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

#### **Testing**
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing

## 📁 Project Structure

```
EcoRwanda-Conservation-Portal/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── activityController.js
│   │   │   ├── adminDashboardController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── announcementController.js
│   │   │   ├── applicationController.js
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── collaborationController.js
│   │   │   ├── conservationProjectController.js
│   │   │   ├── dataHubController.js
│   │   │   ├── notificationController.js
│   │   │   ├── patrolController.js
│   │   │   ├── protectedAreaController.js
│   │   │   ├── rangerDashboardController.js
│   │   │   ├── reportController.js
│   │   │   ├── researcherDashboardController.js
│   │   │   ├── researchProjectController.js
│   │   │   ├── systemSettingsController.js
│   │   │   ├── threatController.js
│   │   │   ├── userManagementController.js
│   │   │   ├── volunteerDashboardController.js
│   │   │   └── volunteerRequestController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   └── auth.js
│   │   ├── models/           # MongoDB schemas
│   │   │   ├── Activity.js
│   │   │   ├── Announcement.js
│   │   │   ├── Application.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── CollaborationThread.js
│   │   │   ├── Conservation.js
│   │   │   ├── ConservationProject.js
│   │   │   ├── Dataset.js
│   │   │   ├── Notification.js
│   │   │   ├── Patrol.js
│   │   │   ├── ProtectedArea.js
│   │   │   ├── Ranger.js
│   │   │   ├── Research.js
│   │   │   ├── Researcher.js
│   │   │   ├── ResearchProject.js
│   │   │   ├── Setting.js
│   │   │   ├── User.js
│   │   │   ├── Volunteer.js
│   │   │   ├── VolunteerRequest.js
│   │   │   └── WildlifeReport.js
│   │   ├── routes/           # API route definitions
│   │   │   ├── activities.js
│   │   │   ├── adminDashboard.js
│   │   │   ├── analytics.js
│   │   │   ├── announcements.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── collaboration.js
│   │   │   ├── conservationProjects.js
│   │   │   ├── dataHub.js
│   │   │   ├── notifications.js
│   │   │   ├── patrolRoutes.js
│   │   │   ├── patrols.js
│   │   │   ├── protectedAreaRoutes.js
│   │   │   ├── rangerDashboard.js
│   │   │   ├── reports.js
│   │   │   ├── researcherDashboard.js
│   │   │   ├── researchProjectRoutes.js
│   │   │   ├── systemSettings.js
│   │   │   ├── threats.js
│   │   │   ├── userManagement.js
│   │   │   ├── volunteerDashboard.js
│   │   │   └── volunteerRequests.js
│   │   ├── services/         # Business logic services
│   │   │   └── websocketService.js
│   │   ├── utils/            # Utility functions
│   │   │   ├── activityLogger.js
│   │   │   ├── notifications.js
│   │   │   └── sendEmail.js
│   │   └── server.js         # Main server file
│   ├── package.json
│   └── package-lock.json
├── frontend/                   # React/TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Common components
│   │   │   │   ├── categories.ts
│   │   │   │   ├── OfflineIndicator.tsx
│   │   │   │   ├── RoleGuard.tsx
│   │   │   │   └── ThreatMap.tsx
│   │   │   ├── layout/       # Layout components
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── patrol/       # Patrol-specific components
│   │   │   │   ├── PatrolAnalytics.tsx
│   │   │   │   ├── PatrolDialog.tsx
│   │   │   │   └── PatrolForm.tsx
│   │   │   ├── ui/           # UI components (Radix UI)
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── hover-card.tsx
│   │   │   │   ├── input-otp.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── menubar.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── resizable.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── ProtectedAreaForm.js
│   │   │   └── ResearchProjectForm.js
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── AnalyticsPage.tsx
│   │   │   │   ├── Announcements.tsx
│   │   │   │   ├── Chat.tsx
│   │   │   │   ├── Collaboration.tsx
│   │   │   │   ├── Communications.tsx
│   │   │   │   ├── Publications.tsx
│   │   │   │   ├── SystemSettingsPage.tsx
│   │   │   │   ├── UserManagementPage.tsx
│   │   │   │   └── UserProfileViewPage.tsx
│   │   │   ├── auth/        # Authentication pages
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   └── WaitingForVerification.tsx
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── RangerDashboard.tsx
│   │   │   │   ├── ResearcherDashboard.tsx
│   │   │   │   └── VolunteerDashboard.tsx
│   │   │   ├── ranger/      # Ranger pages
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── Announcements.tsx
│   │   │   │   ├── Chat.tsx
│   │   │   │   ├── Collaboration.tsx
│   │   │   │   ├── Communications.tsx
│   │   │   │   ├── PatrolData.tsx
│   │   │   │   ├── Publications.tsx
│   │   │   │   └── VerifyReports.tsx
│   │   │   ├── researcher/  # Researcher pages
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── CreateVolunteerRequest.tsx
│   │   │   │   ├── DataHub.tsx
│   │   │   │   ├── ManageVolunteerRequests.tsx
│   │   │   │   ├── Publications.tsx
│   │   │   │   ├── PublishFindings.tsx
│   │   │   │   └── RequestVolunteers.tsx
│   │   │   ├── volunteer/   # Volunteer pages
│   │   │   │   ├── MyApplications.tsx
│   │   │   │   ├── MyReports.tsx
│   │   │   │   ├── Publications.tsx
│   │   │   │   ├── SubmitReport.tsx
│   │   │   │   ├── ViewProjects.tsx
│   │   │   │   ├── VolunteerRequestDetails.tsx
│   │   │   │   └── VolunteerRequests.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── ProtectedAreaDetails.js
│   │   │   ├── ProtectedAreas.js
│   │   │   ├── ResearchProjectDetails.js
│   │   │   └── ResearchProjects.js
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   ├── useAuth.tsx
│   │   │   └── useWebSocket.ts
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/        # API services
│   │   │   └── websocketClient.ts
│   │   ├── utils/           # Utility functions
│   │   │   └── exportUtils.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   ├── auth.ts
│   │   │   └── patrol.ts
│   │   ├── config/          # Configuration files
│   │   │   ├── api.ts
│   │   │   └── database.js
│   │   ├── lib/             # Library configurations
│   │   │   ├── auth.ts
│   │   │   ├── firebase.ts
│   │   │   ├── offline.ts
│   │   │   ├── utils.spec.ts
│   │   │   └── utils.ts
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── public/              # Static assets
│   │   ├── LOGO.png
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── postcss.config.js
│   ├── components.json
│   ├── netlify.toml
│   └── index.html
├── package.json
├── package-lock.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** (Node Package Manager) v8 or higher
- **MongoDB Atlas** account
- **Git** for version control

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal.git
   cd EcoRwanda-Conservation-Portal/backend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment configuration**
   Create `.env` file with:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecorwanda
   PORT=8080
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create `.env` file with:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment Guide

### Backend Deployment (Render.com)

1. **Create Render account** and connect GitHub repository
2. **Create new Web Service** with settings:
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend/`
3. **Add environment variables** in Render dashboard
4. **Deploy** and get the API URL

### Frontend Deployment (Netlify)

1. **Create Netlify account** and connect GitHub repository
2. **Configure build settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Base Directory**: `frontend/`
3. **Set environment variables**:
   - `VITE_API_URL`: Render backend URL + `/api`
4. **Deploy** and get the site URL

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account**
2. **Create free cluster**
3. **Configure network access** (IP whitelist)
4. **Create database user**
5. **Get connection string** and update backend environment

## 👥 User Roles & Permissions

### **Administrator** 👑
- **System-wide user management** - Add, edit, delete users
- **Analytics and reporting access** - View system-wide statistics
- **System settings configuration** - Configure platform settings
- **Content moderation and approval** - Approve user registrations
- **Data export and backup management** - Export data and manage backups
- **Threat map access** - View all threats across the system

### **Ranger** 🚔
- **Wildlife report verification** - Verify and update report status
- **Patrol management and tracking** - Create and track patrols
- **Threat assessment and response** - Assess and respond to threats
- **Field data collection** - Collect data during patrols
- **Emergency response coordination** - Coordinate emergency responses
- **Threat map access** - View threats in assigned areas

### **Researcher** 🔬
- **Research project management** - Create and manage research projects
- **Data hub access and management** - Access and share research data
- **Volunteer request creation** - Create requests for volunteer assistance
- **Publication and findings sharing** - Publish research findings
- **Collaboration tools access** - Use collaboration features
- **Threat map access** - View threats for research purposes

### **Volunteer** 👥
- **Wildlife report submission** - Submit wildlife reports with photos
- **Project participation applications** - Apply for volunteer opportunities
- **Personal activity tracking** - Track personal contributions
- **Community engagement tools** - Engage with the conservation community
- **Training and certification access** - Access training materials

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/verify` - Email verification
- `POST /api/auth/reset-password` - Reset password with token

### Wildlife Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Submit new report with images
- `PUT /api/reports/:id` - Update report
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/:id/photo/:photoIndex` - Get report photo
- `DELETE /api/reports/:id` - Delete report

### Conservation Projects
- `GET /api/conservation-projects` - Get all projects
- `POST /api/conservation-projects` - Create project
- `PUT /api/conservation-projects/:id` - Update project
- `DELETE /api/conservation-projects/:id` - Delete project
- `GET /api/conservation-projects/available` - Get available projects

### Research Projects
- `GET /api/research-projects` - Get all research projects
- `POST /api/research-projects` - Create research project
- `PUT /api/research-projects/:id` - Update research project
- `DELETE /api/research-projects/:id` - Delete research project
- `POST /api/research-projects/:id/publish-finding` - Publish research finding

### Volunteer Requests
- `GET /api/volunteer-requests` - Get all volunteer requests
- `POST /api/volunteer-requests` - Create volunteer request
- `PUT /api/volunteer-requests/:id` - Update volunteer request
- `DELETE /api/volunteer-requests/:id` - Delete volunteer request
- `GET /api/volunteer-requests/:id` - Get specific volunteer request

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id` - Update application status
- `GET /api/applications/:id` - Get specific application

### Patrol Management
- `GET /api/patrols` - Get all patrols
- `POST /api/patrols` - Create patrol
- `PUT /api/patrols/:id` - Update patrol
- `GET /api/patrols/analytics` - Patrol analytics
- `DELETE /api/patrols/:id` - Delete patrol

### Protected Areas
- `GET /api/protected-areas` - Get all protected areas
- `POST /api/protected-areas` - Create protected area
- `PUT /api/protected-areas/:id` - Update protected area
- `DELETE /api/protected-areas/:id` - Delete protected area

### User Management
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/verify` - Verify user
- `GET /api/users/profile` - Get user profile

### Dashboard Data
- `GET /api/admin-dashboard` - Admin dashboard data
- `GET /api/ranger-dashboard` - Ranger dashboard data
- `GET /api/researcher-dashboard` - Researcher dashboard data
- `GET /api/volunteer-dashboard` - Volunteer dashboard data

### Analytics
- `GET /api/analytics` - System analytics (admin only)
- `GET /api/analytics/detailed` - Detailed analytics
- `GET /api/analytics/patrol` - Patrol analytics

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Chat & Collaboration
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/messages` - Send message
- `GET /api/collaboration/threads` - Get collaboration threads
- `POST /api/collaboration/threads` - Create collaboration thread

### System Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **CORS Protection** for cross-origin requests
- **Input Validation** and sanitization
- **Rate Limiting** for API endpoints
- **Role-based Access Control** (RBAC)
- **Secure File Upload** with validation
- **Environment Variable** protection
- **HTTPS Enforcement** in production
- **SQL Injection Prevention** (MongoDB)
- **XSS Protection** with input sanitization

## 📊 Performance Optimizations

- **Code Splitting** with React.lazy()
- **Image Optimization** and lazy loading
- **Database Indexing** for faster queries
- **Caching Strategies** for static content
- **Bundle Size Optimization** with Vite
- **CDN Integration** for static assets
- **Compression** for API responses
- **Pagination** for large datasets
- **MongoDB Aggregation** for complex queries
- **React Query Caching** for API responses

## 🧪 Testing Strategy

- **Unit Testing** with Vitest
- **Component Testing** with React Testing Library
- **API Testing** with Postman/Insomnia
- **End-to-End Testing** with Playwright
- **Performance Testing** with Lighthouse
- **Security Testing** with OWASP ZAP

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **MongoDB Connection Error**
   - Check MONGODB_URI in .env file
   - Verify network access in MongoDB Atlas
   - Ensure database user has correct permissions

2. **JWT Token Issues**
   - Verify JWT_SECRET is set in environment
   - Check token expiration settings
   - Ensure proper token format

3. **File Upload Issues**
   - Check multer configuration
   - Verify file size limits
   - Ensure proper file type validation

#### Frontend Issues
1. **API Connection Error**
   - Verify VITE_API_URL in .env file
   - Check CORS settings in backend
   - Ensure backend server is running

2. **Build Errors**
   - Run `npm install --legacy-peer-deps`
   - Clear node_modules and reinstall
   - Check TypeScript configuration

3. **Image Display Issues**
   - Verify image upload endpoints
   - Check image URL format
   - Ensure proper content-type headers

### Performance Issues
1. **Slow Loading**
   - Check database query optimization
   - Verify image compression
   - Review bundle size

2. **Memory Leaks**
   - Check WebSocket connections
   - Verify event listener cleanup
   - Review React component lifecycle

## 🤝 Contributing

We welcome contributions to the EcoRwanda Conservation Portal! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/EcoRwanda-Conservation-Portal.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation

4. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**
   - Provide clear description of changes
   - Include screenshots if UI changes
   - Reference any related issues

### Code Style Guidelines

- **JavaScript/TypeScript**: Use ES6+ features, prefer const/let over var
- **React**: Use functional components with hooks
- **CSS**: Use Tailwind CSS utility classes
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc comments for functions and components

### Testing Guidelines

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Add integration tests for API endpoints
- Test on different browsers and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rwanda Development Board** for conservation guidance
- **Open source community** for amazing tools and libraries
- **Conservation organizations** for domain expertise
- **Volunteers and researchers** for feedback and testing
- **MongoDB Atlas** for database hosting
- **Render.com** for backend hosting
- **Netlify** for frontend hosting

## 📞 Support & Contact

- **Email**: support@ecorwanda.org
- **GitHub Issues**: [Create an issue](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/issues)
- **Documentation**: [Project Wiki](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/discussions)

## 🔄 Changelog

### Version 1.0.0 (Latest)
- ✅ Complete wildlife reporting system with image uploads
- ✅ Multi-role user management system
- ✅ Real-time communication features
- ✅ Comprehensive dashboard analytics
- ✅ Research project management
- ✅ Volunteer request and application system
- ✅ Patrol management and tracking
- ✅ Protected area management
- ✅ Offline functionality support
- ✅ Mobile-responsive design
- ✅ Security and performance optimizations

### Upcoming Features
- 🔄 Advanced analytics and reporting
- 🔄 Mobile app development
- 🔄 AI-powered threat detection
- 🔄 Integration with external conservation databases
- 🔄 Advanced mapping features
- 🔄 Multi-language support

---

**Built with ❤️ for Rwanda's Conservation Efforts** 

*This project aims to support and enhance conservation efforts in Rwanda by providing a comprehensive digital platform for collaboration between all stakeholders in wildlife and environmental protection.* 