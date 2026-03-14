import { db } from "./src/db/database.js";

async function run() {
    try {
        console.log("Connecting...");
        const [users] = await db.query(
            "SELECT id, firstname, lastname, email, is_admin, avatar, created_at FROM users ORDER BY created_at DESC"
        );
        console.log("Success! Found", users.length, "users.");
    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        process.exit();
    }
}
run();
