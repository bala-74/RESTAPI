const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');

const router = express.Router();

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// POST /students - Add a new student
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { name, rollNumber, department, year } = req.body;

    // Validate that required fields are present in the request body
    if (!name || !rollNumber || !department || year === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, rollNumber, department, year',
      });
    }

    // Check if a student with the same rollNumber already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Student with roll number '${rollNumber}' already exists`,
      });
    }

    // Create and save new student
    const newStudent = new Student({
      name,
      rollNumber,
      department,
      year,
    });

    const savedStudent = await newStudent.save();

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: savedStudent,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }

    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
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
    const students = await Student.find().sort({ createdAt: -1 });

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

    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
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

    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
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

    // If updating rollNumber, verify no OTHER student has it
    if (rollNumber && rollNumber !== student.rollNumber) {
      const duplicateStudent = await Student.findOne({
        rollNumber,
        _id: { $ne: id },
      });
      if (duplicateStudent) {
        return res.status(409).json({
          success: false,
          message: `Student with roll number '${rollNumber}' already exists`,
        });
      }
    }

    // Perform update with validation enabled
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, rollNumber, department, year },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
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

    // Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(id);

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
