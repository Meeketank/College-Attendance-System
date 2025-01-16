const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Database connection
const db = new sqlite3.Database('./attendance.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to SQLite database.');
});

// Routes

// Add Student
app.post('/add-student', (req, res) => {
    const { name, division, branch, student_id } = req.body;

    // Ensure all required fields are provided
    if (!name || !division || !branch || !student_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert student into the database
    db.run(
        `INSERT INTO students (name, division, branch, student_id) VALUES (?, ?, ?, ?)`,
        [name, division, branch, student_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            } else {
                return res.json({ id: this.lastID, message: 'Student added successfully' });
            }
        }
    );
});

// Get Students
app.get('/students', (req, res) => {
    db.all(`SELECT * FROM students`, [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// Mark Attendance
app.post('/mark-attendance', (req, res) => {
    const { student_id, date, status } = req.body;
    const month = new Date(date).toLocaleString('default', { month: 'long' }); // Extract month name

    db.run(
        `INSERT INTO attendance (student_id, date, status, month) VALUES (?, ?, ?, ?)`,
        [student_id, date, status, month],
        function (err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ id: this.lastID });
        }
    );
});


app.get('/attendance-report', (req, res) => {
    db.all(
        `SELECT students.name, students.division, attendance.month,
        COUNT(CASE WHEN attendance.status = 'Present' THEN 1 END) as present_days,
        COUNT(CASE WHEN attendance.status = 'Absent' THEN 1 END) as absent_days
        FROM students
        LEFT JOIN attendance ON students.id = attendance.student_id
        GROUP BY students.id, attendance.month
        ORDER BY students.name, attendance.month`,
        [],
        (err, rows) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json(rows);
        }
    );
});


// Get Divisions based on Branch
app.get('/divisions/:branch', (req, res) => {
    const branch = req.params.branch;
    db.all(`SELECT DISTINCT division FROM students WHERE branch = ?`, [branch], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows); // Send list of divisions for the selected branch
    });
});

// Delete a student by ID
// Delete a student by roll number (student ID)
app.delete('/delete-student/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    // Delete attendance records linked to the student first
    db.run(`DELETE FROM attendance WHERE student_id = ?`, [studentId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete the student from the students table
        db.run(`DELETE FROM students WHERE student_id = ?`, [studentId], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                return res.status(404).json({ error: 'Student not found' });
            } else {
                return res.json({ message: 'Student deleted successfully' });
            }
        });
    });
});




// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
