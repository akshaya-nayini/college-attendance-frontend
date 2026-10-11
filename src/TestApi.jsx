
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  "https://college-attendance-backend-i50d.onrender.com/api/attendance";

function API() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("ECE");
  const [year, setYear] = useState("3rd Year");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  async function loadAttendance() {
    try {
      const response = await axios.get(API_URL);
      const records = response.data;
      const filteredRecords = records.filter(
        (record) => record.date === selectedDate
      );

      const uniqueStudents = [
        ...new Map(
          filteredRecords.map((record) => [
            record.rollNumber,
            {
              name: record.studentName,
              rollNumber: record.rollNumber,
              department: "ECE",
              year: "3rd Year",
              status: record.status,
            },
          ])
        ).values(),
      ];

      setStudents(uniqueStudents);
    } catch (error) {
      console.error("Load error:", error);
      setMessage("Could not load attendance. Check backend.");
    }
  }

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  async function addStudent(event) {
    event.preventDefault();

    if (!name.trim() || !rollNumber.trim()) {
      setMessage("Enter student name and roll number.");
      return;
    }

    if (students.some((s) => s.rollNumber === rollNumber.trim())) {
      setMessage("This roll number already exists for this date.");
      return;
    }

    setStudents((previous) => [
      ...previous,
      {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department,
        year,
        status: "Not Marked",
      },
    ]);

    setMessage("Student added. Now mark attendance to save it.");
    setName("");
    setRollNumber("");
  }

  async function markAttendance(student, status) {
    try {
      await axios.post(API_URL, {
        rollNumber: student.rollNumber,
        studentName: student.name,
        date: selectedDate,
        status,
      });

      setMessage("Attendance saved successfully!");
      await loadAttendance();
    } catch (error) {
      console.error("Attendance error:", error);
      setMessage(
        "Save failed: " +
          (error.response?.status || error.message)
      );
    }
  }

  async function checkBackend() {
    try {
      await axios.get(API_URL);
      setMessage("Backend connected successfully!");
    } catch (error) {
      setMessage("Backend connection failed: " + error.message);
    }
  }

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: "30px",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h1>College Attendance System</h1>
      <p>Manage student details and daily attendance.</p>

      <button onClick={checkBackend}>Check Backend Connection</button>

      <h2>Add Student</h2>
      <form onSubmit={addStudent}>
        <p>
          <label>Student Name: </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </p>

        <p>
          <label>Roll Number: </label>
          <input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Enter roll number"
          />
        </p>

        <p>
          <label>Department: </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>ECE</option>
            <option>CSE</option>
            <option>EEE</option>
            <option>Mechanical</option>
            <option>Civil</option>
          </select>
        </p>

        <p>
          <label>Year: </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </select>
        </p>

        <button type="submit">Add Student</button>
      </form>

      {message && <p>{message}</p>}

      <h2>Student Attendance Records</h2>
      <div style={{ marginBottom: "15px" }}>
        <label>Select Attendance Date: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Year</th>
              <th>Status</th>
              <th>Mark Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="6">No attendance records for this date.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.rollNumber}>
                  <td>{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.department}</td>
                  <td>{student.year}</td>
                  <td>{student.status}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => markAttendance(student, "Present")}
                    >
                      Present
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => markAttendance(student, "Absent")}
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default API;
