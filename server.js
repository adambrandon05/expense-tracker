const express = require('express');  // imports the express library
const { Pool } = require('pg'); // imports Pool from the pg library
require('dotenv').config(); // includes .env data 
const app = express(); 

app.use(express.json()); 
const isDevelopment = process.env.NODE_ENV === 'development'; 


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

// API Endpoints for users 

// Get all users 
app.get('/api/users', async (req, res) => {
try{
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
}
catch (err) {
    console.error('Error getting all users', err);
    // if isDevelopment prints detailed error if in production prints generic error
    const errorMessage = isDevelopment ? err.message : 'Something went wrong';
    res.status(500).json({error: errorMessage});
}
})

// get users by user id
app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if(result.rows.length == 0) {
            return res.status(404).json({ error: 'users not found'});
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error finding user', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }
});

// Create a new user 
app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    
    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    try{
        const result = await pool.query(
            `INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3) RETURNING *`,
            [username, email, password]
            );
            res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating new user', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }
});

// Update an user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const allowedColumns = ['username', 'email', 'password'];

    const updates = Object.keys(req.body).filter(key => 
        allowedColumns.includes(key) && req.body[key] !== undefined
    );
    
    if (updates.length === 0) {
        return res.status(404).json({ error: "No valid input" });
    }

    const setClauses = updates.map((col, index) => `"${col}" = $${index + 1}`).join(', ');
    const values = updates.map(key => req.body[key]);

    values.push(id);
    try{
        const result = await pool.query(
            `UPDATE users
            SET ${setClauses}
            WHERE id = $${values.length}
            RETURNING *`,
            values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error updating user information', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }
});

app.delete('/api/users/:id', async (req, res) => { 
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({message: 'User successfully deleted.'});
    }
    catch (err) {
        console.error('Error deleting user', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage}); 
    }
});

// Get all categories 
app.get('/api/categories', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error getting all categories', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }

})

// API Endpoints for transactions 

// get all transactions 
app.get('/api/transactions', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM transactions');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching all transactions', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }
});

// get single transaction by ID
app.get('/api/transactions/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
        if(result.rows.length == 0) {
            return res.status(404).json({ error: 'transaction not found'});
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error fetching transaction', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }
});

// create a new transaction
app.post('/api/transactions', async (req, res) => {
    const { user_id, amount, description, category_id, date } = req.body;
    if(!user_id || !amount || !category_id || !date) {
        return res.status(400).json({error: "Invalid input. Need user_id, amount, category_id, and date"});
    }
    try{
        const result = await pool.query(
            `INSERT INTO transactions (user_id, amount, description, category_id, date)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, amount, description || null, category_id, date]
            );
            res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating new transaction', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});
    }
});

// update a transaction
app.put('/api/transactions/:id', async (req, res) => {
    const id = req.params.id;
    const {user_id, amount, description, category_id, date} = req.body;
    if(!user_id || !amount || !category_id || !date) {
        return res.status(400).json({error: "Invalid input. Need user_id, amount, category_id, and date"});
    }    
    try {
        const result = await pool.query( 
            `UPDATE transactions 
            SET user_id = $1, amount = $2, description = $3, category_id = $4, date = $5
            WHERE id = $6
            RETURNING *`,
            [user_id, amount, description || null, category_id, date, id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({ error: "Transaction not found."});
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error updating transaction', err);
        // if isDevelopment prints detailed error if in production prints generic error
        const errorMessage = isDevelopment ? err.message : 'Something went wrong';
        res.status(500).json({error: errorMessage});        
    }
});

// Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => { 
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({message: 'Transaction successfully deleted.'});
    }
    catch (err) {
        console.error('Error deleting transaction', err);
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