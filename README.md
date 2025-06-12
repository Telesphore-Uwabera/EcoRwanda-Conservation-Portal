# Eco-Volunteer-Research-Collaboration-Portal

[GitHub Repository](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/)

This project is an Eco-Volunteer and Research Collaboration Portal, designed to facilitate collaboration between volunteers, researchers, and park rangers in ecological conservation efforts. It provides a centralized platform for managing users, tracking activities, and accessing relevant data.

## Project Structure

- `backend/`: Contains the Node.js Express server, API endpoints, and database models.
- `frontend/`: Contains the React application for the user interface.

## User Guides

### Administrator Guide

#### User Management
1. **Viewing Users**
   - Navigate to the Admin Dashboard
   - Click on "User Management" in the sidebar
   - View all registered users in a table format
   - Use filters to sort by role, verification status, or search by name/email

2. **Creating New Users**
   - Click "Register New User" button
   - Fill in required fields:
     - First Name
     - Last Name
     - Email
     - Role (Administrator, Ranger, Researcher, Volunteer)
     - Organization
     - Location
   - Click "Register" to create the account

3. **Verifying Users**
   - Click "View Profile" on any user
   - Review user details
   - Use the verification toggle to approve/reject user accounts
   - Verification status is updated immediately

4. **Managing User Roles**
   - Access user profile
   - Use the role selector to change user roles
   - Changes take effect immediately

### Volunteer Guide

#### Dashboard
1. **Overview**
   - View total reports submitted
   - Track active projects
   - Monitor recent activities

2. **Submitting Reports**
   - Click "Submit Report" in the sidebar
   - Fill in report details:
     - Title
     - Category (Poaching, Habitat Destruction, etc.)
     - Urgency Level
     - Location (Select from predefined list or use GPS)
     - Detailed Description
     - Upload photos (up to 5, max 10MB each)
   - Click "Submit Report" to save

3. **Viewing Reports**
   - Access "My Reports" from sidebar
   - View all submitted reports
   - Filter by status or date
   - Click on any report to view details

4. **Project Participation**
   - Browse available projects
   - View project details and requirements
   - Apply to participate in projects
   - Track project progress

### Researcher Guide

#### Dashboard
1. **Overview**
   - View active research projects
   - Track data submissions
   - Monitor collaboration requests

2. **Research Data Hub**
   - Access research papers
   - View available datasets
   - Download research materials
   - Track download statistics

3. **Publishing Findings**
   - Click "Publish Findings"
   - Fill in research details:
     - Title
     - Abstract
     - Methodology
     - Results
     - Upload supporting documents
   - Submit for review

4. **Requesting Volunteers**
   - Access "Request Volunteers"
   - Create new volunteer requests:
     - Project description
     - Required skills
     - Duration
     - Location
   - Track volunteer applications

### Ranger Guide

#### Dashboard
1. **Overview**
   - View total patrols conducted
   - Track wildlife reports
   - Monitor threat levels

2. **Patrol Management**
   - Schedule new patrols
   - Record patrol data:
     - Date and time
     - Location
     - Team members
     - Observations
   - Export patrol reports

3. **Threat Map**
   - View real-time threat locations
   - Track wildlife incidents
   - Monitor conservation areas
   - Update threat status

4. **Report Management**
   - Review volunteer submissions
   - Verify incident reports
   - Update report status
   - Assign response teams

## Technical Setup Guide

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- MongoDB Atlas Account
- MongoDB Compass (Optional)

### Backend Setup

1. **Installation**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file with:
   ```
   MONGODB_URI=mongodb_uri
   PORT=5000
   JWT_SECRET=jwt_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=email
   EMAIL_PASS=app_password
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Installation**
   ```bash
   cd frontend
   npm install
   ```

2. **Configuration**
   Ensure `frontend/src/config/api.ts` has:
   ```typescript
   export const API_BASE_URL = '/api';
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Initial Administrator Setup

1. **Generate Password Hash**
   ```bash
   cd backend
   node -e "require('bcryptjs').hash('password', 10).then(hash => console.log(hash));"
   ```

2. **Create Admin User**
   - Use MongoDB Compass or Atlas UI
   - Insert document into `users` collection:
   ```json
   {
     "firstName": "Admin",
     "lastName": "User",
     "email": "admin@ecorwanda.org",
     "password": "generated_hash",
     "role": "administrator",
     "organization": "RWANDA DEVELOPMENT BOARD",
     "location": "KIGALI",
     "verified": true,
     "createdAt": {"$date": "2024-03-14T00:00:00.000Z"}
   }
   ```

## Technologies Used

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Material-UI
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- Nodemon

## Troubleshooting

1. **Login Issues**
   - Verify email and password
   - Check user verification status
   - Ensure correct role assignment

2. **API Connection Errors**
   - Verify backend server is running
   - Check API_BASE_URL configuration
   - Ensure proper proxy settings

3. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure proper database permissions

4. **File Upload Issues**
   - Check file size limits
   - Verify supported file types
   - Ensure proper storage configuration

## Security Best Practices

1. **Password Management**
   - Use strong, unique passwords
   - Enable two-factor authentication
   - Regular password updates

2. **Data Protection**
   - Regular backups
   - Secure file storage
   - Access control implementation

3. **API Security**
   - JWT token validation
   - Rate limiting
   - Input validation

## Support

For technical support or questions, please contact:
- Email: support@ecorwanda.org
- GitHub Issues: [Create an issue](https://github.com/Telesphore-Uwabera/EcoRwanda-Conservation-Portal/issues) 