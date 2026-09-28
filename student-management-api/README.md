# Student Management REST API

A clean and simple RESTful API for managing student records, built with **Node.js**, **Express.js**, and **MongoDB** with **Mongoose**.

---

## 📌 Project Overview

This API allows you to perform full CRUD (Create, Read, Update, Delete) operations on student information. It includes schema-level validation, unique constraints on student roll numbers, and clean error handling for database operations and invalid inputs.

---

## 🛠 Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **MongoDB** - NoSQL document database
- **Mongoose** - Object Data Modeling (ODM) library for MongoDB
- **dotenv** - Environment variable management

---

## 📁 Project Structure

```text
student-management-api/
├── models/
│   └── Student.js          # Mongoose schema and model
├── routes/
│   └── studentRoutes.js    # Express route handlers for /students
├── .env                    # Environment configuration (PORT, MONGO_URI)
├── .gitignore              # Files to ignore in git (node_modules, .env)
├── package.json            # Project dependencies and npm scripts
├── server.js               # Entry point, Express configuration & MongoDB connection
└── README.md               # Documentation
```

---

## ⚙️ How to Install

1. Navigate to the project directory:
   ```bash
   cd student-management-api
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

---

## 🔧 How to Configure MongoDB

Create or update the `.env` file in the root of the project:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_db
```

### Options for MongoDB:
1. **Local MongoDB**:
   - Ensure the MongoDB daemon (`mongod`) is running on your local machine.
   - Default URI: `mongodb://127.0.0.1:27017/student_db`
2. **MongoDB Atlas (Cloud)**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Replace `MONGO_URI` with your connection string:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_db?retryWrites=true&w=majority
     ```

---

## 🚀 How to Run

### Start in Production Mode:
```bash
npm start
```

### Start in Development Mode (Auto-reload with nodemon):
```bash
npm run dev
```

The server will start listening at `http://localhost:5000`.

---

## 📡 API Endpoints

| Method | Endpoint         | Description                         | Success Status | Error Status |
|--------|------------------|-------------------------------------|----------------|--------------|
| `GET`  | `/health`        | Health check confirmation           | `200 OK`       | -            |
| `POST` | `/students`      | Add a new student                   | `201 Created`  | `400 / 409`  |
| `GET`  | `/students`      | Retrieve all students               | `200 OK`       | `500`        |
| `GET`  | `/students/:id`  | Retrieve a single student by ID     | `200 OK`       | `400 / 404`  |
| `PUT`  | `/students/:id`  | Update a student's details by ID    | `200 OK`       | `400 / 404 / 409` |
| `DELETE`| `/students/:id` | Delete a student by ID              | `200 OK`       | `400 / 404`  |

---

## 📝 Student Data Model

| Field        | Type   | Rules                                   |
|--------------|--------|-----------------------------------------|
| `name`       | String | Required, trimmed                       |
| `rollNumber` | String | Required, unique, trimmed               |
| `department` | String | Required, trimmed                       |
| `year`       | Number | Required, integer between `1` and `4`   |

---

## 📬 Sample JSON Requests & Responses

### 1. Health Check
- **Request:** `GET http://localhost:5000/health`
- **Response:**
  ```json
  {
    "status": "OK",
    "message": "Student Management API is running"
  }
  ```

### 2. Create a Student
- **Request:** `POST http://localhost:5000/students`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "rollNumber": "CS2026001",
    "department": "Computer Science",
    "year": 3
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Student created successfully",
    "data": {
      "_id": "673f8a9e2b1c4e001f3a9b12",
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 3,
      "createdAt": "2026-09-28T14:00:00.000Z",
      "updatedAt": "2026-09-28T14:00:00.000Z",
      "__v": 0
    }
  }
  ```

### 3. Get All Students
- **Request:** `GET http://localhost:5000/students`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "673f8a9e2b1c4e001f3a9b12",
        "name": "Jane Doe",
        "rollNumber": "CS2026001",
        "department": "Computer Science",
        "year": 3,
        "createdAt": "2026-09-28T14:00:00.000Z",
        "updatedAt": "2026-09-28T14:00:00.000Z",
        "__v": 0
      }
    ]
  }
  ```

### 4. Update Student Details
- **Request:** `PUT http://localhost:5000/students/673f8a9e2b1c4e001f3a9b12`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "year": 4
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student updated successfully",
    "data": {
      "_id": "673f8a9e2b1c4e001f3a9b12",
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 4,
      "createdAt": "2026-09-28T14:00:00.000Z",
      "updatedAt": "2026-09-28T14:05:00.000Z",
      "__v": 0
    }
  }
  ```

### 5. Delete a Student
- **Request:** `DELETE http://localhost:5000/students/673f8a9e2b1c4e001f3a9b12`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student deleted successfully",
    "data": {
      "_id": "673f8a9e2b1c4e001f3a9b12",
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 4
    }
  }
  ```
