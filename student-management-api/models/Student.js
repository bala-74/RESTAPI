const { dbRun, dbGet, dbAll } = require('../database');

// Student Model providing CRUD operations using SQLite
const Student = {
  // Create and insert a new student record
  async create({ name, rollNumber, department, year }) {
    const trimmedName = name.trim();
    const trimmedRoll = rollNumber.trim();
    const trimmedDept = department.trim();
    const numYear = Number(year);

    const result = await dbRun(
      `INSERT INTO students (name, rollNumber, department, year, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [trimmedName, trimmedRoll, trimmedDept, numYear]
    );

    return await this.findById(result.lastID);
  },

  // Retrieve all student records (newest first)
  async findAll() {
    return await dbAll(`SELECT * FROM students ORDER BY createdAt DESC, id DESC`);
  },

  // Retrieve a single student by numeric ID
  async findById(id) {
    return await dbGet(`SELECT * FROM students WHERE id = ?`, [Number(id)]);
  },

  // Find a student by rollNumber
  async findByRollNumber(rollNumber) {
    if (!rollNumber) return null;
    return await dbGet(`SELECT * FROM students WHERE rollNumber = ?`, [rollNumber.trim()]);
  },

  // Update an existing student's details
  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const name = updates.name !== undefined ? updates.name.trim() : existing.name;
    const rollNumber = updates.rollNumber !== undefined ? updates.rollNumber.trim() : existing.rollNumber;
    const department = updates.department !== undefined ? updates.department.trim() : existing.department;
    const year = updates.year !== undefined ? Number(updates.year) : existing.year;

    await dbRun(
      `UPDATE students 
       SET name = ?, rollNumber = ?, department = ?, year = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, rollNumber, department, year, Number(id)]
    );

    return await this.findById(id);
  },

  // Delete a student by numeric ID
  async delete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await dbRun(`DELETE FROM students WHERE id = ?`, [Number(id)]);
    return existing;
  },

  // Compatibility helpers
  async find() {
    return await this.findAll();
  },

  async findOne(query) {
    if (query.rollNumber) return await this.findByRollNumber(query.rollNumber);
    if (query.id || query._id) return await this.findById(query.id || query._id);
    return null;
  },

  async findByIdAndUpdate(id, updates) {
    return await this.update(id, updates);
  },

  async findByIdAndDelete(id) {
    return await this.delete(id);
  },
};

module.exports = Student;
