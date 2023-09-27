const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const db = require('./db');
const queries = require('./queries');
const cors = require('cors')

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({
  extended: true,
}));



const PORT = process.env.PORT || 3000;

app.get("/", (req, res)=>{
  res.send("API FRIEND");
});

app.get('/user', async (req, res) => {
  try {
    const pool = await db.connectDB();
    const result = await pool.request().query(queries.getUserQuery());
    res.json(result.recordset);
  } catch (err) {
    console.error('Error retrieving user data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    sql.close();
  }
});

app.get('/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const pool = await db.connectDB();
      const query =  queries.getuserfromname(username);
      const result = await pool.request().query(query);
      if (result.recordset.length === 1) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Error retrieving user data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      sql.close();
    }
  });

app.get('/group/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const pool = await db.connectDB();
      const query =  queries.getGroupusername(username);
      const result = await pool.request().query(query);
      
      
      if (result) {
        res.json(result.recordset);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Error retrieving user data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      sql.close();
    }
  });

  app.get('/membergroup/:namegroup', async (req, res) => {
    try {
      const { namegroup } = req.params;
      const pool = await db.connectDB();
      const query =  queries.getmemberfromnamegroup(namegroup);
      const result = await pool.request().query(query);
      
      
      if (result) {
        res.json(result.recordset);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Error retrieving user data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      sql.close();
    }
  });

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const pool = await db.connectDB();
    const query = queries.loginQuery(username, password);
    const result = await pool.request().query(query);
    if (result.recordset.length === 1) {
      return res.json(result.recordset[0]);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    sql.close();
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, name, password, img, email, phone, facebook, ig } = req.body;
    const pool = await db.connectDB();

    // ตรวจสอบว่ามีชื่อผู้ใช้ (username) ในระบบหรือไม่
    const checkUserQuery = queries.getuserfromname(username)
    const checkUserResult = await pool.request().query(checkUserQuery);

    if (checkUserResult.recordset.length > 0) {
      return res.status(401).json({ error: 'Username already exists' });
    }

    // ถ้าไม่มีชื่อผู้ใช้ในระบบ ก็ทำการแทรกข้อมูลใหม่
    const insertUserQuery = queries.registeruser(username, name, password, img, email, phone, facebook, ig);
    const insertResult = await pool.request().query(insertUserQuery);

    if (insertResult.rowsAffected[0] === 1) {
      return res.json({ "status": 'successful' });
    } else {
      res.status(500).json({ error: 'Failed to register' });
    }
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    sql.close();
  }
});

app.post('/createGroup', async (req, res) => {
  try {
    const {namegroup,username} = req.body;
    const pool = await db.connectDB();

    const checkUserQuery = queries.getnameGroup(namegroup)
    const checkUserResult = await pool.request().query(checkUserQuery);

    if (checkUserResult.recordset.length > 0) {
      return res.status(401).json({ error: 'Groupname already exists' });
    }

    const insertUserQuery = queries.createGroup(namegroup,username)
    const insertResult = await pool.request().query(insertUserQuery);

    if (insertResult.rowsAffected[0] === 1) {
      return res.json({ "status": 'successful' });
    } else {
      res.status(500).json({ error: 'Failed to create Group' });
    }
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    sql.close();
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
