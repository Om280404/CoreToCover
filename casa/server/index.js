import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { upload, uploadDesignerProfile, uploadDesignerPortfolio, uploadReturnImages } from "./multer.js";
import path from "path";

import crypto from "crypto";
import nodemailer from "nodemailer";



const app = express();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");


app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
  })
);

app.use(express.json()); // ✅ REQUIRED

app.use(express.urlencoded({ extended: true, limit: "100mb" }));

/* ============================
   TEST ROUTE (IMPORTANT)
============================ */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use(
  "/finished/images",
  express.static(path.join(process.cwd(), "uploads/finished/images"))
);

app.use(
  "/raw/images",
  express.static(path.join(process.cwd(), "uploads/raw/images"))
);

app.use(
  "/finished/videos",
  express.static(path.join(process.cwd(), "uploads/finished/videos"))
);

app.use(
  "/raw/videos",
  express.static(path.join(process.cwd(), "uploads/raw/videos"))
);

app.use(
  "/designers/profiles",
  express.static(path.join(process.cwd(), "uploads/designers/profiles"))
);

app.use(
  "/designers/portfolio",
  express.static(path.join(process.cwd(), "uploads/designers/portfolio"))
);

app.use(
  "/returns/images",
  express.static(path.join(process.cwd(), "uploads/returns/images"))
);



// ============================
// SIGNUP
// ============================
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailNormalized = email.trim().toLowerCase();

    // 🔐 EMAIL MUST BE VERIFIED
    const verifiedOtp = await prisma.customerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOtp) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: emailNormalized,
        phone,
        address,
        password: hashedPassword,
      },
    });

    // 🧹 cleanup OTPs
    await prisma.customerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});


