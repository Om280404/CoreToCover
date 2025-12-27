import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { productType } = req.body;

    const base =
      productType === "material" ? "raw" : "finished";

    const folder =
      file.fieldname === "images"
        ? `uploads/${base}/images`
        : `uploads/${base}/videos`;

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
  },
});
