import sharp from "sharp";
import path from "path";
import fs from "fs";

// Upload
export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "File uploaded", filename: req.file.filename });
};

// Download
// Download
export const downloadImage = (req, res) => {
  const filePath = path.join(process.cwd(), "uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Force download and delete after download
  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    } else {
      // Delete file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  });
};


// Resize
export const resizeImage = async (req, res) => {
  try {
    const { filename, width, height } = req.body;
    const inputPath = path.join("uploads", filename);
    const outputPath = path.join("uploads", `resized-${filename}`);

    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath)
      .resize(parseInt(width), parseInt(height))
      .toFile(outputPath);

    res.json({ message: "Image resized", filename: `resized-${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Compress

export const compressImage = async (req, res) => {
  try {
    const { filename, targetSizeKB } = req.body;
    const inputPath = path.join("uploads", filename);
    const outputPath = path.join("uploads", `compressed-${filename}`);

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Start with high quality
    let quality = 90;
    let image = sharp(inputPath);
    let metadata = await image.metadata();
    let width = metadata.width;
    let height = metadata.height;

    let buffer = await image.jpeg({ quality }).toBuffer();

    // Keep compressing until under target size
    while (buffer.length / 1024 > targetSizeKB && quality > 5) {
      quality -= 5;
      width = Math.floor(width * 0.9);
      height = Math.floor(height * 0.9);

      buffer = await sharp(buffer) // ✅ use buffer, not inputPath
        .resize(width, height)
        .jpeg({ quality })
        .toBuffer();
    }

    await sharp(buffer).toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const outputKB = Math.round(stats.size / 1024);

    res.json({
      message: "Image compressed",
      filename: `compressed-${filename}`,
      sizeKB: outputKB,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Rotate
export const rotateImage = async (req, res) => {
  try {
    const { filename, angle } = req.body;
    const inputPath = path.join("uploads", filename);
    const outputPath = path.join("uploads", `rotated-${filename}`);

    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath).rotate(parseInt(angle)).toFile(outputPath);

    res.json({ message: "Image rotated", filename: `rotated-${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crop
export const cropImage = async (req, res) => {
  try {
    const { filename, width, height, left, top } = req.body;
    const inputPath = path.join("uploads", filename);
    const outputPath = path.join("uploads", `cropped-${filename}`);

    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: "File not found" });

    await sharp(inputPath)
      .extract({ width: parseInt(width), height: parseInt(height), left: parseInt(left), top: parseInt(top) })
      .toFile(outputPath);

    res.json({ message: "Image cropped", filename: `cropped-${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
