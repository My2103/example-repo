const http = require('http');
const db = require('./app'); // Database connection
const registerUser = require('./form_register'); // Import the registration module

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/login' && req.method === 'POST') {
    let body = '';

    // Collect the incoming data
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {

      const formData = new URLSearchParams(body);
      const email = formData.get('email');
      const password = formData.get('password');
      console.log('Student email:', email);
      console.log('Student password:', password);

      // Query the database to verify the email and password
      const query = 'SELECT * FROM Student WHERE Student_email = ? AND Student_password = ?';
      db.query(query, [email, password], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<script>alert('Internal Server Error. Please try again later.'); window.history.back();</script>`);

          return;
        }

        if (results.length > 0) {
          // Fetch email and name for form_register.js
          const email = results[0].Student_email;
          const name = results[0].Student_name;
          const id = results[0].Student_ID;

          // Construct the URL for form_register
          const formRegisterURL = `http://localhost:4000/form_register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}`;

          // Redirect the user to form_register
          res.writeHead(302, { Location: formRegisterURL });
          res.end();
        } else {
          // Login failed

          res.writeHead(401, { 'Content-Type': 'text/html' });

          res.end(`<script>alert('Invalid email or password. Please try again.'); window.history.back();</script>`);

        }

      });

    });

  } else if (req.url === '/login' && req.method === 'GET') {
    // Serve a simple login form with embedded CSS
    const loginForm = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
       
        <style>
          /* General Styles */
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }

          /* Container */
          h1 {
            text-align: center;
            color: #333;
          }

          form {
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 300px;
            margin: auto;
          }

          /* Form Labels and Inputs */
          label {
            display: block;
            font-size: 14px;
            margin-bottom: 6px;
            color: #555;
          }

          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          }

          /* Submit Button */
          button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            font-size: 14px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
          }

          button:hover {
            background-color: #0056b3;
          }

          /* Responsive Design */
          @media (max-width: 480px) {
            form {
              width: 90%;
            }
          }
        </style>
      </head>
      <body>
        
        <form action="/login" method="POST">
        <h1>Login</h1>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required><br><br>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required><br><br>
          <button type="submit">Login</button>
        </form>
      </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(loginForm);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<script>alert('Page not found!'); window.location.href = '/login';</script>`);
  }
});

// Start the server
const PORT = 3001; // A different port if your main app is already running on 3000
server.listen(PORT, () => {
  console.log(`Login server is running at http://localhost:${PORT}`);
});
