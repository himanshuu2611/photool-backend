import express from "express";
import multer from "multer";
import path from "path";
import {
  uploadImage,
  downloadImage,
  resizeImage,
  compressImage,
  rotateImage,
  cropImage,
} from "../controllers/imageController.js";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
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
