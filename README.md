# Expense Tracker
Personal expense tracker with that will automatically import bank transaction data and give insight into personal spending habits

## Tech Stack 

- **Backend:** Node.js, Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** React
- **Database:** PostgreSQL
- **Banking API:** Plaid

## Setup

### Prerequisites
- Node.js
- PostgreSQL
- Git

### Installation 
```
    git clone https://github.com/adambrandon05 expense-tracker.git
    cd expense-tracker
```

2. Install dependencies:
```
    npm install
```

3. Create '.env' file: 
```
    DB_USER=your_username
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=expense-tracker
    PORT=5000
```

4. Create a PostgreSQL database called 'expense_tracker'

5. Start the server: 
```
    npm start
```

## Features

- [ ] User authentication 
- [ ] Link bank accounts with Plaid
- [ ] Auto-import transaction 
- [ ] create a user friendly spending dashboard
- [ ] organize spending my categories 
- [ ] create monthly spending reports 
- [ ] monthly budget tracking 

## Current Status 

Currently building the backend API and database. 


