const http = require('http');
const path = require('path');
const fs = require('fs');

// Use a temporary test database file for isolated testing
const testDbPath = path.join(__dirname, 'test_database.sqlite');
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}
process.env.DB_PATH = testDbPath;
process.env.PORT = '0'; // Ephemeral port

const { initDb, closeDb } = require('./database');
const express = require('express');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Student Management API is running',
  });
});
app.use('/students', studentRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

let server;
let baseUrl;

async function runTests() {
  console.log('--- Starting Student Management API Tests (SQLite) ---');
  await initDb();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (json.status !== 'OK') throw new Error(`Expected status OK, got ${json.status}`);
  });

  // 2. Missing fields on POST
  await test('POST /students rejects missing required fields (400)', async () => {
    const res = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John Doe' }),
    });
    const json = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  // 3. Invalid year on POST
  await test('POST /students rejects invalid year (e.g. 5) with 400', async () => {
    const res = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        rollNumber: 'CS101',
        department: 'CSE',
        year: 5,
      }),
    });
    const json = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  // 4. Create student 1
  let student1Id;
  await test('POST /students creates a student successfully (201)', async () => {
    const res = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson',
        rollNumber: 'CS2026001',
        department: 'Computer Science',
        year: 2,
      }),
    });
    const json = await res.json();
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(json)}`);
    if (!json.success || !json.data || !json.data.id) throw new Error('Invalid response structure');
    if (json.data.name !== 'Alice Johnson') throw new Error('Student name mismatch');
    if (json.data.year !== 2) throw new Error('Student year mismatch');
    student1Id = json.data.id;
  });

  // 5. Unique rollNumber constraint on POST
  await test('POST /students rejects duplicate rollNumber (409)', async () => {
    const res = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Duplicate',
        rollNumber: 'CS2026001',
        department: 'Information Technology',
        year: 3,
      }),
    });
    const json = await res.json();
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}: ${JSON.stringify(json)}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  // 6. Create student 2
  let student2Id;
  await test('POST /students creates a second student successfully (201)', async () => {
    const res = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Smith',
        rollNumber: 'EC2026002',
        department: 'Electronics',
        year: 3,
      }),
    });
    const json = await res.json();
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    student2Id = json.data.id;
  });

  // 7. GET /students
  await test('GET /students retrieves all students (200)', async () => {
    const res = await fetch(`${baseUrl}/students`);
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (json.count !== 2 || json.data.length !== 2) throw new Error(`Expected count 2, got ${json.count}`);
  });

  // 8. GET /students/:id with invalid ID
  await test('GET /students/:id with invalid ID format returns 400', async () => {
    const res = await fetch(`${baseUrl}/students/invalid-id`);
    const json = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (json.message !== 'Invalid student ID format') throw new Error(`Unexpected message: ${json.message}`);
  });

  // 9. GET /students/:id with non-existent ID
  await test('GET /students/:id with non-existent ID returns 404', async () => {
    const res = await fetch(`${baseUrl}/students/9999`);
    const json = await res.json();
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (json.message !== 'Student not found') throw new Error(`Unexpected message: ${json.message}`);
  });

  // 10. GET /students/:id with valid ID
  await test('GET /students/:id retrieves student by ID (200)', async () => {
    const res = await fetch(`${baseUrl}/students/${student1Id}`);
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (json.data.rollNumber !== 'CS2026001') throw new Error('Roll number mismatch');
  });

  // 11. PUT /students/:id with invalid ID
  await test('PUT /students/:id with invalid ID returns 400', async () => {
    const res = await fetch(`${baseUrl}/students/xyz`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 3 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 12. PUT /students/:id with non-existent ID
  await test('PUT /students/:id with non-existent ID returns 404', async () => {
    const res = await fetch(`${baseUrl}/students/9999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 3 }),
    });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 13. PUT /students/:id with invalid year
  await test('PUT /students/:id with invalid year returns 400', async () => {
    const res = await fetch(`${baseUrl}/students/${student1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 0 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 14. PUT /students/:id with duplicate rollNumber
  await test('PUT /students/:id with existing rollNumber of another student returns 409', async () => {
    const res = await fetch(`${baseUrl}/students/${student1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber: 'EC2026002' }),
    });
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
  });

  // 15. PUT /students/:id with valid updates
  await test('PUT /students/:id updates student successfully (200)', async () => {
    const res = await fetch(`${baseUrl}/students/${student1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson Updated',
        year: 4,
      }),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (json.data.name !== 'Alice Johnson Updated') throw new Error('Name not updated');
    if (json.data.year !== 4) throw new Error('Year not updated');
  });

  // 16. DELETE /students/:id with invalid ID
  await test('DELETE /students/:id with invalid ID returns 400', async () => {
    const res = await fetch(`${baseUrl}/students/invalid`);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 17. DELETE /students/:id with non-existent ID
  await test('DELETE /students/:id with non-existent ID returns 404', async () => {
    const res = await fetch(`${baseUrl}/students/8888`, {
      method: 'DELETE',
    });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 18. DELETE /students/:id with valid ID
  await test('DELETE /students/:id deletes student successfully (200)', async () => {
    const res = await fetch(`${baseUrl}/students/${student1Id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (json.data.id !== student1Id) throw new Error('Deleted ID mismatch');
  });

  // 19. Verify deleted student is gone
  await test('GET /students/:id on deleted student returns 404', async () => {
    const res = await fetch(`${baseUrl}/students/${student1Id}`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 20. Unknown route
  await test('GET /unknown-route returns 404', async () => {
    const res = await fetch(`${baseUrl}/non-existent`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // Cleanup
  await new Promise((resolve) => server.close(resolve));
  await closeDb();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
