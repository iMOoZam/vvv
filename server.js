const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve static files

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Call your seed or startup logic here - don't await to avoid blocking
    initializeAdmin().catch((err) => console.error("Admin init error:", err));
    initializeProducts().catch((err) =>
      console.error("Products init error:", err)
    );
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user", "admin"] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  stock: { type: Number, default: 0 },
});

const Product = mongoose.model("Product", productSchema);

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "توکن احراز هویت یافت نشد" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "توکن نامعتبر است" });
    }
    req.user = user;
    next();
  });
};

app.post(
  "/api/register",
  [
    body("firstName").notEmpty().withMessage("نام الزامی است"),
    body("lastName").notEmpty().withMessage("نام خانوادگی الزامی است"),
    body("email").isEmail().withMessage("ایمیل معتبر نیست"),
    body("phone")
      .matches(/^09\d{9}$/)
      .withMessage("شماره تلفن معتبر نیست"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("نام کاربری باید حداقل 3 کاراکتر باشد"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("رمز عبور باید حداقل 6 کاراکتر باشد"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "خطا در اعتبارسنجی",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, phone, username, password } =
        req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "کاربری با این ایمیل یا نام کاربری قبلاً وجود دارد",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        username,
        password: hashedPassword,
        role: "user",
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "ثبت نام با موفقیت انجام شد",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "خطا در ثبت نام" });
    }
  }
);

app.post(
  "/api/login",
  [
    body("username").notEmpty().withMessage("نام کاربری الزامی است"),
    body("password").notEmpty().withMessage("رمز عبور الزامی است"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "خطا در اعتبارسنجی",
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(401)
          .json({ message: "نام کاربری یا رمز عبور اشتباه است" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res
          .status(401)
          .json({ message: "نام کاربری یا رمز عبور اشتباه است" });
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "ورود موفقیت‌آمیز بود",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "خطا در ورود" });
    }
  }
);

app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر" });
  }
});

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "خطا در دریافت لیست کاربران" });
  }
});

// Get single user endpoint
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر" });
  }
});

// Update user endpoint
app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating password through this endpoint
    delete updateData.password;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "خطا در بروزرسانی کاربر" });
  }
});

// Delete user endpoint
app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    res.json({ message: "کاربر با موفقیت حذف شد" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "خطا در حذف کاربر" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
});

// Get single product endpoint
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "خطا در دریافت محصول" });
  }
});

app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "خطا در افزودن محصول" });
  }
});

// Update product endpoint
app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "خطا در بروزرسانی محصول" });
  }
});

// Delete product endpoint
app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json({ message: "محصول با موفقیت حذف شد" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "خطا در حذف محصول" });
  }
});

app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate(
      "items.product"
    );

    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [], total: 0 });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "خطا در دریافت سبد خرید" });
  }
});

app.post("/api/cart/add", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "شناسه محصول الزامی است" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "موجودی کافی نیست" });
    }

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [], total: 0 });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price,
      });
    }

    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cart.updatedAt = new Date();

    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "خطا در افزودن به سبد خرید" });
  }
});

app.put("/api/cart/update", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "شناسه محصول و تعداد الزامی است" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "تعداد باید حداقل 1 باشد" });
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "سبد خرید یافت نشد" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "محصول در سبد خرید یافت نشد" });
    }

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: "موجودی کافی نیست" });
    }

    item.quantity = quantity;
    item.price = product.price;

    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cart.updatedAt = new Date();

    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "خطا در بروزرسانی سبد خرید" });
  }
});

app.delete(
  "/api/cart/remove/:productId",
  authenticateToken,
  async (req, res) => {
    try {
      const { productId } = req.params;

      const cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        return res.status(404).json({ message: "سبد خرید یافت نشد" });
      }

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );

      cart.total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      cart.updatedAt = new Date();

      await cart.save();
      await cart.populate("items.product");

      res.json(cart);
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "خطا در حذف از سبد خرید" });
    }
  }
);

app.delete("/api/cart/clear", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "سبد خرید یافت نشد" });
    }

    cart.items = [];
    cart.total = 0;
    cart.updatedAt = new Date();

    await cart.save();

    res.json({ message: "سبد خرید پاک شد" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "خطا در پاک کردن سبد خرید" });
  }
});

async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new User({
        firstName: "مدیر",
        lastName: "سیستم",
        email: "admin@techshop.ir",
        phone: "09123456789",
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

async function initializeProducts() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const defaultProducts = [
        {
          name: "Intel Core i7-12700K",
          category: "cpu",
          price: 8500000,
          description: "پردازنده Intel Core i7 نسل 12",
          stock: 10,
        },
        {
          name: "AMD Ryzen 7 5800X",
          category: "cpu",
          price: 7200000,
          description: "پردازنده AMD Ryzen 7",
          stock: 8,
        },
        {
          name: "NVIDIA RTX 4070",
          category: "gpu",
          price: 25000000,
          description: "کارت گرافیک NVIDIA RTX 4070",
          stock: 5,
        },
        {
          name: "AMD RX 6700 XT",
          category: "gpu",
          price: 18000000,
          description: "کارت گرافیک AMD RX 6700 XT",
          stock: 7,
        },
        {
          name: "Corsair 32GB DDR4",
          category: "ram",
          price: 3200000,
          description: "رم Corsair 32GB DDR4",
          stock: 15,
        },
        {
          name: "Samsung 1TB SSD",
          category: "storage",
          price: 2800000,
          description: "هارد SSD Samsung 1TB",
          stock: 20,
        },
      ];

      await Product.insertMany(defaultProducts);
      console.log("Default products created");
    }
  } catch (error) {
    console.error("Error creating default products:", error);
  }
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server is ready to accept requests");
});

// Add timeout to prevent hanging
setTimeout(() => {
  console.log("Server startup timeout reached - continuing anyway");
}, 10000);

// Handle graceful shutdown for Railway
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
