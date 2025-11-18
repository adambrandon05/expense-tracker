const express = require('express');  // imports the express library
const { Pool } = require('pg'); // imports Pool from the pg library
require('dotenv').config(); // includes .env data 
const app = express(); 

app.use(express.json()); 

const pool = new Pool({
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    database: process.env.DB_NAME,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

app.get('/', (req, res) => {
    res.json({ message: 'Expense Tracker API is running!'});
});

// development only database connection test
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Database connected!', 
            timestamp: result.rows[0]
        });
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Get categories used in production
const isDevelopment = process.env.NODE_ENV === 'development'; 
app.get('/api/categories', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Database error:', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }

});

// Start server at specified port number
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});