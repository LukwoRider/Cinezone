import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function run() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM users");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}
run();
