const http = require('http');
const db = require('./app');

// Function to fetch course names based on Course_ID
const fetchCourseName = (courseId) => {
  return new Promise((resolve, reject) => {
    const queryCourses = `SELECT Course_name FROM Course WHERE Course_ID = ?`;
    db.query(queryCourses, [courseId], (err, courseResult) => {
      if (err) {
        reject(err);
      } else if (!courseResult || courseResult.length === 0) {
        reject(new Error('Course not found'));
        return;
      } else {
        resolve(courseResult[0].Course_name);
      }
    });
  });
};

// Server logic
http.createServer((req, res) => {
  if (req.url.startsWith('/form_register')) {
    const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const email = queryParams.get('email');
    const name = queryParams.get('name');
    const id = queryParams.get('id');

    console.log('User data received:', { email, name, id });

    const queryTermCourses = 'SELECT Course_ID FROM Term_course WHERE Term_ID = "Term"';

    db.query(queryTermCourses, async (err, termCourseResults) => {
      if (err) {
        console.error('Error fetching term courses:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      if (!termCourseResults || termCourseResults.length === 0) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No courses found for the specified term.');
        return;
      }

      try {
        // Fetch all course names concurrently
        const optionsPromises = termCourseResults.map(async (term_course) => {
          const courseName = await fetchCourseName(term_course.Course_ID);
          return `<option value="${term_course.Course_ID}">${courseName}</option>`;
        });

        const options = await Promise.all(optionsPromises);
        const optionsHTML = options.join('');

        // HTML response
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                  background-image: linear-gradient(to right, white, #83E4DD, #C4F8F6);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
              }

              form {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
  }

              label[for="name"]{
                  position: relative;
                  top: -20px;
                  margin-left: 50px;
              }

              input[type="text"][id="name"]{
                  position: relative;
                  top: -20px;
                  margin-left: 200px;
              }

              label[for="gender"]{
                  position: relative;
                  top: -20px;
                  margin-left: 75px;
              }

              input[type="radio"][id="female"]{
                  margin-left: 20px;
              }

              input[type="radio"]{
                  margin-left: 200px;
                  position: relative;
                  top: -20px;
              }

              label[for="male"], label[for="female"] {
                  position: relative;
                  top: -20px;
              }

              #list_button {
                  display: flex;
                  flex-direction: column;
                  width: 70px;
                  margin-left: 230px;
                  position: relative;
                  top: -140px;
                  color: white;
              }

              label[for="registration_list"]{
                  margin-left: 322px;
                  position: relative;
                  top: -296px;
              }

              select[id="registration_list"]{
                  margin-left: 322px;
                  position: relative;
                  top: -296px;
              }

              input[type="submit"][value="Submit"]{
                  margin-left: 30px;
                  position: relative;
                  top: -250px;
                  width: 130px;
                  height: 40px;
              }

              input[type="button"][value="Registered table"]{
                  margin-left: 190px;
                  position: relative;
                  top: -250px;
                  width: 130px;
                  height: 40px;
              }

              .registered_button {
                  background-color: #71CF48;
              }

              .submit{
                  background-color: #00E5D4;
              }
              table {
                  width: 100%;
                  position: relative;
                  top: -200px;
              }

              .table_row{
                  background-color: #00E5D4;
              }

              table, th, td {
                  border: 1px solid black;
              }

              th, td {
                  padding: 10px;
                  text-align: left;
              }

              #dataTable {
                  display: none;
              }

              .board{
                  display: none; /* Hidden by default */
                  position: fixed; /* Stay in place */
                  z-index: 1; /* Sit on top */
                  left: 0;
                  top: 0;
                  width: 100%; /* Full width */
                  height: 100%; /* Full height */
                  overflow: auto; /* Enable scroll if needed */
                  background-color: rgb(0,0,0); /* Fallback color */
                  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
              }

              .board_content {
                  background-color: #fefefe;
                  margin: 15% auto; /* 15% from the top and centered */
                  padding: 20px;
                  border: 1px solid #888;
                  width: 80%; /* Could be more or less, depending on screen size */
              }

              /* The Close Button */
              .close {
                  padding: 5px 20px;
                  background-color: green;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  display: block; /* Make the button a block element */
                  margin: 20px auto; /* Auto margin for left and right */
                  }
            </style>

            <title>Form Register</title>

            <script>
              function addList() {
                var subjectList = document.getElementById("subject_list");
                var registration = document.getElementById("registration_list");

                // Get the selected option from the subject list
                var selectedOption = subjectList.options[subjectList.selectedIndex];

                if (!selectedOption) {
                  alert("Please select a subject to add.");
                  return;
                }

                var isDuplicate = false;

                // Check for duplicates in the registration list
                for (var i = 0; i < registration.options.length; i++) {
                  if (registration.options[i].value === selectedOption.value) {
                    isDuplicate = true;
                    break;
                  }
                }

                // Add option to the registration list if it's not a duplicate
                if (!isDuplicate) {
                  var newOption = document.createElement("option");
                  newOption.text = selectedOption.text;
                  newOption.value = selectedOption.value;
                  registration.add(newOption);

                  // Optionally remove the added option from the subject list
                  subjectList.remove(selectedOption.index);
                } else {
                  alert("This subject is already in the registration list.");
                }
              }

              function removeList() {
                var registration = document.getElementById("registration_list");
                var subjectList = document.getElementById("subject_list");

                if (registration.selectedIndex === -1) {
                  alert("Please select a subject to remove.");
                  return;
                }

                var selectedOption = registration.options[registration.selectedIndex];

                // Add the removed option back to the subject list
                var newOption = document.createElement("option");
                newOption.text = selectedOption.text;
                newOption.value = selectedOption.value;
                subjectList.add(newOption);

                // Remove the selected option from the registration list
                registration.remove(registration.selectedIndex);

                // Sort the subject list alphabetically (optional)
                sortOptions(subjectList);
              }

              function addTwoList() {
                var subject = document.getElementById("subject_list");
                var registration = document.getElementById("registration_list");

                // Take selected options from the subject list
                var selectedOptions = Array.from(subject.selectedOptions);

                selectedOptions.forEach(selectedOption => {
                  var isDuplicate = false;

                  // Check for duplicates in the registration list
                  for (var i = 0; i < registration.options.length; i++) {
                    if (registration.options[i].value === selectedOption.value) {
                      isDuplicate = true;
                      break;
                    }
                  }

                  // Add option to registration list and remove from subject list if it's not a duplicate
                  if (!isDuplicate) {
                    var newOption = document.createElement("option");
                    newOption.text = selectedOption.text;
                    newOption.value = selectedOption.value;
                    registration.add(newOption);

                    // Remove the added option from the subject list
                    subject.remove(selectedOption.index);
                  }
                });
              }


              function removeTwoList() {
                var registration = document.getElementById("registration_list");
                var subjectList = document.getElementById("subject_list");
                var selectedOptions = Array.from(registration.selectedOptions); // Get all selected options

                if (selectedOptions.length === 0) {
                  alert("Please select one or more subjects to remove.");
                  return;
                }

                selectedOptions.forEach(option => {
                  // Add each removed option back to the subject list
                  var newOption = document.createElement("option");
                  newOption.text = option.text;
                  newOption.value = option.value;
                  subjectList.add(newOption);

                  // Remove the option from the registration list
                  registration.remove(option.index);
                });

                // Sort the subject list alphabetically (optional)
                sortOptions(subjectList);
              }

              function submitData(){
                  event.preventDefault();

                  var studentID = document.getElementById('studentID').value;
                  var studentName = document.getElementById('name').value;
                  var DoB = document.getElementById('birthday').value;
                  var gender = "";

                  if(document.getElementById('male').checked){
                      gender = document.getElementById('male').value;
                  } else {
                      gender = document.getElementById('female').value;
                  }

                  var table = document.getElementById('dataTable');
                  table.style.display = "table";

                  var newRow = table.insertRow(-1);
                  var cell1 = newRow.insertCell(0);
                  var cell2 = newRow.insertCell(1);
                  var cell3 = newRow.insertCell(2);
                  var cell4 = newRow.insertCell(3);

                  cell1.innerHTML = studentID;
                  cell2.innerHTML = studentName;
                  cell3.innerHTML = DoB;
                  cell4.innerHTML = gender;
              }

              function registeredData() {
                var subjectList = document.getElementById('subjectList');
                var select = document.getElementById('registration_list');

                // Clear existing list items
                while (subjectList.firstChild) {
                  subjectList.removeChild(subjectList.firstChild);
                }

                // Add all subjects to the list
                for (var i = 0; i < select.options.length; i++) {
                  var option = select.options[i];
                  var li = document.createElement('li');
                  li.textContent = option.value;
                  subjectList.appendChild(li);
                }

                // Add selected subjects to the list
                Array.from(select.selectedOptions).forEach(option => {
                  var li = document.createElement('li');
                  li.textContent = option.value;
                  subjectList.appendChild(li);
                });

                // Display the modal
                var modal = document.getElementById('infoBoard');
                modal.style.display = "block";
              }

              // Function to close the modal
              function closeBoard() {
                  var modal = document.getElementById('infoBoard');
                  modal.style.display = "none";
               }

              function sortOptions(selectElement) {
                var options = Array.from(selectElement.options);

                // Sort options alphabetically
                options.sort((a, b) => a.text.localeCompare(b.text));

                // Clear and re-add sorted options
                selectElement.innerHTML = "";
                options.forEach(option => selectElement.add(option));
              }

              function submitStudentTermCourse(event) {
                event.preventDefault(); // Prevent the default form submission behavior

                // Retrieve student ID, term ID, and registered courses
                var studentID = "${id}"; 
                var termID = "Term"; // Static Term ID
                var registrationList = document.getElementById("registration_list");
                var registeredCourses = Array.from(registrationList.options).map(option => option.value).join(',');

                // Validation
                if (!studentID || registeredCourses.length === 0) {
                  alert("Please complete all fields and select at least one course.");
                  return;
                }

                // Create payload
                var payload = {
                  studentID: studentID,
                  termID: termID,
                  courses: registeredCourses
                };

                // Send data to the server using Fetch API
                fetch("/submitStudentTermCourse", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(payload)
                })
                  .then(response => {
                    if (response.ok) {
                      alert("Data successfully submitted!");
                      // Optionally clear the registration list
                      registrationList.innerHTML = "";
                    } else {
                      throw new Error("Failed to submit data.");
                    }
                  })
                  .catch(error => {
                    console.error("Error:", error);
                    alert("An error occurred while submitting the data.");
                  });
              }

            </script>
          </head>
          <body>
            <form id="my-form" action="">
              <h1>Registration form</h1>
              <div>
                <h1>Welcome, ${name}</h1>
                <p>Email: ${email}</p>
                <p>Student's ID: ${id}</p>
              </div>
              <div>
                <label for="subject_list">Subjects list</label>
                <br>
                <select name="subject_list" id="subject_list" size="8" multiple required>
                  ${optionsHTML}
                </select>
              </div>
              <div id="list_button">
                <input type="button" value=">" class="registered_button" onclick="addList()">
                <br>
                <input type="button" value="<" class="registered_button" onclick="removeList()">
                <br>
                <input type="button" value=">>" class="registered_button" onclick="addTwoList()">
                <br>
                <input type="button" value="<<" class="registered_button" onclick="removeTwoList()">
              </div>
              <div>
                <label for="registration_list">Registration list</label>
                <br>
                <select name="registration_list" id="registration_list" size="8" style="width: 200px; height: 138px;" multiple>
                </select>
              </div>
              <input type="submit" value="Submit" onclick="submitStudentTermCourse(event)" class="submit">
              <input type="button" value="Registered table" onclick="registeredData()" class="submit">
              <table id="dataTable">
                <tr>
                  <td class="table_row">studentID</td>
                  <td class="table_row">Full name</td>
                </tr>
              </table>
              <div id="infoBoard" class="board">
                <div class="board_content">
                  <h1>Information</h1>
                  <p id="studentIDInfo">Student ID: ${id}</p>
                  <p id="nameInfo">Full name: ${name}</p>
                  <p>Registered subject:</p>
                  <ul id="subjectList" style="list-style-type:circle;">
                  </ul>
                  <button class="close" type="button" onclick="closeBoard()">Close</button>
                </div>
              </div>
            </form>
          </body>
          </html>
        `;

        // Send the HTML response
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);

      } catch (error) {
        console.error('Error fetching courses:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  } else if (req.method === "POST" && req.url === "/submitStudentTermCourse") {
    let body = "";

    // Collect the request body data
    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const { studentID, termID, courses } = JSON.parse(body);

      if (!studentID || !termID || !courses) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid data.");
        return;
      }

      // Insert data into the database
      const query = `
        INSERT INTO Student_course (Student_ID, Term_ID, Course_ID) 
        VALUES (?, ?, ?)
      `;
      db.query(query, [studentID, termID, courses], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }

        // Success
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Data successfully submitted!");
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
}).listen(4000, () => {
  console.log('Form Register server is running on http://localhost:4000');
});
