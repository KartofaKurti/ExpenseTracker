const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3030;

app.use(express.static(path.join(__dirname, '../Expenses/CssFiles')));
app.use(express.json());
app.use(cors());

const config = {
    server: 'DESKTOP-GDPU067',
    database: 'ExpensesTracker',
    user: 'PechenKartof',
    password: 'DreamGood12',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        connectionTimeout: 60000,
        port: 1433
    }
};

// Connect to the SQL server
sql.connect(config)
    .then(() => console.log('Connected to SQL Server'))
    .catch(err => console.error('Error connecting to SQL Server:', err));

// Secret key for JWT
const jwtSecret = 'pederas123';

// Middleware for authenticating JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// User registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, hashedPassword);

    const sqlQuery = 'INSERT INTO users (username, email, password) VALUES (@username, @email, @password)';

    try {
        await request.query(sqlQuery);
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const request = new sql.Request();
    request.input('email', sql.NVarChar, email);

    const sqlQuery = 'SELECT * FROM users WHERE email = @email';

    try {
        const result = await request.query(sqlQuery);
        const user = result.recordset[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Add expense endpoint
app.post('/add-expense', authenticateToken, (req, res) => {
    const { type, item, amount, price, date } = req.body;
    const userId = req.user.userId;
    let table = '';

    switch (type) {
        case 'food':
            table = 'food_expenses';
            break;
        case 'drink':
            table = 'drink_expenses';
            break;
        case 'smoking':
            table = 'smoking_expenses';
            break;
        default:
            return res.status(400).send('Invalid expense type');
    }

    const request = new sql.Request();
    request.input('item', sql.NVarChar, item);
    request.input('amount', sql.Decimal, amount);
    request.input('price', sql.Decimal, price);
    request.input('date', sql.Date, date);
    request.input('user_id', sql.Int, userId);

    const sqlQuery = `INSERT INTO ${table} (item, amount, price, date, user_id) VALUES (@item, @amount, @price, @date, @user_id)`;

    request.query(sqlQuery)
        .then(result => {
            console.log('Expense added successfully');
            res.send('Expense added successfully');
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).send('Error adding expense');
        });
});

// Fetch spending data endpoint
app.get('/api/spending', authenticateToken, async (req, res) => {
    const type = req.query.type;
    const userId = req.user.userId;

    if (!type) {
        return res.status(400).send('Expense type is required');
    }

    let table = '';

    switch (type) {
        case 'food':
            table = 'food_expenses';
            break;
        case 'drink':
            table = 'drink_expenses';
            break;
        case 'smoking':
            table = 'smoking_expenses';
            break;
        default:
            return res.status(400).send('Invalid expense type');
    }

    const sqlQuery = `
        SELECT
            FORMAT(date, 'yyyy-MM') AS month,
            SUM(price * amount) AS total_spent
        FROM ${table}
        WHERE user_id = @user_id
        GROUP BY FORMAT(date, 'yyyy-MM')
        ORDER BY month
    `;

    try {
        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        const result = await request.query(sqlQuery);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).send('Error fetching expenses');
    }
});

// Fetch category spending data endpoint
app.get('/api/category-spending', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    const sqlQuery = `
        SELECT 'food' AS category, SUM(price * amount) AS total_spent FROM food_expenses WHERE user_id = @user_id
        UNION ALL
        SELECT 'drink' AS category, SUM(price * amount) AS total_spent FROM drink_expenses WHERE user_id = @user_id
        UNION ALL
        SELECT 'smoking' AS category, SUM(price * amount) AS total_spent FROM smoking_expenses WHERE user_id = @user_id
    `;

    try {
        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        const result = await request.query(sqlQuery);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching category spending data:', error);
        res.status(500).send('Error fetching category spending data');
    }
});

// Fetch items data endpoint
app.get('/api/items', authenticateToken, async (req, res) => {
    const type = req.query.type;
    const userId = req.user.userId;

    if (!type) {
        return res.status(400).send('Expense type is required');
    }

    let table = '';

    switch (type) {
        case 'food':
            table = 'food_expenses';
            break;
        case 'drink':
            table = 'drink_expenses';
            break;
        case 'smoking':
            table = 'smoking_expenses';
            break;
        default:
            return res.status(400).send('Invalid expense type');
    }

    try {
        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        const result = await request.query(`
            SELECT 
                item, 
                SUM(amount) AS total_amount, 
                SUM(price * amount) AS total_price 
            FROM ${table} 
            WHERE user_id = @user_id
            GROUP BY item
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

// Fetch all expenses endpoint
app.get('/get-total-spending', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    const sqlQuery = `
        SELECT
            FORMAT(date, 'yyyy-MM') AS month,
            SUM(price * amount) AS total_spent
        FROM (
            SELECT date, price, amount FROM food_expenses WHERE user_id = @user_id
            UNION ALL
            SELECT date, price, amount FROM drink_expenses WHERE user_id = @user_id
            UNION ALL
            SELECT date, price, amount FROM smoking_expenses WHERE user_id = @user_id
        ) AS all_expenses
        GROUP BY FORMAT(date, 'yyyy-MM')
        ORDER BY month;
    `;

    try {
        const request = new sql.Request();
        request.input('user_id', sql.Int, userId);
        const result = await request.query(sqlQuery);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching total spending data:', error);
        res.status(500).send('Error fetching total spending data');
    }
});

// Fetch pie chart data endpoint
app.get('/api/pie-chart-data', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    const sqlQuery = `
        SELECT 
            'food' AS category, 
            SUM(price * amount) AS total_spent 
        FROM food_expenses WHERE user_id = @user_id
        UNION ALL
        SELECT 
        'drink' AS category, 
        SUM(price * amount) AS total_spent 
    FROM drink_expenses WHERE user_id = @user_id
    UNION ALL
    SELECT 
        'smoking' AS category, 
        SUM(price * amount) AS total_spent 
    FROM smoking_expenses WHERE user_id = @user_id
`;

try {
    const request = new sql.Request();
    request.input('user_id', sql.Int, userId);
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
} catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).send('Error fetching pie chart data');
}
});

// Fetch all items endpoint
app.get('/api/all-items', authenticateToken, async (req, res) => {
const userId = req.user.userId;

const sqlQuery = `
    SELECT 
        item, 
        SUM(amount) AS total_amount, 
        SUM(price * amount) AS total_price 
    FROM (
        SELECT item, amount, price FROM food_expenses WHERE user_id = @user_id
        UNION ALL
        SELECT item, amount, price FROM drink_expenses WHERE user_id = @user_id
        UNION ALL
        SELECT item, amount, price FROM smoking_expenses WHERE user_id = @user_id
    ) AS all_items
    GROUP BY item;
`;

try {
    const request = new sql.Request();
    request.input('user_id', sql.Int, userId);
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
} catch (error) {
    console.error('Error fetching all items:', error);
    res.status(500).send('Error fetching all items');
}
});

// Start the server
app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});
