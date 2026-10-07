const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

// Helper function to validate positive integer ID
const isValidId = (id) => {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
};

// ==========================================
// POST /students - Add a new student
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { name, rollNumber, department, year } = req.body;

    // Validate that required fields are present in the request body
    if (
      !name ||
      !rollNumber ||
      !department ||
      year === undefined ||
      year === null ||
      typeof name !== 'string' ||
      name.trim() === '' ||
      typeof rollNumber !== 'string' ||
      rollNumber.trim() === '' ||
      typeof department !== 'string' ||
      department.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, rollNumber, department, year',
      });
    }

    // Validate year range (between 1 and 4)
    const numYear = Number(year);
    if (!Number.isInteger(numYear) || numYear < 1 || numYear > 4) {
      return res.status(400).json({
        success: false,
        message: 'Year must be an integer between 1 and 4',
      });
    }

    // Check if a student with the same rollNumber already exists
    const existingStudent = await Student.findByRollNumber(rollNumber);
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Student with roll number '${rollNumber.trim()}' already exists`,
      });
    }

    // Create and save new student in SQLite
    const savedStudent = await Student.create({
      name,
      rollNumber,
      department,
      year: numYear,
    });

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: savedStudent,
    });
  } catch (error) {
    // Handle SQLite unique constraint error
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        message: 'A student with this roll number already exists',
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
});

// ==========================================
// GET /students - Get all students
// ==========================================
router.get('/', async (req, res) => {
  try {
    const students = await Student.findAll();

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message,
    });
  }
});

// ==========================================
// GET /students/:id - Get a student by ID
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const student = await Student.findById(id);

    // Return 404 if student is not found
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student',
      error: error.message,
    });
  }
});

// ==========================================
// PUT /students/:id - Update student details
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNumber, department, year } = req.body;

    // Validate ID format
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    // Check if student exists before updating
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Validate year if provided
    if (year !== undefined) {
      const numYear = Number(year);
      if (!Number.isInteger(numYear) || numYear < 1 || numYear > 4) {
        return res.status(400).json({
          success: false,
          message: 'Year must be an integer between 1 and 4',
        });
      }
    }

    // Validate string fields if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Student name cannot be empty',
      });
    }

    if (rollNumber !== undefined && (typeof rollNumber !== 'string' || rollNumber.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Roll number cannot be empty',
      });
    }

    if (department !== undefined && (typeof department !== 'string' || department.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Department cannot be empty',
      });
    }

    // If updating rollNumber, verify no OTHER student has it
    if (rollNumber && rollNumber.trim() !== student.rollNumber) {
      const duplicateStudent = await Student.findByRollNumber(rollNumber);
      if (duplicateStudent && duplicateStudent.id !== Number(id)) {
        return res.status(409).json({
          success: false,
          message: `Student with roll number '${rollNumber.trim()}' already exists`,
        });
      }
    }

    // Perform update in SQLite
    const updatedStudent = await Student.update(id, { name, rollNumber, department, year });

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    // Handle unique constraint error
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        message: 'A student with this roll number already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
});

// ==========================================
// DELETE /students/:id - Delete a student
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const deletedStudent = await Student.delete(id);

    // Return 404 if student does not exist
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: deletedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
});

module.exports = router;
