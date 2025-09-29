import path from "path";
import fs from "fs";
import sharp from "sharp";

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadDir = isServerless ? "/tmp" : path.join(process.cwd(), "uploads");

// Create uploads folder if needed
if (!isServerless && !fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ======================
// Upload Image
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
// Download Image
// ======================
export const downloadImage = (req, res) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    res.download(filePath, req.params.filename, (err) => {
      if (err) {
        console.error("Download Error:", err);
        return res.status(500).json({ error: "Error downloading file" });
      }

      // Delete file after download in serverless or local (optional)
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ error: "Server error while downloading file" });
  }
};


// ======================
// Resize Image
// ======================
export const resizeImage = async (req, res) => {
  try {
    const { filename, width, height } = req.body;
    if (!filename || !width || !height)
      return res.status(400).json({ error: "Filename, width, and height required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `resized-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath)
      .resize(parseInt(width, 10), parseInt(height, 10))
      .toFile(outputPath);

    res.json({ message: "Image resized", filename: `resized-${filename}` });
  } catch (err) {
    console.error("Resize Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Compress Image
// ======================
export const compressImage = async (req, res) => {
  try {
    const { filename, quality } = req.body;
    if (!filename || !quality) return res.status(400).json({ error: "Filename and quality required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `compressed-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath)
      .jpeg({ quality: Math.min(Math.max(parseInt(quality, 10), 1), 100) })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);

    res.json({ message: "Image compressed", filename: `compressed-${filename}`, sizeKB });
  } catch (err) {
    console.error("Compress Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Rotate Image
// ======================
export const rotateImage = async (req, res) => {
  try {
    const { filename, angle } = req.body;
    if (!filename || angle === undefined)
      return res.status(400).json({ error: "Filename and angle required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `rotated-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath)
      .rotate(parseInt(angle, 10))
      .toFile(outputPath);

    res.json({ message: "Image rotated", filename: `rotated-${filename}` });
  } catch (err) {
    console.error("Rotate Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ======================
// Crop Image
// ======================
export const cropImage = async (req, res) => {
  try {
    const { filename, width, height, left, top } = req.body;
    if (!filename || width === undefined || height === undefined || left === undefined || top === undefined)
      return res.status(400).json({ error: "Filename, width, height, left, and top required" });

    const inputPath = path.join(uploadDir, filename);
    const outputPath = path.join(uploadDir, `cropped-${filename}`);
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath)
      .extract({ width: parseInt(width, 10), height: parseInt(height, 10), left: parseInt(left, 10), top: parseInt(top, 10) })
      .toFile(outputPath);

    res.json({ message: "Image cropped", filename: `cropped-${filename}` });
  } catch (err) {
    console.error("Crop Error:", err);
    res.status(500).json({ error: err.message });
  }
};
