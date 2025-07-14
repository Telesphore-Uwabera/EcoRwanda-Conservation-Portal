# EcoRwanda Conservation Portal 🌿

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://ecorwandaconservationportal.netlify.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Live-blue)](https://ecorwanda-portal-eed6gfb3f7ftbkfv.southafricanorth-01.azurewebsites.net)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![CI/CD](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/actions/workflows/azure-node-backend.yml/badge.svg)](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/actions)

## 📚 Table of Contents

- [🚀 Live Deployment](#-live-deployment)
- [🎯 Project Overview](#-project-overview)
  - [🌟 Key Features](#-key-features)
- [🖼️ Screenshots](#️-screenshots)
- [📱 Responsiveness](#-responsiveness)
- [🎥 Video Demo](#-video-demo)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🔑 Environment Variables Reference](#-environment-variables-reference)
- [🚦 Usage](#-usage)
- [🔌 API Endpoints](#-api-endpoints)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [📬 Contact](#-contact)
- [❓ FAQ](#-faq)

A comprehensive **Eco-Volunteer and Research Collaboration Portal** designed to facilitate collaboration between volunteers, researchers, and park rangers in ecological conservation efforts across Rwanda. This platform provides a centralized ecosystem for managing conservation activities, tracking wildlife reports, conducting research, and coordinating volunteer efforts.

## 🚀 Live Deployment

- **Frontend**: [https://ecorwandaconservationportal.netlify.app/](https://ecorwandaconservationportal.netlify.app/)
- **Backend API**: [https://ecorwanda-portal-eed6gfb3f7ftbkfv.southafricanorth-01.azurewebsites.net](https://ecorwanda-portal-eed6gfb3f7ftbkfv.southafricanorth-01.azurewebsites.net)

## 🧪 Demo Login

You can use the following demo credentials to log in as an admin and explore the platform:

- **Email:** `admin@ecorwanda.org`
- **Password:** `91073@Tecy`

> _For demo/testing purposes only. Please do not use for production data._

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
- **Photo evidence upload** with **Cloudinary** storage
- **GPS coordinates capture** for precise location tracking
- **Urgency level classification** (low, medium, high, critical)
- **Report verification workflow** by rangers
- **Status tracking** throughout investigation process
- **Real-time location detection**: When submitting a wildlife report, the system automatically detects the reporter's current location using the browser's geolocation API and fetches a detailed, human-readable address using Mapbox reverse geocoding. This ensures that every report is accurately tagged with the reporter's true location, improving data quality and response effectiveness.

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

## 📱 Responsiveness

The EcoRwanda Conservation Portal is fully responsive and optimized for all device sizes, including desktops, tablets, and mobile phones. The layout, navigation, and data visualizations adapt seamlessly to different screen sizes, ensuring a smooth user experience everywhere.

**Key aspects of responsiveness:**
- Sidebar navigation collapses into a mobile-friendly drawer on small screens.
- Dashboard cards and analytics charts stack vertically for mobile and tablet views.
- Tables, forms, and dialogs are scrollable and touch-friendly.
- All interactive elements are accessible and usable on touch devices.

**Examples of Responsive Design:**

![Mobile: User Role Distribution and Project Status Overview](images/Screenshot%202025-07-04%20154729.png)
*Login form for easy access and readability on mobile devices.*

![Mobile: Login Page](images/Screenshot%202025-07-04%20154807.png)
*Pie chart and bar chart adapt to mobile layout, showing user roles and project statuses clearly on a small screen.*

![Mobile: Patrol Management and Ranger Tools](images/Screenshot%202025-07-04%20154721.png)
*Sidebar collapses into a drawer menu, providing easy navigation and quick access to dashboard sections on mobile.*

![Mobile: Recent Reports and Projects](images/Screenshot%202025-07-04%20154706.png)
*Patrol management actions and ranger tools are presented as large, touch-friendly buttons, optimized for mobile navigation.*

![Mobile: Sidebar Navigation Drawer](images/Screenshot%202025-07-04%20154843.png)
*Recent wildlife reports and available projects are displayed in a scrollable, card-based layout suitable for mobile screens.*

## 🖼️ Screenshots

Below are screenshots of the EcoRwanda Conservation Portal, showcasing various features and pages: 

![Screenshot 2025-07-04 001623](images/Screenshot%202025-07-04%20001623.png)
*Login Page: User authentication for EcoRwanda portal*

![Screenshot 2025-07-04 001722](images/Screenshot%202025-07-04%20001722.png)
*Signup Page: New user registration form*

![Screenshot 2025-07-04 001948](images/Screenshot%202025-07-04%20001948.png)
*Verification Pending: Awaiting admin approval after registration*

![Screenshot 2025-07-04 001904](images/Screenshot%202025-07-04%20001904.png)
*Verification Pending: Awaiting admin approval after registration*

![Screenshot 2025-07-04 002050](images/Screenshot%202025-07-04%20002050.png)
*User Management: Admin registration form and user list*

![Screenshot 2025-07-04 002135](images/Screenshot%202025-07-04%20002135.png)
*Admin Dashboard: Admin view of all users and actions*

![Screenshot 2025-07-04 002205](images/Screenshot%202025-07-04%20002205.png)
*System Analytics: User, report, and patrol statistics overview*

![Screenshot 2025-07-04 002229](images/Screenshot%202025-07-04%20002229.png)
*Admin Communications Hub: Chat, announcements, and collaboration tools*

![Screenshot 2025-07-04 002305](images/Screenshot%202025-07-06%20095623.png)
*Admin Publications: Research publication details and metadata*

![Screenshot 2025-07-04 002335](images/Screenshot%202025-07-04%20002335.png)
*System Settings: Application configuration and general settings*

![Screenshot 2025-07-04 002401](images/Screenshot%202025-07-04%20002401.png)
*Threat Map: Map view of threats by severity and location*

![Screenshot 2025-07-04 002433](images/Screenshot%202025-07-04%20002433.png)
*Admin role: To register new ranger, admin, researcher or volunteer*

![Screenshot 2025-07-04 002501](images/Screenshot%202025-07-04%20002501.png)
*Admin chat space*

![Screenshot 2025-07-04 002546](images/Screenshot%202025-07-04%20002546.png)
*Admin Announcements: Post and manage announcements for users*

![Screenshot 2025-07-04 002616](images/Screenshot%202025-07-04%20002616.png)
*Team Collaboration: Admin view of threads and comments*

![Screenshot 2025-07-04 002719](images/Screenshot%202025-07-04%20002719.png)
*Ranger Dashboard: Patrol management, tools, and pending reports overview*

![Screenshot 2025-07-04 002800](images/Screenshot%202025-07-04%20002800.png)
*Patrol Operations: Ranger view of patrols, objectives, and attendees*

![Screenshot 2025-07-04 002825](images/Screenshot%202025-07-04%20002825.png)
*Verify Wildlife Reports: Ranger review and verification of reports*

![Screenshot 2025-07-04 002907](images/Screenshot%202025-07-04%20002907.png)
*Verify Wildlife Reports: Detailed view and status update for a report*

![Screenshot 2025-07-04 002936](images/Screenshot%202025-07-04%20002936.png)
*Schedule Patrol: Form for scheduling a new patrol*

![Screenshot 2025-07-04 003016](images/Screenshot%202025-07-04%20003016.png)
*Research Dashboard: Active and completed projects overview*

![Screenshot 2025-07-04 003042](images/Screenshot%202025-07-04%20003042.png)
*Research Data Hub: Datasets, research papers, and contributors*

![Screenshot 2025-07-04 003109](images/Screenshot%202025-07-04%20003109.png)
*Research Proposals: Create new research proposal form*

![Screenshot 2025-07-04 003145](images/Screenshot%202025-07-04%20003145.png)
*Volunteer Recruitment Center: Researcher view of volunteer requests and applicants*

![Screenshot 2025-07-04 003215](images/Screenshot%202025-07-04%20003215.png)
*Volunteer Recruitment Center: Researcher view of volunteer requests and applicants*

![Screenshot 2025-07-04 003238](images/Screenshot%202025-07-04%20003238.png)
*Volunteer Request Details: Researcher view of a specific application*

![Screenshot 2025-07-04 003303](images/Screenshot%202025-07-04%20003303.png)
*Volunteer Opportunity Details: Project objectives, skills, and application status*

![Screenshot 2025-07-04 003422](images/Screenshot%202025-07-04%20003422.png)
*Research Analytics: Project status overview (bar chart)*

![Screenshot 2025-07-04 003440](images/Screenshot%202025-07-04%20003440.png)
*Research Analytics: Projects trends (bar chart)Patrol Analytics: Completed, Cancelled and Completed*

![Screenshot 2025-07-04 003521](images/Screenshot%202025-07-04%20003521.png)
*Volunteer Opportunities: Volunteer view of available research projects*

![Screenshot 2025-07-04 003541](images/Screenshot%202025-07-04%20003541.png)
*Volunteer Dashboard: Recent reports and available projects*

![Screenshot 2025-07-04 003610](images/Screenshot%202025-07-04%20003610.png)
*Volunteer Opportunity Details: Project objectives, skills, and application link*

![Screenshot 2025-07-04 003635](images/Screenshot%202025-07-04%20003635.png)
*Submit Wildlife Report: Form for submitting new incident reports*

![Screenshot 2025-07-04 003658](images/Screenshot%202025-07-04%20003658.png)
*Volunteer application status*

![Screenshot 2025-07-04 003722](images/Screenshot%202025-07-04%20003722.png)
*My Reports: Volunteer view of submitted wildlife and conservation reports*

## 🎥 Video Demo

Watch a walkthrough of the EcoRwanda Conservation Portal in action:

**▶️ [EcoRwanda Demo Video (MP4, 21MB)](EcoRwanda%20Demo.mp4)**

*The video demonstrates the platform's main features, including authentication, dashboard analytics, real-time collaboration, and responsive design on both desktop and mobile.*

> **Note:** The video file `EcoRwanda Demo.mp4` is included in this repository for offline viewing. You can open it directly or upload it to your preferred video platform for sharing.

## 🛠️ Technology Stack

### **Backend Technologies**
- **Node.js 18.x** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB 7.0** - NoSQL document database
- **Mongoose 8.15.1** - MongoDB object modeling tool
- **Multer 1.4.4** - File upload middleware (memory storage, binary Buffer in MongoDB)
- **Cloudinary** - Cloud-based image storage and CDN for uploaded photos
- **Nodemailer 7.0.3** - Email sending library
- **ws 8.18.0** - WebSocket support
- **bcryptjs 3.0.2** - Password hashing
- **jsonwebtoken 9.0.2** - JWT authentication
- **dotenv 16.5.0** - Environment variable management
- **cors 2.8.5** - Cross-origin resource sharing
- **axios 1.9.0** - HTTP client

### **Frontend Technologies**
- **React 18.x** (with TypeScript)
- **Vite**
- **Tailwind CSS**

#### **Core Framework & Build Tools**
- **React 18.3.1** - Modern UI library with hooks and functional components
- **TypeScript 5.5.3** - Type-safe JavaScript development
- **Vite 6.2.2** - Fast build tool and development server
- **SWC** - Ultra-fast JavaScript/TypeScript compiler

#### **UI Framework & Styling**
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Material-UI (MUI) 7.1.1** - React component library
- **Lucide React** - Icon toolkit

#### **State Management & Data Fetching**
- **React Query (TanStack Query) 5.56.2** - Server state management
- **React Hook Form 7.53.0** - Performant forms with validation
- **Zod 3.23.8** - TypeScript-first schema validation
- **Axios 1.9.0** - HTTP client for API requests

#### **Routing & Navigation**
- **React Router DOM 6.26.2** - Client-side routing

#### **Maps & Geospatial**
- **react-map-gl 6.1.20** - Mapbox GL JS React components (used in ThreatMap)
- **@react-google-maps/api 2.20.7** - Google Maps integration (used in report forms)
- **Mapbox Geocoding API** - For reverse geocoding (address lookup)

#### **Authentication & Security**
- **Custom JWT-based authentication** (no NextAuth.js)

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

## 📁 Project Structure

```
EcoRwanda-Conservation-Portal-main/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── controllers/
│       │   ├── activityController.js
│       │   ├── adminDashboardController.js
│       │   ├── analyticsController.js
│       │   ├── announcementController.js
│       │   ├── applicationController.js
│       │   ├── authController.js
│       │   ├── chatController.js
│       │   ├── collaborationController.js
│       │   ├── conservationProjectController.js
│       │   ├── dataHubController.js
│       │   ├── notificationController.js
│       │   ├── patrolController.js
│       │   ├── protectedAreaController.js
│       │   ├── rangerDashboardController.js
│       │   ├── reportController.js
│       │   ├── researcherDashboardController.js
│       │   ├── researchProjectController.js
│       │   ├── systemSettingsController.js
│       │   ├── threatController.js
│       │   ├── userManagementController.js
│       │   ├── volunteerDashboardController.js
│       │   └── volunteerRequestController.js
│       ├── middleware/
│       │   └── auth.js
│       ├── models/
│       │   ├── Activity.js
│       │   ├── Announcement.js
│       │   ├── Application.js
│       │   ├── ChatMessage.js
│       │   ├── CollaborationThread.js
│       │   ├── Conservation.js
│       │   ├── ConservationProject.js
│       │   ├── Dataset.js
│       │   ├── Notification.js
│       │   ├── Patrol.js
│       │   ├── ProtectedArea.js
│       │   ├── Ranger.js
│       │   ├── Research.js
│       │   ├── Researcher.js
│       │   ├── ResearchProject.js
│       │   ├── Setting.js
│       │   ├── User.js
│       │   ├── Volunteer.js
│       │   ├── VolunteerRequest.js
│       │   └── WildlifeReport.js
│       ├── routes/
│       │   ├── activities.js
│       │   ├── adminDashboard.js
│       │   ├── analytics.js
│       │   ├── announcements.js
│       │   ├── applicationRoutes.js
│       │   ├── auth.js
│       │   ├── chat.js
│       │   ├── collaboration.js
│       │   ├── conservationProjects.js
│       │   ├── dataHub.js
│       │   ├── notifications.js
│       │   ├── patrolRoutes.js
│       │   ├── patrols.js
│       │   ├── protectedAreaRoutes.js
│       │   ├── rangerDashboard.js
│       │   ├── reports.js
│       │   ├── researcherDashboard.js
│       │   ├── researchProjectRoutes.js
│       │   ├── systemSettings.js
│       │   ├── threats.js
│       │   ├── userManagement.js
│       │   ├── volunteerDashboard.js
│       │   └── volunteerRequests.js
│       ├── scripts/
│       │   └── createSuperUser.js
│       ├── server.js
│       ├── services/
│       │   └── websocketService.js
│       └── utils/
│           ├── activityLogger.js
│           ├── notifications.js
│           └── sendEmail.js
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── netlify.toml
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── public/
│   │   ├── LOGO.png
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   └── src/
│       ├── App.css
│       ├── App.js
│       ├── App.tsx
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── patrol/
│       │   ├── ui/
│       │   └── NotificationDropdown.tsx
│       ├── config/
│       ├── contexts/
│       ├── controllers/
│       ├── hooks/
│       ├── lib/
│       ├── middleware/
│       ├── models/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── index.css
│       ├── main.tsx
│       └── vite-env.d.ts
├── .github/
│   └── workflows/
│       └── azure-node-backend.yml
├── README.md
├── package.json
├── package-lock.json
└── cors.json
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
   git clone https://github.com/username/EcoRwanda-Conservation-Portal.git
   cd EcoRwanda-Conservation-Portal/backend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment configuration**
   Create a `.env` file with:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecorwanda
   PORT=8080
   JWT_SECRET=<jwt_secret_key>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=example@email.com
   EMAIL_PASS=app-password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   By default, the frontend does not include a `.env` file. To run locally, create a `.env` file in the `frontend` directory with:
   ```env
   VITE_API_URL=https://ecorwanda-portal-eed6gfb3f7ftbkfv.southafricanorth-01.azurewebsites.net/api
   ```
   For production, set the `VITE_API_URL` environment variable in the Netlify dashboard.

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment Guide

### Backend Deployment (Azure App Service)

1. Set up Azure App Service and connect the GitHub repository
2. Configure GitHub Actions using the provided `.github/workflows/azure-node-backend.yml` file
3. Add environment variables in the Azure App Service configuration
4. Push to the main branch to trigger automatic deployment
5. Access the API at: https://ecorwanda-portal-eed6gfb3f7ftbkfv.southafricanorth-01.azurewebsites.net

### Frontend Deployment (Netlify)

1. Create a Netlify account and connect the GitHub repository
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Base Directory**: `frontend/`
3. Set the `VITE_API_URL` environment variable in the Netlify dashboard to the Azure backend URL + `/api`
4. Deploy and get the site URL

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account**
2. **Create free cluster**
3. **Configure network access** (IP whitelist)
4. **Create database user**
5. **Get connection string** and update backend environment

## 🔧 Cloudinary Configuration

This project uses [Cloudinary](https://cloudinary.com/) for image uploads and storage. You must set the following environment variables in the backend `.env` file:

```
CLOUDINARY_CLOUD_NAME=cloud-name
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
```

On the frontend, you may also need to provide the unsigned upload preset and cloud name for direct uploads.

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
   git clone https://github.com/username/EcoRwanda-Conservation-Portal.git
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
- **Azure App Service** for backend hosting
- **Netlify** for frontend hosting

## 📞 Contact

- **Email**: t.uwabera@alustudent.com
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

## 🔑 Environment Variables Reference

| Variable                | Location   | Description                                      | Example/Notes                                 |
|------------------------ |----------- |--------------------------------------------------|-----------------------------------------------|
| MONGODB_URI             | Backend    | MongoDB connection string                        | mongodb+srv://user:pass@cluster.mongodb.net/db|
| PORT                    | Backend    | Backend server port                              | 5000                                          |
| JWT_SECRET              | Backend    | JWT secret key                                   | any-random-string                             |
| EMAIL_HOST              | Backend    | SMTP host for email                              | smtp.gmail.com                                |
| EMAIL_PORT              | Backend    | SMTP port                                        | 587                                           |
| EMAIL_USER              | Backend    | Email address for sending mail                    | example@email.com                             |
| EMAIL_PASS              | Backend    | App password for email                            | app-password                                  |
| FRONTEND_URL            | Backend    | URL of frontend for CORS                          | http://localhost:5173                         |
| CLOUDINARY_CLOUD_NAME   | Backend    | Cloudinary cloud name                             | cloud-name                                    |
| CLOUDINARY_API_KEY      | Backend    | Cloudinary API key                                | api-key                                       |
| CLOUDINARY_API_SECRET   | Backend    | Cloudinary API secret                             | api-secret                                    |
| VITE_API_URL            | Frontend   | Base URL for backend API                          | http://localhost:5000/api                     |

*Set these variables in the `.env` files as appropriate for backend and frontend.*

## ❓ FAQ

**Q: I get a 404 error when accessing certain API endpoints.**
A: Double-check the route path and make sure you are using the correct base URL (`/api/researchprojects` not `/api/research-projects`).

**Q: Why do I see 'N/A' or 0 for analytics stats?**
A: This usually means there are no projects or accepted volunteers in the database for the current user. Try creating a project and refreshing the analytics page.

**Q: How do I set up environment variables for local development?**
A: See the Environment Variables Reference table above and create a `.env` file in both backend and frontend directories.

**Q: How do I run tests?**
A: For backend, run `npm run test` in the backend directory. For frontend, run `npm run test` in the frontend directory. Make sure dependencies are installed first.

**Q: How do I deploy to production?**
A: See the Deployment Guide section for Azure (backend) and Netlify (frontend) instructions.


*This project aims to support and enhance conservation efforts in Rwanda by providing a comprehensive digital platform for collaboration between all stakeholders in wildlife and environmental protection.* 

*Here to conserve, Thank you so much!* 