/* ============================
   CUSTOMER OTP
============================ */
app.post("/customer/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const emailNormalized = email.trim().toLowerCase();

    await prisma.customerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.customerOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailNormalized,
      subject: "Casa Email Verification",
      html: `
        <h2>Verify your email</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("CUSTOMER SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


app.post("/customer/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email & OTP required" });

    const record = await prisma.customerOtp.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.otpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await prisma.customerOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    res.json({ message: "Email verified" });
  } catch (err) {
    console.error("CUSTOMER VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});


// ============================
// LOGIN
// ============================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ============================
   SELLER SIGNUP
============================ */
app.post("/seller/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailNormalized = email.trim().toLowerCase();

    // ✅ VERIFY EMAIL OTP ONLY
    const verifiedOtp = await prisma.sellerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOtp) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const existingSeller = await prisma.seller.findUnique({
      where: { email: emailNormalized },
    });

    if (existingSeller) {
  return res.status(409).json({
    message: "Account already exists. Please login.",
    redirect: "/seller/login",
  });
}


    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.seller.create({
      data: {
        name,
        email: emailNormalized,
        phone,
        password: hashedPassword,
      },
    });

    // ✅ CLEANUP OTPs CORRECTLY
    await prisma.sellerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    res.status(201).json({ sellerId: seller.id });
  } catch (err) {
    console.error("SELLER SIGNUP ERROR:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});


/* ===============
   OTP via API
==================*/
app.post("/seller/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const emailNormalized = email.trim().toLowerCase();

    // delete old OTPs
    await prisma.sellerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.sellerOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailNormalized,
      subject: "Casa Seller Verification Code",
      html: `
        <h2>Casa Seller Verification</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("EMAIL OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


/*========
VERIFY OTP
==========*/
app.post("/seller/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const record = await prisma.sellerOtp.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (record.otpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    await prisma.sellerOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});


/* ======================
   SELLER LOGIN
======================
*/
app.post("/seller/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await prisma.seller.findUnique({
      where: { email },
    });

    if (!seller) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, seller.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      seller: {
        id: seller.id,
        name: seller.name,   // ✅ correct field
        email: seller.email,
      },
    });
  } catch (err) {
    console.error("SELLER LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ============================
// VERIFY SELLER PASSWORD (for sensitive actions)
// ============================
app.post("/seller/verify-password", async (req, res) => {
  try {
    const { sellerId, password } = req.body;

    if (!sellerId || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: Number(sellerId) },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const isValid = await bcrypt.compare(password, seller.password);

    if (!isValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json({ verified: true });
  } catch (err) {
    console.error("VERIFY PASSWORD ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});


// ============================
// SEARCH PRODUCTS
// ============================
app.get("/products/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) return res.json([]);

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
        availability: {
          not: "discontinued",
        },
      },
      include: {
        seller: {
          select: {
            name: true,
            business: {
              select: { city: true, state: true },
            },
          },
        },
        ratings: {
          select: { stars: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => {
      const total = p.ratings.reduce((sum, r) => sum + r.stars, 0);
      const count = p.ratings.length;
      const avgRating = count ? total / count : 0;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,

        // ✅ FULL IMAGE URLs
        images: p.images.map(
          (img) => `http://localhost:3001/${img}`
        ),

        video: p.video
          ? `http://localhost:3001/${p.video}`
          : null,

        availability: p.availability,

        sellerId: p.sellerId,
        sellerName: p.seller.name,
        location: p.seller.business
          ? `${p.seller.business.city}, ${p.seller.business.state}`
          : "Not specified",

        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: count,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("SEARCH PRODUCTS ERROR:", err);
    res.status(500).json([]);
  }
});

/* =========================
   UPDATE USER PROFILE
========================= */
app.get("/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email)
      .trim()
      .toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/* =========================
   CREATE SELLER BUSINESS DETAILS
========================= */
app.post("/seller/business-details", async (req, res) => {
  try {
    const {
      sellerId,
      businessName,
      sellerType,
      address,
      city,
      state,
      pincode,
      gst,
    } = req.body;

    if (!sellerId || !businessName || !sellerType) {
      return res.status(400).json({
        message: "sellerId, businessName and sellerType are required",
      });
    }

    // Check seller exists
    const seller = await prisma.seller.findUnique({
      where: { id: Number(sellerId) },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Prevent duplicate business entry
    const existingBusiness = await prisma.sellerBusinessDetails.findUnique({
      where: { sellerId: Number(sellerId) },
    });

    if (existingBusiness) {
      return res.status(409).json({
        message: "Business details already submitted",
      });
    }

    const business = await prisma.sellerBusinessDetails.create({
      data: {
        businessName,
        sellerType,
        address,
        city,
        state,
        pincode,
        gst,
        sellerId: Number(sellerId),
      },
    });

    res.status(201).json({
      message: "Business details saved successfully",
      business,
    });
  } catch (error) {
    console.error("Business details error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* =========================
   GET SELLER BUSINESS DETAILS
========================= */
app.get("/seller/:sellerId/business-details", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    const business = await prisma.sellerBusinessDetails.findUnique({
      where: { sellerId },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business details not found",
      });
    }

    res.json(business);
  } catch (error) {
    console.error("Fetch business error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* =========================
   UPDATE SELLER BUSINESS DETAILS
========================= */
app.put("/seller/:sellerId/business-details", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);
    const {
      businessName,
      sellerType,
      address,
      city,
      state,
      pincode,
      gst,
    } = req.body;

    const existing = await prisma.sellerBusinessDetails.findUnique({
      where: { sellerId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Business details not found",
      });
    }

    const updated = await prisma.sellerBusinessDetails.update({
      where: { sellerId },
      data: {
        businessName,
        sellerType,
        address,
        city,
        state,
        pincode,
        gst,
      },
    });

    res.json({
      message: "Business details updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Update business error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


/* =========================
   POST SELLER DELIVERY DETAILS
========================= */
app.post("/seller/delivery-details", async (req, res) => {
  try {
    const {
      sellerId,
      deliveryResponsibility,
      deliveryCoverage,
      deliveryType,
      deliveryTimeMin,
      deliveryTimeMax,
      shippingChargeType,
      shippingCharge,
      internationalDelivery,
      installationAvailable,
      installationCharge,
    } = req.body;

    /* =========================
       VALIDATION
    ========================= */
    if (!sellerId || isNaN(Number(sellerId))) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    /* =========================
       NORMALIZE TYPES (MATCH PRISMA)
    ========================= */

    // Boolean (Prisma expects Boolean)
    const normalizedInternationalDelivery =
      internationalDelivery === true ||
      internationalDelivery === "true" ||
      internationalDelivery === "yes" ||
      internationalDelivery === 1;

    // String (Prisma expects String)
    const normalizedInstallationAvailable =
      installationAvailable === true ||
        installationAvailable === "true" ||
        installationAvailable === "yes" ||
        installationAvailable === 1
        ? "yes"
        : "no";

    /* =========================
       NUMBER NORMALIZATION
    ========================= */
    const normalizedDeliveryTimeMin =
      deliveryTimeMin !== "" && deliveryTimeMin !== undefined
        ? Number(deliveryTimeMin)
        : null;

    const normalizedDeliveryTimeMax =
      deliveryTimeMax !== "" && deliveryTimeMax !== undefined
        ? Number(deliveryTimeMax)
        : null;

    const normalizedShippingCharge =
      shippingCharge !== "" && shippingCharge !== undefined
        ? Number(shippingCharge)
        : null;

    const normalizedInstallationCharge =
      normalizedInstallationAvailable === "yes" &&
        installationCharge !== "" &&
        installationCharge !== undefined
        ? Number(installationCharge)
        : null;

    /* =========================
       UPSERT
    ========================= */
    const delivery = await prisma.sellerDeliveryDetails.upsert({
      where: { sellerId: Number(sellerId) },

      update: {
        deliveryResponsibility,
        deliveryCoverage,
        deliveryType,

        deliveryTimeMin: normalizedDeliveryTimeMin,
        deliveryTimeMax: normalizedDeliveryTimeMax,

        shippingChargeType,
        shippingCharge: normalizedShippingCharge,

        internationalDelivery: normalizedInternationalDelivery, // BOOLEAN ✅
        installationAvailable: normalizedInstallationAvailable, // STRING ✅
        installationCharge: normalizedInstallationCharge,
      },

      create: {
        sellerId: Number(sellerId),
        deliveryResponsibility,
        deliveryCoverage,
        deliveryType,

        deliveryTimeMin: normalizedDeliveryTimeMin,
        deliveryTimeMax: normalizedDeliveryTimeMax,

        shippingChargeType,
        shippingCharge: normalizedShippingCharge,

        internationalDelivery: normalizedInternationalDelivery, // BOOLEAN ✅
        installationAvailable: normalizedInstallationAvailable, // STRING ✅
        installationCharge: normalizedInstallationCharge,
      },
    });

    res.json({
      message: "Delivery details saved successfully",
      delivery,
    });
  } catch (err) {
    console.error("SAVE DELIVERY ERROR:", err);
    res.status(500).json({ message: "Failed to save delivery details" });
  }
});



// =========================
// GET SELLER DELIVERY DETAILS
// =========================
app.get("/seller/:sellerId/delivery-details", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    if (isNaN(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    const delivery = await prisma.sellerDeliveryDetails.findUnique({
      where: { sellerId },
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery details not found" });
    }

    res.json(delivery);
  } catch (err) {
    console.error("FETCH DELIVERY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch delivery details" });
  }
});

/* =========================
   ADD PRODUCT
========================= */
app.post(
  "/seller/product",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        sellerId,
        name,
        price,
        productType,
        category,
        description,
        availability = "available", // ✅ DEFAULT
      } = req.body;

      if (!sellerId || !name || !price || !productType || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!req.files?.images || req.files.images.length === 0) {
        return res.status(400).json({ message: "At least one image is required" });
      }

      const seller = await prisma.seller.findUnique({
        where: { id: Number(sellerId) },
      });

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const imagePaths = req.files.images.map((file) =>
        file.path.replace(/\\/g, "/").replace("uploads/", "")
      );

      let videoPath = null;
      if (req.files.video?.length > 0) {
        videoPath = req.files.video[0].path
          .replace(/\\/g, "/")
          .replace("uploads/", "");
      }

      const product = await prisma.product.create({
        data: {
          sellerId: Number(sellerId),
          name: name.trim(),
          price: Number(price),
          productType: productType.toLowerCase(),
          category: category.trim(),
          description: description?.trim() || null,
          images: imagePaths,
          video: videoPath,
          availability, // ✅ STORED
        },
      });

      res.status(201).json({
        message: "Product added successfully",
        product,
      });
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err);
      res.status(500).json({ message: "Server error while adding product" });
    }
  }
);

// ============================
// ADD / UPDATE SELLER BANK DETAILS
// ============================
app.post("/seller/bank-details", async (req, res) => {
  try {
    const {
      sellerId,
      accountHolder,
      bankName,
      accountNumber,
      ifsc,
    } = req.body;

    if (
      !sellerId ||
      !accountHolder ||
      !bankName ||
      !accountNumber ||
      !ifsc
    ) {
      return res.status(400).json({
        message: "All bank fields are required",
      });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: Number(sellerId) },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const bank = await prisma.sellerBankDetails.upsert({
      where: { sellerId: Number(sellerId) },
      update: {
        accountHolder,
        bankName,
        accountNumber,
        ifsc,
      },
      create: {
        sellerId: Number(sellerId),
        accountHolder,
        bankName,
        accountNumber,
        ifsc,
      },
    });

    res.json({
      message: "Bank details saved successfully",
      bank,
    });
  } catch (err) {
    console.error("BANK DETAILS ERROR:", err);
    res.status(500).json({ message: "Failed to save bank details" });
  }
});

// ============================
// GET SELLER BANK DETAILS
// ============================
app.get("/seller/:sellerId/bank-details", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    const bank = await prisma.sellerBankDetails.findUnique({
      where: { sellerId },
      select: {
        accountHolder: true,
        bankName: true,
        accountNumber: true,
        ifsc: true,
      },
    });

    if (!bank) {
      return res.json(null);
    }

    res.json(bank);
  } catch (err) {
    console.error("FETCH BANK DETAILS ERROR:", err);
    res.status(500).json(null);
  }
});

// ============================
// CHECK SELLER ONBOARDING STATUS
// ============================
app.get("/seller/:sellerId/onboarding-status", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        business: true,
        bank: true,
      },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({
      hasBusinessDetails: !!seller.business,
      hasBankDetails: !!seller.bank,
    });
  } catch (err) {
    console.error("ONBOARDING STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to check status" });
  }
});

// ============================
// GET PRODUCTS BY TYPE
// ============================
app.get("/products", async (req, res) => {
  try {
    const { type } = req.query;

    const products = await prisma.product.findMany({
      where: type ? { productType: type } : {},
      include: {
        seller: {
          select: {
            name: true,
            business: {
              select: { city: true, state: true },
            },
          },
        },
        ratings: {
          select: { stars: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => {
      const total = p.ratings.reduce((sum, r) => sum + r.stars, 0);
      const count = p.ratings.length;
      const avgRating = count ? total / count : 0;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        availability: p.availability,
        productType: p.productType,

        // ✅ RELATIVE PATHS ONLY
        images: p.images,
        video: p.video,

        sellerId: p.sellerId,
        seller: p.seller.name,
        sellerBusiness: p.seller.business,

        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: count,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("FETCH PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.post("/order/place", async (req, res) => {
  try {
    const {
      customerEmail,
      checkoutDetails,
      orders,
      summary,
      creditUsed = 0, // ✅ NEW
    } = req.body;

    if (!customerEmail || !orders?.length) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creditToUse = Number(creditUsed || 0);

    // ✅ CREDIT VALIDATION
    if (creditToUse > 0) {
      if (user.credit < creditToUse) {
        return res.status(400).json({
          message: "Insufficient store credit",
        });
      }
    }

    /* =========================
       USE TRANSACTION
    ========================= */
    const result = await prisma.$transaction(async (tx) => {
      /* =========================
         CREATE ORDER
      ========================= */
      const order = await tx.order.create({
        data: {
          userId: user.id,
          customerEmail,
          customerName: checkoutDetails.name,
          address: checkoutDetails.address,

          // ✅ PAYMENT METHOD
          paymentMethod:
            creditToUse > 0
              ? "store_credit"
              : checkoutDetails.paymentMethod,

          subtotal: summary.subtotal,
          casaCharge: summary.casaCharge,
          deliveryCharge: summary.deliveryCharge,
          grandTotal: summary.grandTotal,
        },
      });

      /* =========================
         FETCH SELLER DELIVERY SNAPSHOTS
      ========================= */
      const sellerDeliveryMap = {};

      for (const item of orders) {
        if (!sellerDeliveryMap[item.supplierId]) {
          sellerDeliveryMap[item.supplierId] =
            await tx.sellerDeliveryDetails.findUnique({
              where: { sellerId: item.supplierId },
            });
        }
      }

      /* =========================
         CREATE ORDER ITEMS
      ========================= */
      const orderItemsData = await Promise.all(
        orders.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.materialId },
          });

          const delivery = sellerDeliveryMap[item.supplierId];

          return {
            orderId: order.id,

            materialId: item.materialId,
            materialName: item.materialName,
            supplierName: item.supplierName,

            sellerId: item.supplierId,
            quantity: item.trips,
            pricePerUnit: item.amountPerTrip,
            totalAmount: item.amountPerTrip * item.trips,

            imageUrl: product?.images?.[0] || null,

            deliveryTimeMin: delivery?.deliveryTimeMin || null,
            deliveryTimeMax: delivery?.deliveryTimeMax || null,
            shippingChargeType:
              delivery?.shippingChargeType ?? "free",
            shippingCharge:
              delivery?.shippingCharge ?? 0,
            installationAvailable:
              delivery?.installationAvailable ?? "no",
            installationCharge:
              delivery?.installationCharge ?? 0,
          };
        })
      );

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      /* =========================
         💳 DEDUCT STORE CREDIT
      ========================= */
      if (creditToUse > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            credit: {
              decrement: creditToUse,
            },
          },
        });
      }

      return order;
    });

    // after the transaction completes (result is the created order)
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credit: true },
    });

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: result.id,
      creditUsed: creditToUse,
      newCredit: updatedUser?.credit ?? 0, // return the updated credit
    });

  } catch (error) {
    console.error("ORDER PLACE ERROR:", error);
    return res.status(500).json({
      message: "Failed to place order",
    });
  }
});


app.get("/orders/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json([]);
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            seller: {
              select: { name: true },
            },
            rating: true, // 🔥 THIS IS THE KEY FIX
          },
        },
      },
    });

    const formatted = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: order.id,
        displayId: `ORD-${order.id}`,
        orderItemId: item.id,

        productName: item.materialName,
        sellerName: item.seller.name,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        imageUrl: item.imageUrl,

        orderStatus: item.status,
        createdAt: order.createdAt,

        // ✅ THIS FIXES REFRESH ISSUE
        isRated: Boolean(item.rating),

        // optional (future use)
        rating: item.rating
          ? {
            stars: item.rating.stars,
            comment: item.rating.comment,
          }
          : null,

        // ✅ DELIVERY DETAILS FOR UI
        deliveryTimeMin: item.deliveryTimeMin,
        deliveryTimeMax: item.deliveryTimeMax,
        shippingChargeType: item.shippingChargeType,
        shippingCharge: item.shippingCharge,
        installationAvailable: item.installationAvailable,
        installationCharge: item.installationCharge,
      }))
    );

    res.json(formatted);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json([]);
  }
});


