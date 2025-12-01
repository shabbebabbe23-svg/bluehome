import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const upload = multer({ dest: path.join(__dirname, "../public/logos/") });

// Skapa mappen om den inte finns
fs.mkdirSync(path.join(__dirname, "../public/logos"), { recursive: true });

app.post("/api/upload-logo", upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Ingen fil mottagen" });

  const ext = path.extname(req.file.originalname);
  const newName = `logo_${Date.now()}${ext}`;
  const newPath = path.join(__dirname, "../public/logos", newName);

  fs.rename(req.file.path, newPath, (err) => {
    if (err) return res.status(500).json({ error: "Kunde inte spara filen" });
    // Returnera publik URL
    res.json({ url: `/logos/${newName}` });
  });
});

app.use("/logos", express.static(path.join(__dirname, "../public/logos")));

app.listen(3001, () => console.log("Upload-servern kör på http://localhost:3001"));
