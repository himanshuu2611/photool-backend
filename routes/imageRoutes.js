import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // ✅ Ensure uploads folder exists
import {
  uploadImage,
  downloadImage,
  resizeImage,
  compressImage,
  rotateImage,
  cropImage,
} from "../controllers/imageController.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes (frontend keys and paths unchanged)
router.post("/upload", upload.single("image"), uploadImage);
router.get("/download/:filename", downloadImage);
router.post("/resize", resizeImage);
router.post("/compress", compressImage);
router.post("/rotate", rotateImage);
router.post("/crop", cropImage);

export default router;
