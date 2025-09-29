import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  uploadImage,
  downloadImage,
  resizeImage,
  compressImage,
  rotateImage,
  cropImage,
} from "../controllers/imageController.js";

const router = express.Router();

// Absolute path for uploads folder
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes
router.post("/upload", upload.single("image"), uploadImage);
router.get("/download/:filename", downloadImage);
router.post("/resize", resizeImage);
router.post("/compress", compressImage);
router.post("/rotate", rotateImage);
router.post("/crop", cropImage);

export default router;
