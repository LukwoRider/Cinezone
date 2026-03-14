import express from "express";
import cors from "cors";
import moviesRouter from "./src/routes/movies.routes.js";
import categoriesRouter from "./src/routes/categories.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import favoritesRouter from "./src/routes/favorites.routes.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRouter);
app.use("/favorites", favoritesRouter);
app.use("/movies", moviesRouter);
app.use("/categories", categoriesRouter);

// santé
app.get("/test", (_req, res) => {
  res.json({ service: "CineZone API", status: "ok" });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
