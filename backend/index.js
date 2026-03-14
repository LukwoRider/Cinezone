import dotenv from "dotenv";
import app from "./app.js";
import { testDbConnection } from "./src/db/database.js";
import { initializeDatabase } from "./src/db/init.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

// Initialize and start the server
(async function start() {
  try {
    // Tests database connection before starting the server
    await testDbConnection();
    // Synchronize database schema and seed data
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`CineZone API on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Impossible de démarrer le serveur", err);
    process.exit(1);
  }
})();
