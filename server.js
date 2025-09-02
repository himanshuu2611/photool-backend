import express from "express";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/images", imageRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
