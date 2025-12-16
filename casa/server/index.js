import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { upload } from "./multer.js";
import path from "path";

const app = express();
const prisma = new PrismaClient();

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
        images: p.images,
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
   ADD PRODUCT
========================= */
app.post(
  "/seller/product",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
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

    // 🔥 CALCULATE AVG RATING
    const formatted = products.map((p) => {
      const total = p.ratings.reduce((sum, r) => sum + r.stars, 0);
      const count = p.ratings.length;
      const avgRating = count ? total / count : 0;

      return {
        ...p,
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
    const { customerEmail, checkoutDetails, orders, summary } = req.body;

    if (!customerEmail || !orders?.length) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* =========================
       CREATE ORDER
    ========================= */
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerEmail,
        customerName: checkoutDetails.name,
        address: checkoutDetails.address,
        paymentMethod: checkoutDetails.paymentMethod,
        subtotal: summary.subtotal,
        casaCharge: summary.casaCharge,
        deliveryCharge: summary.deliveryCharge,
        grandTotal: summary.grandTotal,
      },
    });

    /* =========================
       CREATE ORDER ITEMS
       (STORE GRAND TOTAL)
    ========================= */
    const orderItemsData = await Promise.all(
      orders.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.materialId },
        });

        return {
          orderId: order.id,

          materialId: item.materialId,
          materialName: item.materialName,
          supplierName: item.supplierName,

          sellerId: item.supplierId,
          quantity: item.trips,
          pricePerUnit: item.amountPerTrip,

          // 🔥 THIS IS THE KEY CHANGE
          totalAmount: summary.grandTotal, // ✅ 63000

          imageUrl: product?.images?.[0] || null,
        };
      })
    );

    await prisma.orderItem.createMany({
      data: orderItemsData,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: order.id,
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
            seller: { select: { name: true } },
          },
        },
      },
    });

    const formatted = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: `ORD-${order.id}`,
        orderItemId: item.id,
        materialId: item.materialId,

        productName: item.materialName,
        sellerName: item.seller.name,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        imageUrl: item.imageUrl,

        // 🔥 THIS IS THE FIX
        orderStatus: item.status, // fulfilled | pending | confirmed | rejected

        createdAt: order.createdAt,
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
// ============================*/
app.put(
  "/seller/product/:id",
  upload.fields([{ name: "images", maxCount: 5 }]),
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      const {
        name,
        category,
        productType,
        price,
        description,
        existingImages,
        availability, // ✅ NEW
      } = req.body;

      const keptImages = existingImages ? JSON.parse(existingImages) : [];

      const newImages =
        req.files?.images?.map((file) =>
          file.path.replace(/\\/g, "/").replace("uploads/", "")
        ) || [];

      const finalImages = [...keptImages, ...newImages];

      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          category,
          productType,
          price: Number(price),
          description,
          images: finalImages,
          availability, // ✅ UPDATED
        },
      });

      res.json({
        message: "Product updated successfully",
        product: updated,
      });
    } catch (err) {
      console.error("UPDATE PRODUCT ERROR:", err);
      res.status(500).json({ message: "Failed to update product" });
    }
  }
);


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
// GET SELLER ORDERS
// ============================
app.get("/seller/:sellerId/orders", async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    const items = await prisma.orderItem.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            createdAt: true,
            address: true,
            customerName: true,
          },
        },
      },
    });

    const formatted = items.map((item) => ({
      id: item.id,
      customer: item.order.customerName,
      material: item.materialName,
      quantity: `${item.quantity} Unit`,
      time: item.order.createdAt,   // ✅ RAW DATE
      status: item.status,
      siteLocation: item.order.address,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("SELLER ORDERS ERROR:", err);
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
    const allowed = ["pending", "confirmed", "rejected", "fulfilled"];
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
      data: { status: "rejected" }, // unified cancel state
    });

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
      include: { rating: true },
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
        userId: user.id,
        productId: orderItem.materialId,
        orderItemId: orderItem.id,
      },
    });

    res.status(201).json({ message: "Rating submitted", rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

// ============================
// GET PRODUCT RATINGS & REVIEWS
// ============================
// GET PRODUCT RATINGS + REVIEWS
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









// ============================
app.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});
