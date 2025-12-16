import multer from "multer";
import fs from "fs";
import path from "path";

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    const dir = file.mimetype.startsWith("video")
      ? "uploads/videos"
      : "uploads/images";

    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
