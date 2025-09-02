import path from "path";
import fs from "fs";
import * as Jimp from "jimp";


// Upload
export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "File uploaded", filename: req.file.filename });
};

// Download
export const downloadImage = (req, res) => {
  const filePath = path.join(process.cwd(), "uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    } else {
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

    if (!fs.existsSync(inputPath))
      return res.status(404).json({ error: "File not found" });

    const image = await Jimp.read(inputPath);
    await image.resize(parseInt(width), parseInt(height)).writeAsync(outputPath);

    res.json({ message: "Image resized", filename: `resized-${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Compress
export const compressImage = async (req, res) => {
  try {
    const { filename, quality } = req.body; // quality = 1-100
    const inputPath = path.join("uploads", filename);
    const outputPath = path.join("uploads", `compressed-${filename}`);

    if (!fs.existsSync(inputPath))
      return res.status(404).json({ error: "File not found" });

    const image = await Jimp.read(inputPath);
    await image.quality(Math.min(Math.max(parseInt(quality), 1), 100)).writeAsync(outputPath);

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

    if (!fs.existsSync(inputPath))
      return res.status(404).json({ error: "File not found" });

    const image = await Jimp.read(inputPath);
    await image.rotate(parseInt(angle)).writeAsync(outputPath);

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

    if (!fs.existsSync(inputPath))
      return res.status(404).json({ error: "File not found" });

    const image = await Jimp.read(inputPath);
    await image
      .crop(parseInt(left), parseInt(top), parseInt(width), parseInt(height))
      .writeAsync(outputPath);

    res.json({ message: "Image cropped", filename: `cropped-${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
