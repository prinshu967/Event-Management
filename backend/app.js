const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Admin Routes
app.post('/admin/addVendor', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO vendors (name) VALUES (?)`, [name], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Vendor Routes
app.post('/vendor/addProduct', (req, res) => {
    const { name, description, price, vendor_id } = req.body;
    db.run(`INSERT INTO products (name, description, price, vendor_id) VALUES (?, ?, ?, ?)`, 
        [name, description, price, vendor_id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        });
});

// User Routes
app.get('/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/order', (req, res) => {
    const { user_id, cart, status } = req.body;
    db.run(`INSERT INTO orders (user_id, status) VALUES (?, ?)`, [user_id, status], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const orderId = this.lastID;
        const orderItems = cart.map(item => [orderId, item.productId, item.quantity]);
        db.run(`BEGIN TRANSACTION`);
        db.parallelize(() => {
            const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`);
            orderItems.forEach(item => {
                stmt.run(item);
            });
            stmt.finalize();
        });
        db.run(`COMMIT`, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ orderId });
        });
    });
});

// Authentication Routes
app.post('/signup', (req, res) => {
    const { name, role, password } = req.body;
    const userId = 'U' + Math.floor(Math.random() * 100000);
    db.run(`INSERT INTO users (id, name, role, password) VALUES (?, ?, ?, ?)`, [userId, name, role, password], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ userId });
    });
});

app.post('/login', (req, res) => {
    const { id, password } = req.body;
    db.get(`SELECT * FROM users WHERE id = ? AND password = ?`, [id, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(401).json({ error: 'Invalid User ID or Password' });
        }
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
