const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');

const app = express();
const port = 3000;

// Initialize the database connection
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'test',
    database: 'loginformytvideo'
  }
});

// Set up middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Define routes

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// Dynamic route for other pages
app.get('/:page', (req, res) => {
  const { page } = req.params;
  res.sendFile(`${page}.html`);
});

// Route for registering a user
app.post('/register-user', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if all fields are filled
    if (!name || !email || !password) {
      throw new Error('Please fill in all the fields.');
    }

    // Insert the user into the database and retrieve the registered user data
    const [registeredUser] = await db('users')
      .insert({ name, email, password })
      .returning(['name', 'email']);

    res.json(registeredUser); // Return the registered user data
  } catch (error) {
    if (error.detail && error.detail.includes('already exists')) {
      res.json('Email already exists.'); // If the email already exists in the database, return an appropriate message
    } else {
      res.status(500).json('Registration failed.'); // If any other error occurs, return a generic registration failed message
    }
  }
});

// Route for logging in a user
app.post('/login-user', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve the user data based on the provided email and password
    const [loggedInUser] = await db('users')
      .select('name', 'email')
      .where({ email, password });

    if (loggedInUser) {
      res.json(loggedInUser); // If the user exists, return the user data
    } else {
      res.json('Email or password is incorrect.'); // If the user does not exist or the password is incorrect, return an appropriate message
    }
  } catch (error) {
    res.status(500).json('Login failed.'); // If any error occurs, return a generic login failed message
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
