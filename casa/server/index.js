import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json()); // ✅ REQUIRED

app.use(express.urlencoded({ extended: true, limit: "100mb" }));

/* ============================
   TEST ROUTE (IMPORTANT)
============================ */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});


// ============================
// SIGNUP
// ============================
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address,
        password: hashedPassword,
      },
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
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if seller already exists
    const existingSeller = await prisma.seller.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return res.status(409).json({ message: "Seller already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller
    const seller = await prisma.seller.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Seller account created",
      sellerId: seller.id,
    });
  } catch (error) {
    console.error("Seller signup error:", error);
    return res.status(500).json({
      message: "Server error during signup",
    });
  }
});

/* ======================
   SELLER LOGIN
====================== */
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
        email: seller.email,
        ownerName: seller.ownerName,
      },
    });
  } catch (err) {
    console.error("SELLER LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error during login" });
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

/* ============================
   ADD PRODUCT ROUTE
============================ */
app.post("/seller/product", async (req, res) => {
  try {
    const {
      sellerId,
      name,
      price,
      productType,
      category,
      description,
      images,
      video,
    } = req.body;

    if (!sellerId || !name || !price || !category || !images?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await prisma.product.create({
      data: {
        sellerId: Number(sellerId),
        name,
        price: Number(price),
        productType,
        category,
        description,
        images,
        video,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error while adding product" });
  }
});

/* ============================
   SERVER START
============================ */
const PORT = 3001;



// ============================
app.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});
