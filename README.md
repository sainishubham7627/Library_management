# Library Seat Management System

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on port 27017

## Setup Instructions

### 1. Start MongoDB
Ensure your local MongoDB instance is running. 

### 2. Backend Setup
Navigate to the `backend` folder:
```bash
cd backend
npm install
node createAdmin.js   # This creates the default admin user
npm run dev           # Starts backend server with nodemon
```
Default Admin Credentials:
- **Username:** admin
- **Password:** password123

### 3. Frontend Setup
Navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev           # Starts Vite frontend server
```

Access the frontend application at `http://localhost:5173`.
Login using the admin credentials.
Go to the **Seats** page to initialize the seat layout for the first time.
