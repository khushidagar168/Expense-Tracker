# Full-Stack Expense Tracker

## 📑 Description

The **Full-Stack Expense Tracker** is a comprehensive financial management tool designed to help users effortlessly monitor and categorize their daily spending. Built from the ground up to offer a seamless user experience, the application features a robust authentication flow, ensuring that user data remains private and secure. 

Beyond simply logging transactions, the application provides an intuitive, glassmorphism-styled dashboard where users can view, update, and manage their expenses in real time. To help users visualize their financial health, the app includes an interactive Chart.js integration that automatically aggregates expenditures and displays them as an easy-to-read categorical doughnut chart. Whether you are tracking daily coffee runs or monthly utility bills, this expense tracker provides the visual insights needed to maintain a balanced budget.
## 🚀 Features

- **User Authentication**: Secure Sign Up and Login with JWT (JSON Web Tokens) and password hashing (bcrypt).
- **Dashboard**: A comprehensive central dashboard to view all your expenses sorted seamlessly by the latest additions.
- **Expense Management**: Add, View, Edit, and Delete expenses directly from an interactive, responsive table.
- **Data Visualization**: View your spending habits mapped out by categories via an interactive doughnut pie-chart using Chart.js.
- **Premium UI/UX**:
  - Custom glassmorphism aesthetic with gradient backgrounds.
  - Smooth micro-animations, loading states, and responsive modal dialogues.
  - Dynamic toast notifications.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (via `better-sqlite3`) for lightweight, embedded local storage.
- **Security**: `jsonwebtoken` (JWT), `bcryptjs`
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Chart.js (CDN)

## 🏗 Project Structure

```text
/
├── routes/
│   ├── auth.js       # Authentication endpoints
│   └── expenses.js   # CRUD endpoints
├── middleware/
│   └── auth.js       # JWT Verification guard
├── frontend/
│   ├── css/
│   │   └── style.css     # Global glassmorphism design system
│   ├── js/
│   │   ├── api.js        # Reusable API fetch wrappers & JWT handlers
│   │   ├── auth.js       # Login / Registration DOM logic
│   │   ├── dashboard.js  # Main table & modal CRUD operations
│   │   └── chart.js      # Chart.js visualization integration
│   ├── index.html        # Dashboard View
│   ├── login.html        # Login View
│   ├── signup.html       # Sign up View
│   └── chart.html        # Visualization View
├── server.js         # Node.js/Express main entry point
├── db.js             # SQLite initialization & schema definitions
├── expenses.db       # Auto-generated SQLite database (gitignored)
├── .env              # Environment Variables
└── package.json      # Node dependencies
```

## ⚙️ Installation & Usage

### 1. Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### 2. Setup
Install the required dependencies:
```bash
npm install
```

### 3. Run the Application
Start the backend server. The database (`expenses.db`) will automatically generate its schema upon initialization.
```bash
node server.js
```
The server will start on `http://localhost:5000` by default.

### 4. Access the App
Open your browser and navigate to:
```
http://localhost:5000
```
- Sign up to create an account.
- Add some expenses and navigate to the Charts tab to see the breakdown!

## 🔐 API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate an existing user

### Expenses (Protected via Bearer Token)
- `GET /api/expenses` - Retrieve all expenses for the authenticated user
- `POST /api/expenses` - Add a new expense record
- `PUT /api/expenses/:id` - Update a specific expense record
- `DELETE /api/expenses/:id` - Delete a specific expense record
