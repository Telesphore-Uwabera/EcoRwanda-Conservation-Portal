# Eco-Volunteer-Research-Collaboration-Portal

This project is an Eco-Volunteer and Research Collaboration Portal, designed to facilitate collaboration between volunteers, researchers, and park rangers in ecological conservation efforts. It provides a centralized platform for managing users, tracking activities, and accessing relevant data.

## Project Structure

- `backend/`: Contains the Node.js Express server, API endpoints, and database models.
- `frontend/`: Contains the React application for the user interface.

## Features

- **User Authentication:** Secure login and registration for various roles (Administrator, Volunteer, Researcher, Ranger).
- **Role-Based Access Control:** Different dashboards and functionalities based on user roles.
- **Admin Dashboard:** Overview of system statistics, user management, and user registration by admin.
- **Volunteer Dashboard:** Personalized greetings and data relevant to volunteers.
- **Researcher Dashboard:** Personalized greetings and data relevant to researchers.
- **Ranger Dashboard:** Personalized greetings and data relevant to rangers.
- **User Management (Admin):** Ability to view, update roles, and delete user accounts.
- **API Integration:** Secure communication between frontend and backend.

## Technologies Used

### Frontend
- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast frontend build tool.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Material-UI (MUI):** A comprehensive suite of UI tools for React.
- **React Router DOM:** For declarative routing in React applications.
- **Axios:** For making HTTP requests.

### Backend
- **Node.js:** A JavaScript runtime.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB:** A NoSQL database.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **bcryptjs:** For hashing passwords.
- **jsonwebtoken:** For implementing JSON Web Tokens for authentication.
- **dotenv:** For loading environment variables from a `.env` file.
- **Nodemon:** A tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- MongoDB (Community Server or Atlas)
- MongoDB Compass (for database inspection and initial admin setup)

### 1. Backend Setup

Navigate to the `backend` directory, install dependencies, and start the server.

```bash
# Navigate to the backend directory
cd backend

# Install backend dependencies
npm install

# Create a .env file in the backend directory with your MongoDB URI and PORT
# Example .env content:
# MONGODB_URI=mongodb://localhost:27017/eco_volunteer_portal
# PORT=5000
# JWT_SECRET=your_jwt_secret_key (important for authentication)

# Start the backend server (development mode with nodemon)
npm run dev
```
The backend server should now be running on `http://localhost:5000`.

### 2. Frontend Setup

In a new terminal, navigate to the `frontend` directory, install dependencies, and start the development server.

```bash
# Navigate to the frontend directory (if you're in the project root)
cd frontend

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```
The frontend application should now be accessible at `http://localhost:3000` (or another port if configured differently by Vite).

**Important Note on API Configuration:**
Ensure that `frontend/src/config/api.ts` has `API_BASE_URL` set to `/api`. This allows the Vite development server to proxy API requests to the backend, preventing `ERR_CONNECTION_REFUSED` errors.
```typescript
// frontend/src/config/api.ts
const API_BASE_URL = '/api';
```

### 3. Database Connection and Initial Administrator Setup

The backend connects to MongoDB using the `MONGODB_URI` specified in your `backend/.env` file. The default database name used in the backend is `eco_volunteer_portal`.

**Creating the Initial Administrator (Superuser):**

The public registration portal is designed for 'volunteer' and 'researcher' roles. To create the first 'administrator' account, you need to insert it directly into your MongoDB database.

1.  **Generate a Hashed Password:**
    Open a terminal, navigate to the `backend` directory, and run the following command to generate a bcrypt hash for your desired administrator password:
    ```bash
    cd backend
    node -e "require('bcryptjs').hash('your_strong_password', 10).then(hash => console.log(hash));"
    ```
    Replace `'your_strong_password'` with your actual password. Copy the output (the long hash string).

2.  **Insert Administrator Document via MongoDB Compass:**
    *   Open MongoDB Compass and connect to your local MongoDB instance using the URI: `mongodb://localhost:27017/eco_volunteer_portal`.
    *   Navigate to the `eco_volunteer_portal` database.
    *   Select or create the `users` collection.
    *   Click "ADD DATA" -> "Insert Document".
    *   Switch to "JSON View" (the `{}` icon) and paste the following JSON, replacing placeholders with your details and the **hashed password** you just generated:
        ```json
        {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com",
          "password": "YOUR_GENERATED_HASH_HERE",
          "role": "administrator",
          "organization": "Admin Org",
          "location": "Admin Location",
          "verified": true,
          "createdAt": { "$date": "2024-07-20T00:00:00.000Z" }
        }
        ```
        Ensure the `createdAt` field uses `{"$date": "ISO_DATE_STRING"}` format for proper BSON date type.
    *   Click "INSERT".

### 4. Registering Volunteers and Researchers via Portal

Once your backend is running and connected, you can register new 'volunteer' and 'researcher' accounts directly through the frontend's signup page (`http://localhost:3000/auth/signup`).

### 5. Login through the Portal

All users (administrators, researchers, volunteers, and park rangers if created by an admin) can log in through the main login portal at `http://localhost:3000/auth/login` using their registered email and password.

---
**Note on Password Hashing:** If you encounter "Invalid email or password" errors after manually inserting users, it's often due to discrepancies in bcrypt hashing. The recommended approach for an initial admin is direct DB insertion, and for other roles (and subsequent admins), use the application's own registration/admin tools to ensure correct hashing.

**Troubleshooting `&&` in PowerShell:**
If you're using PowerShell and encounter errors with commands like `cd backend && npm start`, you need to run them separately:
```powershell
cd backend
npm start
``` 