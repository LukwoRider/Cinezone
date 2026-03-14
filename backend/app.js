import express from "express";
import cors from "cors";
import moviesRouter from "./src/routes/movies.routes.js";
import categoriesRouter from "./src/routes/categories.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import favoritesRouter from "./src/routes/favorites.routes.js";
import reviewsRouter from "./src/routes/reviews.routes.js";
import statsRouter from "./src/routes/stats.routes.js";
import usersRouter from "./src/routes/users.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRouter);
app.use("/favorites", favoritesRouter);
app.use("/movies", moviesRouter);
app.use("/categories", categoriesRouter);
app.use("/reviews", reviewsRouter);
app.use("/stats", statsRouter);
app.use("/users", usersRouter);

app.get("/test", (_req, res) => {
  res.json({ service: "CineZone API", status: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
