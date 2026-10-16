import express from "express";
import {
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", protect, adminOnly, createTestimonial);
router.delete("/:id", protect, adminOnly, deleteTestimonial);

export default router;
