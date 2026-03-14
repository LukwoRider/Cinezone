import dotenv from "dotenv";
import app from "./app.js";
import { testDbConnection } from "./src/db/database.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

(async function start() {
  try {
    await testDbConnection();
    app.listen(PORT, () => {
      console.log(`CineZone API on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Impossible de démarrer le serveur", err);
    process.exit(1);
  }
})();