// ============================
// GET PRODUCTS OF A SELLER
// ============================
app.get("/seller/:sellerId/products", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    if (!sellerId || isNaN(sellerId)) {
      return res.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(products);
  } catch (err) {
    console.error("FETCH SELLER PRODUCTS ERROR:", err);
    res.status(500).json([]);
  }
});

// ============================
// DELETE PRODUCT (SELLER)
// ============================
app.delete("/seller/product/:id", async (req, res) => {
  console.log("🔥 DELETE PRODUCT ROUTE HIT");

  try {
    const productId = Number(req.params.id);

    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// ============================
// UPDATE PRODUCT (EDIT) 
// ============================
app.put(
  "/seller/product/:id",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      const {
        name,
        category,
        productType, // 🔥 REQUIRED
        price,
        description,
        availability,
        existingImages,
        removeVideo,
      } = req.body;

      if (!productType) {
        return res.status(400).json({
          message: "productType is required",
        });
      }

      // ✅ parse existing images safely
      let keptImages = [];
      if (existingImages) {
        try {
          keptImages = JSON.parse(existingImages);
        } catch {
          keptImages = [];
        }
      }

      // ✅ new uploaded images
      const newImages =
        req.files?.images?.map((file) =>
          file.path.replace(/\\/g, "/").replace("uploads/", "")
        ) || [];

      const finalImages = [...keptImages, ...newImages];

      // ✅ handle video
      let videoPath = undefined;

      if (req.files?.video?.length) {
        videoPath = req.files.video[0].path
          .replace(/\\/g, "/")
          .replace("uploads/", "");
      } else if (removeVideo === "true") {
        videoPath = null;
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          name: name?.trim(),
          category: category?.trim(),
          productType, // 🔥 KEEP UPDATED
          price: Number(price),
          description: description?.trim() || null,
          availability,
          images: finalImages,
          ...(videoPath !== undefined && { video: videoPath }),
        },
      });

      res.json({
        message: "Product updated successfully",
        product: updated,
      });
    } catch (err) {
      console.error("UPDATE PRODUCT ERROR:", err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);

app.get("/product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id); // ✅ FIX

    if (isNaN(id)) {
      return res.status(400).json(null);
    }

    const product = await prisma.product.findUnique({
      where: { id }, // ✅ now Int
      include: {
        seller: {
          select: {
            name: true,
            business: {
              select: { city: true, state: true },
            },
            delivery: true,
          },
        },
        ratings: {
          select: { stars: true, comment: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json(null);
    }

    const total = product.ratings.reduce((s, r) => s + r.stars, 0);
    const count = product.ratings.length;

    res.json({
      id: product.id,
      sellerId: product.sellerId,
      title: product.name,
      seller: product.seller.name,
      origin: product.seller.business
        ? `${product.seller.business.city}, ${product.seller.business.state}`
        : "Not specified",
      price: product.price,
      images: product.images.map(img => `http://localhost:3001/${img}`),
      video: product.video
        ? `http://localhost:3001/${product.video}`
        : null,
      description: product.description,
      availability: product.availability,
      avgRating: count ? total / count : 0,
      ratingCount: count,
      deliveryTimeMin: product.seller.delivery?.deliveryTimeMin ?? null,
      deliveryTimeMax: product.seller.delivery?.deliveryTimeMax ?? null,
      installationAvailable:
        product.seller.delivery?.installationAvailable ?? "no",
      installationCharge:
        product.seller.delivery?.installationCharge ?? 0,
      shippingChargeType: product.seller.delivery?.shippingChargeType ?? "free",
      shippingCharge: product.seller.delivery?.shippingCharge ?? 0,
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json(null);
  }
});

// ============================
// GET SELLER PROFILE
// ============================
app.get("/seller/profile/:id", async (req, res) => {
  try {
    const sellerId = Number(req.params.id);

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        business: {
          select: {
            city: true,
            state: true,
          },
        },
      },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      location: seller.business
        ? `${seller.business.city}, ${seller.business.state}`
        : "Not set",
    });
  } catch (err) {
    console.error("GET SELLER PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch seller profile" });
  }
});

// ============================
// UPDATE SELLER PROFILE
// ============================
app.put("/seller/profile/:id", async (req, res) => {
  try {
    const sellerId = Number(req.params.id);
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        name: name.trim(),
        phone: phone.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      seller: updatedSeller,
    });
  } catch (err) {
    console.error("UPDATE SELLER PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ============================
// GET SELLER ORDERS (include totalAmount)
// ============================
app.get("/seller/:sellerId/orders", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);
    if (isNaN(sellerId)) return res.json([]);

    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId },
      include: {
        order: {
          select: {
            address: true,
            customerName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      orderItems.map((item) => ({
        id: item.id,
        material: item.materialName,
        quantity: item.quantity,

        // customer/site (snapshot)
        customer: item.order?.customerName || "Customer",
        siteLocation: item.order?.address || "Not specified",

        // status/time
        status: item.status,
        time: item.createdAt,

        // IMPORTANT: include the per-item amount so frontend can sum earnings
        totalAmount: item.totalAmount ?? 0,
        pricePerUnit: item.pricePerUnit ?? null,
      }))
    );
  } catch (err) {
    console.error("FETCH SELLER ORDERS ERROR:", err);
    res.status(500).json([]);
  }
});

// ============================
// SELLER DASHBOARD SUMMARY (ordersCount + totalEarnings)
// ============================
app.get("/seller/:sellerId/dashboard", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);
    if (isNaN(sellerId)) return res.status(400).json({ message: "Invalid sellerId" });

    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId },
      select: {
        status: true,
        totalAmount: true,
      },
    });

    const ordersCount = orderItems.length;
    const totalEarnings = orderItems
      .filter((it) => it.status === "fulfilled")
      .reduce((s, it) => s + Number(it.totalAmount ?? 0), 0);

    res.json({
      ordersCount,
      totalEarnings,
    });
  } catch (err) {
    console.error("SELLER DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});



// ============================
// GET USER ORDERS
// ============================
app.get("/orders/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json([]);
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: user.id,
        },
      },
      include: {
        rating: true,
        product: true,
        seller: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(
      orderItems.map((item) => ({
        orderItemId: item.id,
        id: item.orderId,
        productName: item.product.name,
        sellerName: item.seller.name,
        quantity: item.quantity,
        totalAmount: item.totalPrice,
        imageUrl: item.product.images?.[0] || null,
        orderStatus: item.status,

        deliveryTimeMin: item.deliveryTimeMin,
        deliveryTimeMax: item.deliveryTimeMax,
        shippingChargeType: item.shippingChargeType,
        shippingCharge: item.shippingCharge,
        installationAvailable: item.installationAvailable,
        installationCharge: item.installationCharge,

        isRated: !!item.rating, // ⭐ SOURCE OF TRUTH
      }))
    );
  } catch (err) {
    console.error("FETCH USER ORDERS ERROR:", err);
    res.status(500).json([]);
  }
});


