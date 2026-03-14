import express from "express";
import { getAllUsers, deleteUser } from "../controllers/users.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get("/", getAllUsers);
router.delete("/:id", deleteUser);

export default router;
