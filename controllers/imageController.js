import path from "path";
import fs from "fs";
import * as Jimp from "jimp"; // Correct ESM import

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ======================
// Upload
// ======================
export const uploadImage = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ message: "File uploaded successfully", filename: req.file.filename });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Server error while uploading image" });
  }
};

// ======================
// Download
// ======================
export const downloadImage = (req, res) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    res.download(filePath, req.params.filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ error: "Error downloading file" });
      } else {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error while downloading file" });
  }
};

// ======================
// Resize
// ======================
export const resizeImage = async (req, res) => {
  try {
    const { filename, width, height } = req.body;
    if (!filename || !width || !height)
      return res.status(400).json({ error: "Filename, width, and height required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `resized-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if ([w, h].some(isNaN)) return res.status(400).json({ error: "Width and height must be numbers" });

    const image = await Jimp.read(inputPath);
    await image.resize(w, h).writeAsync(outputPath);

    res.json({ message: "Image resized", filename: `resized-${filename}` });
  } catch (err) {
    console.error("Resize Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Compress
// ======================
export const compressImage = async (req, res) => {
  try {
    const { filename, quality } = req.body;
    if (!filename || !quality) return res.status(400).json({ error: "Filename and quality required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `compressed-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    const q = Math.min(Math.max(parseInt(quality, 10), 1), 100);
    const image = await Jimp.read(inputPath);
    await image.quality(q).writeAsync(outputPath);

    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);

    res.json({ message: "Image compressed", filename: `compressed-${filename}`, sizeKB });
  } catch (err) {
    console.error("Compress Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Rotate
// ======================
export const rotateImage = async (req, res) => {
  try {
    const { filename, angle } = req.body;
    if (!filename || angle === undefined)
      return res.status(400).json({ error: "Filename and angle required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `rotated-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    const a = parseInt(angle, 10);
    if (isNaN(a)) return res.status(400).json({ error: "Angle must be a number" });

    const image = await Jimp.read(inputPath);
    await image.rotate(a).writeAsync(outputPath);

    res.json({ message: "Image rotated", filename: `rotated-${filename}` });
  } catch (err) {
    console.error("Rotate Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Crop
// ======================
export const cropImage = async (req, res) => {
  try {
    const { filename, width, height, left, top } = req.body;
    if (!filename || width === undefined || height === undefined || left === undefined || top === undefined)
      return res.status(400).json({ error: "Filename, width, height, left, and top required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `cropped-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    const l = parseInt(left, 10);
    const t = parseInt(top, 10);
    if ([w, h, l, t].some(isNaN))
      return res.status(400).json({ error: "Width, height, left, top must be numbers" });

    const image = await Jimp.read(inputPath);
    await image.crop(l, t, w, h).writeAsync(outputPath);

    res.json({ message: "Image cropped", filename: `cropped-${filename}` });
  } catch (err) {
    console.error("Crop Error:", err);
    res.status(500).json({ error: err.message });
  }
};
