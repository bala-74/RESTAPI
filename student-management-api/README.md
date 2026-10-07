# Student Management REST API

A clean and simple RESTful API for managing student records, built with **Node.js**, **Express.js**, and **SQLite** (using `sqlite3`).

---

## 📌 Project Overview

This API allows you to perform full CRUD (Create, Read, Update, Delete) operations on student information stored in a local SQLite database file. It includes input validation, unique constraints on student roll numbers, year range checks, and clean error handling for database operations and invalid inputs.

---

## 🛠 Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **SQLite** (`sqlite3`) - Embedded, zero-configuration relational database engine
- **dotenv** - Environment variable management

---

## 📁 Project Structure

```text
student-management-api/
├── database.js             # SQLite connection, query helpers, and table auto-creation
├── database.sqlite         # Local SQLite database file (created automatically)
├── models/
│   └── Student.js          # Student data access model with CRUD operations
├── routes/
│   └── studentRoutes.js    # Express route handlers for /students
├── test.js                 # Automated CRUD and validation tests
├── .env                    # Environment configuration (PORT, DB_PATH)
├── .gitignore              # Files to ignore in git (node_modules, .env, *.sqlite)
├── package.json            # Project dependencies and npm scripts
├── server.js               # Application entry point & Express configuration
└── README.md               # Documentation
```

---

## ⚙️ How to Install

1. Navigate to the project directory:
   ```bash
   cd student-management-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🔧 Environment Configuration

The application uses a `.env` file in the `student-management-api` root folder:

```env
PORT=5000
DB_PATH=./database.sqlite
```

- **`PORT`**: Port number for the Express server (defaults to `5000`).
- **`DB_PATH`**: Path to the SQLite database file (defaults to `./database.sqlite`). The database file and `students` table are created automatically on server startup if they do not already exist.

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

### Run Automated Tests:
```bash
npm test
```

---

## 📡 API Endpoints

| Method   | Endpoint        | Description                         | Success Status | Error Status       |
|----------|-----------------|-------------------------------------|----------------|--------------------|
| `GET`    | `/health`       | Health check confirmation           | `200 OK`       | -                  |
| `POST`   | `/students`     | Add a new student                   | `201 Created`  | `400 / 409 / 500`  |
| `GET`    | `/students`     | Retrieve all students               | `200 OK`       | `500`              |
| `GET`    | `/students/:id` | Retrieve a single student by ID     | `200 OK`       | `400 / 404 / 500`  |
| `PUT`    | `/students/:id` | Update a student's details by ID    | `200 OK`       | `400 / 404 / 409`  |
| `DELETE` | `/students/:id` | Delete a student by ID              | `200 OK`       | `400 / 404 / 500`  |

---

## 📝 Student Data Model

| Field        | Type    | Rules                                  |
|--------------|---------|----------------------------------------|
| `id`         | Integer | Primary key, auto-incremented          |
| `name`       | String  | Required, non-empty, trimmed           |
| `rollNumber` | String  | Required, unique, trimmed              |
| `department` | String  | Required, non-empty, trimmed           |
| `year`       | Integer | Required, integer between `1` and `4`  |
| `createdAt`  | String  | Timestamp generated on creation        |
| `updatedAt`  | String  | Timestamp updated on changes           |

---

## 📬 Sample JSON Requests & Responses

### 1. Health Check
- **Request:** `GET http://localhost:5000/health`
- **Response (200 OK):**
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
      "id": 1,
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 3,
      "createdAt": "2026-10-07 14:30:00",
      "updatedAt": "2026-10-07 14:30:00"
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
        "id": 1,
        "name": "Jane Doe",
        "rollNumber": "CS2026001",
        "department": "Computer Science",
        "year": 3,
        "createdAt": "2026-10-07 14:30:00",
        "updatedAt": "2026-10-07 14:30:00"
      }
    ]
  }
  ```

### 4. Get a Single Student by ID
- **Request:** `GET http://localhost:5000/students/1`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 3,
      "createdAt": "2026-10-07 14:30:00",
      "updatedAt": "2026-10-07 14:30:00"
    }
  }
  ```
- **Response if Invalid ID (`GET /students/abc` - 400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Invalid student ID format"
  }
  ```
- **Response if Not Found (`GET /students/999` - 404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Student not found"
  }
  ```

### 5. Update Student Details
- **Request:** `PUT http://localhost:5000/students/1`
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
      "id": 1,
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 4,
      "createdAt": "2026-10-07 14:30:00",
      "updatedAt": "2026-10-07 14:35:00"
    }
  }
  ```

### 6. Delete a Student
- **Request:** `DELETE http://localhost:5000/students/1`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student deleted successfully",
    "data": {
      "id": 1,
      "name": "Jane Doe",
      "rollNumber": "CS2026001",
      "department": "Computer Science",
      "year": 4,
      "createdAt": "2026-10-07 14:30:00",
      "updatedAt": "2026-10-07 14:35:00"
    }
  }
  ```

---

## 🛑 Validation and Error Handling Summary

- **400 Bad Request**:
  - Missing any of the required fields (`name`, `rollNumber`, `department`, `year`) when creating a student.
  - Supplying empty string values for `name`, `rollNumber`, or `department`.
  - Supplying a `year` value outside of the integer range `1` to `4`.
  - Non-numeric or non-positive integer `:id` parameters.
- **404 Not Found**:
  - Target `:id` does not exist in the database.
  - Route not found.
- **409 Conflict**:
  - `rollNumber` already exists when creating or updating.
