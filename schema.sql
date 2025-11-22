--Users table: stores user account information  
CREATE TABLE users ( 
    id SERIAL PRIMARY KEY, 
    username VARCHAR(100) UNIQUE NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    password VARCHAR(255) NOT NULL, 
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

--Categories table: defines spending categories 
CREATE TABLE categories ( 
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50) NOT NULL, 
    description TEXT 
);

--Transaction table: individual spending records
CREATE table transactions ( 
    id SERIAL PRIMARY KEY, 
    user_id INTEGER NOT NULL REFERENCES users(id), 
    amount DECIMAL(10, 2) NOT NULL, 
    description TEXT, 
    category_id INTEGER NOT NULL REFERENCES categories(id), 
    date DATE NOT NULL, -- when the transaction occurred 
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- when the record was created 
); 

--Insert default spending categories 
INSERT INTO categories (name, description) VALUES 
('Groceries', 'Food and groceries'), 
('Transportation', 'Gas, car payment, car insurance'), 
('Entertainment', 'Going out, games, hobbies'), 
('Utilities', 'Electric, water, internet'), 
('Dining', 'Restaurant, takeout'), 
('Shopping', 'Clothes and general shopping'), 
('Other', 'Miscellaneous expenses');

