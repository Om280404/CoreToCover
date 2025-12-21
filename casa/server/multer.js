import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productType = req.body.productType; // finished | material

    if (!productType) {
      return cb(new Error("productType is required"));
    }

    let uploadPath = "uploads";

    if (file.mimetype.startsWith("image")) {
      uploadPath += productType === "finished"
        ? "/finished/images"
        : "/raw/images";
    } else if (file.mimetype.startsWith("video")) {
      uploadPath += productType === "finished"
        ? "/finished/videos"
        : "/raw/videos";
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },


});

export const upload = multer({ storage });

/* ============================
   DESIGNER PROFILE UPLOAD
============================ */
const designerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/designers/profiles";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadDesignerProfile = multer({
  storage: designerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ============================
   DESIGNER PORTFOLIO UPLOAD
============================ */
const designerPortfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/designers/portfolio";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadDesignerPortfolio = multer({
  storage: designerPortfolioStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

