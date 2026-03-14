import { db } from "./src/db/database.js";

async function logSchema() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM users");
        console.log("Users schema:", columns);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

logSchema();
