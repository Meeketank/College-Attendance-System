-- Create Professors table
CREATE TABLE IF NOT EXISTS professors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Create Students table with branch and student_id
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    division TEXT NOT NULL,
    branch TEXT NOT NULL,
    student_id TEXT UNIQUE NOT NULL
);

-- Create Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    month TEXT NOT NULL,
    status TEXT NOT NULL,
    student_id INTEGER NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id)
);



-- DROP TABLE students
-- DROP TABLE attendance
-- DROP TABLE professors