// ============================
// UPDATE ORDER ITEM STATUS
// ============================
app.patch("/seller/order/:orderItemId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const orderItemId = Number(req.params.orderItemId);

    // 🔒 Validate allowed statuses
    const allowed = ["pending", "confirmed", "out_for_delivery", "rejected", "fulfilled", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ ok: false });
  }
});

// ============================
// USER CANCEL ORDER (WITH RULES)
// ============================
app.patch("/order/:orderId/cancel", async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    /* =========================
       FETCH ORDER
    ========================= */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true, // order items
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    /* =========================
       STATUS VALIDATION
    ========================= */
    const nonCancelableStatuses = [
      "fulfilled",
      "rejected",
      "cancelled",
    ];

    const hasNonCancelableItem = order.items.some((item) =>
      nonCancelableStatuses.includes(item.status)
    );

    if (hasNonCancelableItem) {
      return res.status(400).json({
        message:
          "This order cannot be cancelled because it is already processed",
      });
    }

    /* =========================
       2-DAY TIME LIMIT CHECK
    ========================= */
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const orderTime = new Date(order.createdAt).getTime();

    if (now - orderTime > TWO_DAYS) {
      return res.status(400).json({
        message: "Order can only be cancelled within 2 days of placing",
      });
    }

    /* =========================
       CANCEL ALL ORDER ITEMS
    ========================= */
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { status: "cancelled" }, // unified cancel state
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ CANCEL ORDER ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to cancel order",
    });
  }
});

// ============================
// RATE ORDER ITEM 
// ============================
app.post("/order/item/:orderItemId/rate", async (req, res) => {
  try {
    const orderItemId = Number(req.params.orderItemId);
    const { stars, comment, userEmail } = req.body;

    if (!stars || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: {
        id: true,
        status: true,
        materialId: true,   // ✅ FIXED
        rating: true,
      },
    });

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (orderItem.status !== "fulfilled") {
      return res
        .status(400)
        .json({ message: "You can only rate delivered orders" });
    }

    if (orderItem.rating) {
      return res.status(409).json({ message: "Already rated" });
    }

    const rating = await prisma.rating.create({
      data: {
        stars,
        comment: comment || null,

        user: {
          connect: { id: user.id },
        },

        // ✅ CONNECT TO PRODUCT / MATERIAL
        product: {
          connect: { id: orderItem.materialId },
        },

        orderItem: {
          connect: { id: orderItem.id },
        },
      },
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating,
    });
  } catch (err) {
    console.error("RATE ORDER ERROR:", err);
    return res.status(500).json({ message: "Failed to submit rating" });
  }
});




