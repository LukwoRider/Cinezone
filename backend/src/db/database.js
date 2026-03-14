import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

// Database connection pool configuration
export const db = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT || 3306),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to test the database connection on server startup
export async function testDbConnection() {
  const conn = await db.getConnection();
  try {
    await conn.ping();
    console.log('✅ MySQL connecté');
  } finally {
    conn.release();
  }
}
