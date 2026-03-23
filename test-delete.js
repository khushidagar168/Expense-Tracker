const http = require('http');
const db = require('./db.js');

const users = db.prepare('SELECT * FROM users').all();
const exps = db.prepare('SELECT * FROM expenses').all();

console.log("Users:", users);
console.log("Expenses:", exps);

if (exps.length > 0 && users.length > 0) {
    const jwt = require('jsonwebtoken');
    require('dotenv').config();
    const token = jwt.sign({ id: users[0].id, email: users[0].email }, process.env.JWT_SECRET);
    
    // try to delete
    const req = http.request('http://localhost:5000/api/expenses/' + exps[0].id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('Delete response:', res.statusCode, data));
    });
    req.end();
}