// ============================
// GET PRODUCT RATINGS & REVIEWS
// ============================
app.get("/product/:productId/ratings", async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const ratings = await prisma.rating.findMany({
      where: { productId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avg =
      ratings.reduce((s, r) => s + r.stars, 0) /
      (ratings.length || 1);

    res.json({
      avgRating: Number(avg.toFixed(1)),
      count: ratings.length,
      reviews: ratings.map((r) => ({
        id: r.id,
        stars: r.stars,
        comment: r.comment,
        user: r.user.name,
      })),
    });
  } catch {
    res.json({ avgRating: 0, count: 0, reviews: [] });
  }
});

// ===============================
// RETURN ORDER API (INLINE)
// ===============================
app.post(
  "/api/returns",
  uploadReturnImages.array("images", 5),
  async (req, res) => {
    try {
      const { orderItemId, reason, note, refundMethod } = req.body;
      const userEmail = req.headers["x-user-email"];

      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!["STORE_CREDIT", "ORIGINAL_PAYMENT"].includes(refundMethod)) {
        return res.status(400).json({ message: "Invalid refund method" });
      }

      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      const item = await prisma.orderItem.findUnique({
        where: { id: Number(orderItemId) },
        include: { order: true, seller: true },
      });

      if (!item || item.order.userId !== user.id) {
        return res.status(403).json({ message: "Invalid order" });
      }

      if (item.status !== "fulfilled") {
        return res.status(400).json({
          message: "Only delivered items can be returned",
        });
      }

      //  Prevent duplicate return
      const existing = await prisma.returnRequest.findUnique({
        where: { orderItemId: item.id },
      });

      if (existing) {
        return res.status(400).json({
          message: "Return already requested for this item",
        });
      }

      const images = (req.files || []).map(
        (file) => `/returns/images/${file.filename}`
      );

      const returnRequest = await prisma.returnRequest.create({
        data: {
          orderItemId: item.id,
          userId: user.id,
          productName: item.materialName,
          sellerId: item.sellerId,
          sellerName: item.seller?.name,
          reason,
          note,
          images,
          refundMethod,              // ✅ STORE USER CHOICE
          refundAmount: item.totalAmount,
        },
      });

      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          returnStatus: "REQUESTED",
          returnRequestedAt: new Date(),
          status: "fulfilled", //  KEEP ORIGINAL STATUS
        },
      });

      res.json({
        message: "Return requested",
        returnRequest,
      });
    } catch (err) {
      console.error("RETURN REQUEST ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);



// USER RETURNS
app.get("/api/returns/user", async (req, res) => {
  try {
    const userEmail = req.headers["x-user-email"];
    if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    const returns = await prisma.returnRequest.findMany({
      where: { userId: user.id },
      include: { orderItem: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ returns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// USER CREDIT API
// ===============================
app.get("/api/returns/credit", async (req, res) => {
  try {
    const userEmail = req.headers["x-user-email"];
    if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { credit: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ credit: user.credit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// CANCEL RETURN
app.patch("/api/returns/:id/cancel", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userEmail = req.headers["x-user-email"];
    if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const rr = await prisma.returnRequest.findUnique({ where: { id } });
    if (!rr || rr.userId !== user.id) {
      return res.status(404).json({ message: "Return not found" });
    }

    if (rr.status !== "REQUESTED") {
      return res.status(400).json({ message: "Cannot cancel now" });
    }

    await prisma.$transaction([
      prisma.returnRequest.update({
        where: { id },
        data: {
          status: "CANCELLED",
          decidedAt: new Date(),
          decisionNote: "Cancelled by user",
          decidedBy: user.email,
        },
      }),
      prisma.orderItem.update({
        where: { id: rr.orderItemId },
        data: {
          returnStatus: "CANCELLED",
          // revert the item status to delivered (adjust if you track previous status)
          status: "fulfilled",
          // optionally clear returnRequestedAt
          returnRequestedAt: null,
        },
      }),
    ]);

    res.json({ message: "Return cancelled" });
  } catch (err) {
    console.error("CANCEL RETURN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// SELLER RETURN REQUESTS
// ===============================
app.get("/api/returns/seller", async (req, res) => {
  try {
    const sellerEmail = req.headers["x-seller-email"];
    if (!sellerEmail) return res.status(401).json({ message: "Unauthorized" });

    const seller = await prisma.seller.findUnique({
      where: { email: sellerEmail },
    });

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const returns = await prisma.returnRequest.findMany({
      where: { sellerId: seller.id },
      include: {
        orderItem: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ returns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// APPROVE RETURN (SELLER / ADMIN)
// ===============================
app.post("/api/returns/:id/approve", async (req, res) => {
  try {
    const returnId = Number(req.params.id);

    const sellerEmail = req.headers["x-seller-email"];
    if (!sellerEmail) return res.status(401).json({ message: "Unauthorized" });

    const seller = await prisma.seller.findUnique({
      where: { email: sellerEmail },
    });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const rr = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { orderItem: true },
    });

    if (!rr) return res.status(404).json({ message: "Return request not found" });

    if (rr.sellerId !== seller.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (rr.status !== "REQUESTED") {
      return res.status(400).json({ message: "Return already processed" });
    }

    const refundMethod = rr.refundMethod;
    const refundAmount = Number(rr.refundAmount ?? rr.orderItem.totalAmount);

    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: returnId },
        data: {
          status: "APPROVED",
          refundStatus:
            refundMethod === "STORE_CREDIT" ? "COMPLETED" : "PENDING",
          decidedAt: new Date(),
          decidedBy: seller.email,
          decisionNote: "Approved by seller",
        },
      });

      await tx.orderItem.update({
        where: { id: rr.orderItemId },
        data: {
          status: "returned",
          returnStatus: "APPROVED",
          returnResolvedAt: new Date(),
        },
      });

      if (refundMethod === "STORE_CREDIT") {
        await tx.user.update({
          where: { id: rr.userId },
          data: {
            credit: { increment: refundAmount },
          },
        });
      }
    });

    res.json({
      message:
        refundMethod === "STORE_CREDIT"
          ? "Return approved & store credit issued"
          : "Return approved & refund initiated",
      refundMethod,
    });
  } catch (err) {
    console.error("APPROVE RETURN ERROR:", err);
    res.status(500).json({ message: "Failed to approve return" });
  }
});



// ===============================
// REJECT RETURN (SELLER / ADMIN)
// ===============================
app.post("/api/returns/:id/reject", async (req, res) => {
  try {
    const returnId = Number(req.params.id);
    const { decisionNote } = req.body;

    const sellerEmail = req.headers["x-seller-email"];
    if (!sellerEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const seller = await prisma.seller.findUnique({
      where: { email: sellerEmail },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const rr = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { orderItem: true },
    });

    if (!rr) {
      return res.status(404).json({ message: "Return request not found" });
    }

    if (rr.sellerId !== seller.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (rr.status !== "REQUESTED") {
      return res.status(400).json({
        message: "Return already processed",
      });
    }

    /* ===============================
       1️⃣ UPDATE RETURN REQUEST
    =============================== */
    await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "REJECTED",
        decisionNote: decisionNote || "Rejected by seller",
        decidedAt: new Date(),
        decidedBy: seller.email,
      },
    });

    /* ===============================
       2️⃣ UPDATE ORDER ITEM
    =============================== */
    await prisma.orderItem.update({
      where: { id: rr.orderItemId },
      data: {
        returnStatus: "REJECTED",
        returnResolvedAt: new Date(),
      },
    });

    res.json({ message: "Return rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});



/* ============================
   DESIGNER SIGNUP
============================ */
app.post("/designer/signup", async (req, res) => {
  try {
    const { fullname, email, mobile, location, password } = req.body;

    if (!fullname || !email || !mobile || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailNormalized = email.trim().toLowerCase();

    /* =========================
       CHECK EMAIL OTP VERIFIED
    ========================= */
    const verifiedOtp = await prisma.designerOtp.findFirst({
      where: { email: emailNormalized },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOtp || !verifiedOtp.verified) {
      return res.status(403).json({
        message: "Email not verified",
      });
    }

    /* =========================
       CHECK EXISTING EMAIL
    ========================= */
    const existingEmail = await prisma.designer.findUnique({
      where: { email: emailNormalized },
    });

    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    /* =========================
       CHECK EXISTING MOBILE
    ========================= */
    const existingMobile = await prisma.designer.findUnique({
      where: { mobile },
    });

    if (existingMobile) {
      return res.status(409).json({ message: "Mobile already registered" });
    }

    /* =========================
       HASH PASSWORD
    ========================= */
    const passwordHash = await bcrypt.hash(password, 10);

    /* =========================
       CREATE DESIGNER
    ========================= */
    const designer = await prisma.designer.create({
      data: {
        fullname,
        email: emailNormalized,
        mobile,
        location,
        passwordHash,
      },
    });

    /* =========================
       CLEANUP OTP RECORDS
    ========================= */
    await prisma.designerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    res.status(201).json({
      message: "Designer created successfully",
      designer: { id: designer.id },
    });
  } catch (err) {
    console.error("DESIGNER SIGNUP ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


/* ============================
   DESIGNER OTP
============================ */
app.post("/designer/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const emailNormalized = email.trim().toLowerCase();

    // Remove old OTPs
    await prisma.designerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.designerOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailNormalized,
      subject: "Casa Designer Email Verification",
      html: `
        <h2>Verify your Designer account</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("DESIGNER EMAIL OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ============================
   DESIGNER VERIFY OTP
============================ */
app.post("/designer/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const record = await prisma.designerOtp.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (record.otpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    await prisma.designerOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    res.json({ message: "Email verified" });
  } catch (err) {
    console.error("DESIGNER VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});


/* ============================
   DESIGNER LOGIN
============================ */
app.post("/designer/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const designer = await prisma.designer.findUnique({
      where: { email },
    });

    if (!designer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, designer.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      designer: {
        id: designer.id,
        fullname: designer.fullname,
        email: designer.email,
        availability: designer.availability,
      },
    });
  } catch (err) {
    console.error("DESIGNER LOGIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


/* ============================
   GET DESIGNER BASIC INFO
============================ */
app.get("/designer/:id/basic", async (req, res) => {
  try {
    const designerId = Number(req.params.id);

    if (isNaN(designerId)) {
      return res.status(400).json({ message: "Invalid designer ID" });
    }

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      select: {
        id: true,
        fullname: true,
        email: true,
        availability: true,
      },
    });

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    res.json(designer);
  } catch (err) {
    console.error("GET DESIGNER BASIC ERROR:", err);
    res.status(500).json({ message: "Failed to fetch designer" });
  }
});

/* ============================
   UPDATE DESIGNER AVAILABILITY
============================ */
app.patch("/designer/:id/availability", async (req, res) => {
  try {
    const designerId = Number(req.params.id);
    const { availability } = req.body;

    if (isNaN(designerId)) {
      return res.status(400).json({ message: "Invalid designer ID" });
    }

    if (!["Available", "Unavailable"].includes(availability)) {
      return res.status(400).json({ message: "Invalid availability value" });
    }

    const designer = await prisma.designer.update({
      where: { id: designerId },
      data: { availability },
      select: {
        id: true,
        availability: true,
      },
    });

    res.json({
      message: "Availability updated successfully",
      availability: designer.availability,
    });
  } catch (err) {
    console.error("UPDATE AVAILABILITY ERROR:", err);
    res.status(500).json({ message: "Failed to update availability" });
  }
});



/* ============================
   DESIGNER PROFILE SETUP
============================ */
app.post(
  "/designer/profile",
  uploadDesignerProfile.single("profileImage"),
  async (req, res) => {
    try {
      const {
        designerId,
        experience,
        portfolio,
        designerType,
        bio,
      } = req.body;

      if (!designerId) {
        return res.status(400).json({
          message: "Designer ID is required",
        });
      }

      // 🔍 Verify designer exists
      const designer = await prisma.designer.findUnique({
        where: { id: Number(designerId) },
      });

      if (!designer) {
        return res.status(404).json({
          message: "Designer not found",
        });
      }

      // 📸 Image path
      let profileImage = null;
      if (req.file) {
        profileImage = req.file.path
          .replace(/\\/g, "/")
          .replace("uploads/", "");
      }

      // 🔁 UPSERT profile
      const profile = await prisma.designerProfile.upsert({
        where: { designerId: Number(designerId) },
        update: {
          experience: experience?.toString() || null,
          portfolio: portfolio?.trim() || null,
          designerType: designerType?.trim() || null,
          bio: bio?.trim() || null,
          ...(profileImage && { profileImage }),
        },
        create: {
          designerId: Number(designerId),
          experience: experience?.toString() || null,
          portfolio: portfolio?.trim() || null,
          designerType: designerType?.trim() || null,
          bio: bio?.trim() || null,
          profileImage,
        },
      });

      res.json({
        message: "Designer profile saved successfully",
        profile: {
          id: profile.id,
          designerId: profile.designerId,
          profileImage: profile.profileImage
            ? `http://localhost:3001/${profile.profileImage}`
            : null,
        },
      });
    } catch (err) {
      console.error("DESIGNER PROFILE ERROR:", err);
      res.status(500).json({
        message: "Failed to save designer profile",
      });
    }
  }
);

/* ============================
   GET DESIGNER EDIT PROFILE
============================ */
app.get("/designer/:id/edit-profile", async (req, res) => {
  try {
    const designerId = Number(req.params.id);

    if (isNaN(designerId)) {
      return res.status(400).json({ message: "Invalid designer ID" });
    }

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      include: {
        profile: true,
      },
    });

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    res.json({
      fullname: designer.fullname,
      email: designer.email,
      mobile: designer.mobile,
      location: designer.location,
      experience: designer.profile?.experience || "",
      portfolio: designer.profile?.portfolio || "",
      bio: designer.profile?.bio || "",
      designerType: designer.profile?.designerType || "",
      profileImage: designer.profile?.profileImage
        ? `http://localhost:3001/${designer.profile.profileImage}`
        : null,
    });
  } catch (err) {
    console.error("GET EDIT PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* ============================
   UPDATE DESIGNER EDIT PROFILE
============================ */
app.put(
  "/designer/:id/edit-profile",
  uploadDesignerProfile.single("profileImage"),
  async (req, res) => {
    try {
      const designerId = Number(req.params.id);

      const {
        fullname,
        email,
        mobile,
        location,
        experience,
        portfolio,
        bio,
        designerType,
      } = req.body;

      if (isNaN(designerId)) {
        return res.status(400).json({ message: "Invalid designer ID" });
      }

      const designer = await prisma.designer.findUnique({
        where: { id: designerId },
        include: { profile: true },
      });

      if (!designer) {
        return res.status(404).json({ message: "Designer not found" });
      }

      // profile image (optional)
      let profileImagePath = designer.profile?.profileImage || null;
      if (req.file) {
        profileImagePath = req.file.path
          .replace(/\\/g, "/")
          .replace("uploads/", "");
      }

      // 1️⃣ Update Designer (account)
      await prisma.designer.update({
        where: { id: designerId },
        data: {
          fullname,
          email,
          mobile,
          location,
        },
      });

      // 2️⃣ Update or Create DesignerProfile
      await prisma.designerProfile.upsert({
        where: { designerId },
        update: {
          experience,
          portfolio,
          bio,
          designerType,
          profileImage: profileImagePath,
        },
        create: {
          designerId,
          experience,
          portfolio,
          bio,
          designerType,
          profileImage: profileImagePath,
        },
      });

      res.json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error("UPDATE EDIT PROFILE ERROR:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);


/* ============================
   DESIGNER PORTFOLIO
============================ */
app.post(
  "/designer/portfolio",
  uploadDesignerPortfolio.array("images", 5),
  async (req, res) => {
    try {
      const { designerId, descriptions } = req.body;

      if (!designerId) {
        return res.status(400).json({
          message: "Designer ID is required",
        });
      }

      const designer = await prisma.designer.findUnique({
        where: { id: Number(designerId) },
      });

      if (!designer) {
        return res.status(404).json({
          message: "Designer not found",
        });
      }

      // Safety check
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "At least one work image is required",
        });
      }

      if (req.files.length > 5) {
        return res.status(400).json({
          message: "Maximum 5 works allowed",
        });
      }

      // descriptions may come as string or array
      const descArray = Array.isArray(descriptions)
        ? descriptions
        : [descriptions];

      // Prepare data
      const worksData = req.files.map((file, index) => ({
        designerId: Number(designerId),
        image: file.path
          .replace(/\\/g, "/")
          .replace("uploads/", ""),
        description: descArray[index] || null,
      }));

      await prisma.designerWork.createMany({
        data: worksData,
      });

      res.status(201).json({
        message: "Portfolio works saved successfully",
        count: worksData.length,
      });
    } catch (err) {
      console.error("DESIGNER PORTFOLIO ERROR:", err);
      res.status(500).json({
        message: "Failed to save portfolio",
      });
    }
  }
);

/* ============================
   GET DESIGNER PORTFOLIO
============================ */
app.get("/designer/:designerId/portfolio", async (req, res) => {
  try {
    const designerId = Number(req.params.designerId);

    if (isNaN(designerId)) {
      return res.status(400).json({ message: "Invalid designer ID" });
    }

    const works = await prisma.designerWork.findMany({
      where: { designerId },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      works.map((w) => ({
        id: w.id,
        description: w.description,
        preview: `http://localhost:3001/${w.image}`,
      }))
    );
  } catch (err) {
    console.error("FETCH DESIGNER PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});


/* ============================
   UPDATE DESIGNER WORK
============================ */
app.put(
  "/designer/work/:workId",
  uploadDesignerPortfolio.single("image"),
  async (req, res) => {
    try {
      const workId = Number(req.params.workId);
      const { description } = req.body;

      const existing = await prisma.designerWork.findUnique({
        where: { id: workId },
      });

      if (!existing) {
        return res.status(404).json({ message: "Work not found" });
      }

      let imagePath = undefined;
      if (req.file) {
        imagePath = req.file.path
          .replace(/\\/g, "/")
          .replace("uploads/", "");
      }

      const updated = await prisma.designerWork.update({
        where: { id: workId },
        data: {
          description,
          ...(imagePath && { image: imagePath }),
        },
      });

      res.json({
        message: "Work updated successfully",
        work: {
          id: updated.id,
          description: updated.description,
          preview: `http://localhost:3001/${updated.image}`,
        },
      });
    } catch (err) {
      console.error("UPDATE WORK ERROR:", err);
      res.status(500).json({ message: "Failed to update work" });
    }
  }
);

/* ============================
   DELETE DESIGNER WORK
============================ */
app.delete("/designer/work/:workId", async (req, res) => {
  try {
    const workId = Number(req.params.workId);

    const work = await prisma.designerWork.findUnique({
      where: { id: workId },
    });

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    await prisma.designerWork.delete({
      where: { id: workId },
    });

    res.json({ message: "Work deleted successfully" });
  } catch (err) {
    console.error("DELETE WORK ERROR:", err);
    res.status(500).json({ message: "Failed to delete work" });
  }
});

app.post(
  "/designer/:designerId/work",
  uploadDesignerPortfolio.single("image"),
  async (req, res) => {
    try {
      const designerId = Number(req.params.designerId);
      const { description } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      const work = await prisma.designerWork.create({
        data: {
          designerId,
          description,
          image: req.file.path
            .replace(/\\/g, "/")
            .replace("uploads/", ""),
        },
      });

      res.status(201).json({
        work: {
          id: work.id,
          description: work.description,
          preview: `http://localhost:3001/${work.image}`,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add work" });
    }
  }
);



/* ============================
   GET ALL DESIGNERS (PUBLIC)
============================ */
app.get("/designers", async (req, res) => {
  try {
    const designers = await prisma.designer.findMany({
      where: {
        availability: "Available",
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = designers.map((d) => ({
      id: d.id,
      name: d.fullname,
      category: d.profile?.designerType || "General",
      description: d.profile?.bio || "No description provided.",
      designerLocation: d.location || "Location not specified",
      imageUrl: d.profile?.profileImage
        ? `http://localhost:3001/${d.profile.profileImage}`
        : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("FETCH DESIGNERS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch designers",
    });
  }
});

/* ============================
   GET DESIGNER DETAILS
============================ */
app.get("/designer/:id", async (req, res) => {
  try {
    const designerId = Number(req.params.id);

    if (isNaN(designerId)) {
      return res.status(400).json({
        message: "Invalid designer ID",
      });
    }

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      include: {
        profile: true,
        works: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!designer) {
      return res.status(404).json({
        message: "Designer not found",
      });
    }

    res.json({
      id: designer.id,
      name: designer.fullname,
      designer: designer.fullname,
      category: designer.profile?.designerType || "General",
      description:
        designer.profile?.bio || "No description provided.",
      origin: designer.location || "Location not specified",
      image: designer.profile?.profileImage
        ? `http://localhost:3001/${designer.profile.profileImage}`
        : null,
      portfolio: designer.works.map((w) => ({
        id: w.id,
        image: `http://localhost:3001/${w.image}`,
        description: w.description,
      })),
    });
  } catch (err) {
    console.error("FETCH DESIGNER DETAIL ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch designer details",
    });
  }
});

/* ============================
   GET DESIGNER INFO (DETAIL PAGE)
============================ */
app.get("/designer/:id/info", async (req, res) => {
  try {
    const designerId = Number(req.params.id);

    if (isNaN(designerId)) {
      return res.status(400).json({ message: "Invalid designer ID" });
    }

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      include: {
        profile: true,
        works: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    res.json({
      id: designer.id,
      name: designer.fullname,

      // ✅ SAFE BOOLEAN CONVERSION
      availability: designer.availability?.toLowerCase() === "available",

      designerType: designer.profile?.designerType || "Designer",
      location: designer.location || "Location not specified",

      image: designer.profile?.profileImage
        ? `http://localhost:3001/${designer.profile.profileImage}`
        : null,

      bio: designer.profile?.bio || "",
      portfolio: designer.profile?.portfolio || null,


      works: designer.works.map((w) => ({
        id: w.id,
        img: `http://localhost:3001/${w.image}`,
        title: w.description?.split(".")[0] || "Design Work",
        desc: w.description || "",
      })),
    });
  } catch (err) {
    console.error("DESIGNER INFO ERROR:", err);
    res.status(500).json({ message: "Failed to fetch designer info" });
  }
});


/* ============================
   CREATE DESIGNER HIRE REQUEST
============================ */
app.post("/designer/:id/hire", async (req, res) => {
  try {
    const designerId = Number(req.params.id);

    const {
      userId,
      fullName,
      email,
      mobile,
      location,
      budget,
      workType,
      timelineDays,
      description,
    } = req.body;

    /* ---------------------------
       BASIC VALIDATION
    --------------------------- */
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    if (!fullName || !email || !mobile || !location || !budget || !workType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* ---------------------------
       CREATE HIRE REQUEST
    --------------------------- */
    const hire = await prisma.designerHireRequest.create({
      data: {
        userId: Number(userId),       // ✅ FIXED
        designerId,
        fullName,
        email,
        mobile,
        location,
        budget: Number(budget),       // ✅ SAFE CAST
        workType,
        timelineDays: timelineDays ? Number(timelineDays) : null,
        description: description || null,
      },
    });

    res.status(201).json(hire);
  } catch (err) {
    console.error("HIRE ERROR:", err);
    res.status(500).json({
      message: "Failed to hire designer",
      error: err.message, // ✅ helps debugging
    });
  }
});



// ============================
// GET DESIGNER WORK REQUESTS
// ============================
app.get("/designer/:id/work-requests", async (req, res) => {
  try {
    const designerId = Number(req.params.id);
    if (isNaN(designerId)) {
      return res.status(400).json({ message: "Invalid designer id" });
    }

    // fetch requests for this designer (includes any userRating this designer left)
    const requests = await prisma.designerHireRequest.findMany({
      where: { designerId },
      orderBy: { createdAt: "desc" },
      include: {
        userRating: true, // rating THIS designer gave to THIS client (if any)
      },
    });

    // collect all client emails (dedup)
    const emails = [...new Set(requests.map((r) => r?.email).filter(Boolean))];

    // if no emails, skip the rating query to avoid extra DB call
    let allRatings = [];
    if (emails.length > 0) {
      // IMPORTANT: include the related hireRequest so we can read hireRequest.email safely
      allRatings = await prisma.userRating.findMany({
        where: {
          hireRequest: {
            email: { in: emails },
          },
        },
        include: {
          hireRequest: true, // <-- this was missing and caused r.hireRequest to be undefined
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // group ratings by client email
    const ratingsByEmail = {};
    for (const r of allRatings) {
      // defensive: ensure hireRequest exists
      const email = r?.hireRequest?.email;
      if (!email) continue;
      if (!ratingsByEmail[email]) ratingsByEmail[email] = [];
      ratingsByEmail[email].push(r);
    }

    // build response
    const response = requests.map((r) => {
      const clientRatings = ratingsByEmail[r.email] || [];
      const avg =
        clientRatings.length > 0
          ? clientRatings.reduce((s, x) => s + x.stars, 0) / clientRatings.length
          : 0;

      return {
        id: r.id,
        userId: r.userId,
        clientName: r.fullName,
        mobile: r.mobile,
        email: r.email,
        type: r.workType,
        budget: r.budget,
        location: r.location,
        timeline: r.timelineDays ? `${r.timelineDays} Days` : "Not specified",
        status: r.status,
        message: r.description,

        userRating: r.userRating
          ? {
            stars: r.userRating.stars,
            review: r.userRating.review,
            reviewerName: r.userRating.reviewerName,
            createdAt: r.userRating.createdAt,
          }
          : null,

        clientSummary: {
          average: Number(avg.toFixed(1)),
          count: clientRatings.length,
          reviews: clientRatings.map((cr) => ({
            stars: cr.stars,
            review: cr.review,
            reviewerName: cr.reviewerName,
            createdAt: cr.createdAt,
          })),
        },
      };
    });

    res.json(response);
  } catch (err) {
    console.error("FETCH WORK REQUESTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch work requests" });
  }
});



/* ============================
   UPDATE WORK REQUEST STATUS
============================ */
app.patch("/designer/work-request/:id/status", async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await prisma.designerHireRequest.update({
      where: { id: requestId },
      data: { status },
    });

    res.json({ message: "Status updated", status: updated.status });
  } catch (err) {
    console.error("UPDATE REQUEST STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

/* ============================
   GET CLIENT HIRED DESIGNERS
   (CLIENT DASHBOARD)
============================ */
app.get("/client/hired-designers", async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const hires = await prisma.designerHireRequest.findMany({
      where: { userId },
      include: {
        designer: { include: { profile: true } },
        rating: true,
        userRating: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      hires.map(h => ({
        id: h.id,
        designerId: h.designerId,
        name: h.designer.fullname,
        category: h.designer.profile?.designerType,
        location: h.designer.location,
        status: h.status,
        budget: h.budget,
        workType: h.workType,
        image: h.designer.profile?.profileImage
          ? `http://localhost:3001/${h.designer.profile.profileImage}`
          : null,
        rating: h.rating,
        userRating: h.userRating,
      }))
    );
  } catch (err) {
    console.error("FETCH HIRED DESIGNERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



/* ============================
   RATE DESIGNER
============================ */
app.post("/designer/:id/rate", async (req, res) => {
  try {
    const designerId = Number(req.params.id);
    const { hireRequestId, stars, review } = req.body;

    if (!designerId || !hireRequestId || !stars) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Fetch hire request WITH DESIGNER
    const hire = await prisma.designerHireRequest.findUnique({
      where: { id: Number(hireRequestId) },
      include: { designer: true },
    });

    if (!hire) {
      return res.status(404).json({ message: "Hire request not found" });
    }

    // ✅ VERY IMPORTANT
    if (hire.designerId !== designerId) {
      return res.status(403).json({ message: "Unauthorized rating attempt" });
    }

    if (hire.status !== "completed") {
      return res.status(400).json({ message: "Job not completed yet" });
    }

    // ✅ Prevent duplicate rating
    const exists = await prisma.designerRating.findUnique({
      where: { hireRequestId: Number(hireRequestId) },
    });

    if (exists) {
      return res.status(409).json({ message: "Already rated" });
    }

    // ✅ Create rating
    const rating = await prisma.designerRating.create({
      data: {
        designerId,
        hireRequestId: Number(hireRequestId),
        reviewerName: hire.fullName,
        stars: Number(stars),
        review: review || null,
      },
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      ratingId: rating.id,
    });
  } catch (err) {
    console.error("RATE DESIGNER ERROR:", err);
    return res.status(500).json({ message: "Failed to submit rating" });
  }
});



app.get("/designer/:id/ratings", async (req, res) => {
  try {
    const designerId = Number(req.params.id);

    const ratings = await prisma.designerRating.findMany({
      where: { designerId },
      orderBy: { createdAt: "desc" },
    });

    const avg =
      ratings.length > 0
        ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
        : 0;

    res.json({
      average: Number(avg.toFixed(1)),
      count: ratings.length,
      reviews: ratings.map((r) => ({
        name: r.reviewerName,   // ✅ SEND NAME
        stars: r.stars,
        review: r.review,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
});

/* ============================
   DESIGNER → RATE CLIENT
============================ */
app.post("/designer/:id/rate-user", async (req, res) => {
  try {
    const designerId = Number(req.params.id);
    const { hireRequestId, stars, review } = req.body;

    if (!designerId || !hireRequestId || !stars) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // verify designer exists
    const designer = await prisma.designer.findUnique({ where: { id: designerId } });
    if (!designer) return res.status(404).json({ message: "Designer not found" });

    // make sure hireRequest exists and belongs to this designer
    const hire = await prisma.designerHireRequest.findUnique({ where: { id: Number(hireRequestId) } });
    if (!hire || hire.designerId !== designerId) {
      return res.status(400).json({ message: "Hire request not found or not belonging to you" });
    }

    // only allow rating after job is completed (you can adjust as needed)
    if (hire.status !== "completed") {
      return res.status(400).json({ message: "You can rate the client only after marking the job completed." });
    }

    // prevent duplicate rating for the same hireRequest
    const exists = await prisma.userRating.findUnique({ where: { hireRequestId: Number(hireRequestId) } });
    if (exists) {
      return res.status(409).json({ message: "You have already rated this client for this hire" });
    }

    // create rating
    const created = await prisma.userRating.create({
      data: {
        hireRequestId: Number(hireRequestId),
        designerId: designerId,
        reviewerName: designer.fullname || null,
        stars: Number(stars),
        review: review || null,
      },
    });

    res.status(201).json({ message: "User rating submitted", ratingId: created.id });
  } catch (err) {
    console.error("RATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to submit user rating" });
  }
});

// GET /client/:userId/ratings
app.get("/client/:userId/ratings", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const ratings = await prisma.userRating.findMany({
      where: {
        hireRequest: {
          userId: userId,       // ✅ RELATIONAL SOURCE OF TRUTH
          status: "completed",  // ✅ optional safety
        },
      },
      include: {
        designer: {
          select: {
            id: true,
            fullname: true,
            profile: { select: { profileImage: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = ratings.map((r) => ({
      id: r.id,
      stars: r.stars,
      review: r.review,
      reviewerName: r.reviewerName || r.designer?.fullname || "Designer",
      designerId: r.designer?.id || null,
      designerName: r.designer?.fullname || null,
      designerImage: r.designer?.profile?.profileImage
        ? `http://localhost:3001/${r.designer.profile.profileImage}`
        : null,
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("FETCH CLIENT RATINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch client ratings" });
  }
});

// ============================
// CONTACT FORM (PRODUCTION READY)
// ============================
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    /* =========================
       VALIDATION
    ========================= */
    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // prevent very large messages
    if (message.length > 2000) {
      return res.status(400).json({
        message: "Message is too long",
      });
    }

    /* =========================
       SAVE MESSAGE
    ========================= */
    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      message: "Message received successfully",
    });
  } catch (err) {
    console.error("CONTACT FORM ERROR:", err);
    res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
});




app.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});
