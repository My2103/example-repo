// index.js
const http = require('http');
const db = require('./app');  // Import the connection from app.js

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/index' && req.method === 'GET') {
    // Query to fetch courses and terms with start and end times
    const queryCourses = 'SELECT Course_ID, Course_name FROM Course';
    const queryTerms = 'SELECT Term_ID, Term_name, Term_starttime, Term_endtime FROM Term'; // Include start and end times

    // Execute both queries
    db.query(queryCourses, (err, courseResults) => {
      if (err) {
        console.error('Error fetching courses:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      db.query(queryTerms, (err, termResults) => {
        if (err) {
          console.error('Error fetching terms:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        // Start building the HTML
        let html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>University Registration Form</title>
            <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
              }
              .form-container {
                  max-width: 600px;
                  margin: auto;
                  padding: 20px;
                  border: 1px solid #ccc;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .form-group {
                  margin-bottom: 15px;
              }
              .form-group label {
                  display: block;
                  margin-bottom: 5px;
              }
              .form-group input, .form-group select, .form-group button {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
              }
              input[type="checkbox"] {
                  width: auto;
              }
              .form-group button {
                  background-color: #007BFF;
                  color: #fff;
                  border: none;
                  cursor: pointer;
              }
              .form-group button:hover {
                  background-color: #0056b3;
              }
              .checkbox-group {
                  display: flex;
                  flex-direction: column;
              }
              .checkbox-group label {
                  display: inline-block;
                  margin-right: 10px;
              }
              /* Two-column layout for start and end time */
              .datetime-group {
                  display: flex;
                  justify-content: space-between;
                  gap: 20px;
                }
              .datetime-group .form-group {
                    flex: 1;
                }
              /* Responsive design */
              @media (max-width: 768px) {
                  .form-container {
                      width: 100%;
                      padding: 15px;
                  }
                  .datetime-group {
                      flex-direction: column;
                  }
              }
            </style>
            <script>
              const termData = JSON.parse('<%= JSON.stringify(termResults).replace(/'/g, "\\'") %>');

              function showTermTimes(termId) {
                const term = termData.find(t => t.Term_ID == termId);

                if (term) {
                  document.getElementById('termStartTime').innerText = 'Start Time: ' + term.Term_starttime;
                  document.getElementById('termEndTime').innerText = 'End Time: ' + term.Term_endtime;
                } else {
                  document.getElementById('termStartTime').innerText = '';
                  document.getElementById('termEndTime').innerText = '';
                }
              }
            </script>

          </head>
          <body>
            <div class="form-container">
              <h2>University Subject Registration</h2>
              <form id="registrationForm" action="/submit-courses" method="POST">
        `;

        // Generate dropdown for terms
        html += '<h3>Select Term</h3>';
        html += `<select name="term" id="term" onchange="showTermTimes(this.value)">`;
        html += `<option value="">Select a term</option>`;
        termResults.forEach(term => {
          html += `<option value="${term.Term_ID}">${term.Term_name}</option>`;
        });
        html += `</select><br><br>`;

        // Generate checkboxes for courses
        html += '<h3>Available Courses</h3>';
        courseResults.forEach(course => {
          html += `
            <div>
              <input type="checkbox" id="course_${course.Course_ID}" name="courses" value="${course.Course_ID}">
              <label for="course_${course.Course_ID}">${course.Course_name}</label>
            </div>
          `;
        });

        // Placeholder for term times
        html += `
          <div id="termTimes" class="datetime-group">
            <div class="form-group">
              <label>Start Time:</label>
              <span id="termStartTime"></span>
            </div>
          <div class="form-group">
            <label>End Time:</label>
            <span id="termEndTime"></span>
           </div>
        </div>

        `;

        // Close the form and HTML tags
        html += `
                <button type="submit">Submit</button>
              </form>
            </div>
          </body>
          </html>
        `;

        // Send the generated HTML
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
    });
  } else if (req.url === '/submit-courses' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString(); // Collect data
    });

    req.on('end', async () => {
      try {
          const parsedData = new URLSearchParams(body);
          const selectedCourses = parsedData.getAll('courses'); // Get selected course IDs
          const selectedTerm = parsedData.get('term'); // Get selected term ID

          console.log('Selected courses:', selectedCourses);
          console.log('Selected term:', selectedTerm);

          if (!selectedTerm || selectedCourses.length === 0) {
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end('<h1>Error: Please select at least one course and a term.</h1>');
              return;
          }

          const checkQuery = 'SELECT 1 FROM Term_course WHERE Term_ID = ? AND Course_ID = ?';
          const insertQuery = 'INSERT INTO Term_course (Term_ID, Course_ID) VALUES (?, ?)';

          for (const courseId of selectedCourses) {
              const exists = await new Promise((resolve, reject) => {
                  db.query(checkQuery, [selectedTerm, courseId], (err, result) => {
                      if (err) {
                          console.error('Error checking existing records:', err);
                          reject(err);
                      } else {
                          resolve(result.length > 0); // Returns true if the record exists
                      }
                  });
              });

              if (exists) {
                  // Return an error if a combination already exists
                  res.writeHead(400, { 'Content-Type': 'text/html' });
                  res.end(`<h1>Error: The combination of Term ID ${selectedTerm} and Course ID ${courseId} already exists.</h1>`);
                  return;
              } else {
                  // Insert the record if it doesn't exist
                  await new Promise((resolve, reject) => {
                      db.query(insertQuery, [selectedTerm, courseId], (err, result) => {
                          if (err) {
                              console.error('Error inserting into term_course:', err);
                              reject(err);
                          } else {
                              resolve(result);
                          }
                      });
                  });
              }
          }

          // Send success response if all insertions succeed
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Courses successfully submitted!</h1>');
      } catch (err) {
          console.error('Unexpected error:', err);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>Internal Server Error</h1>');
      }
    });

    req.on('error', err => {
        console.error('Request error:', err);
    });
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

