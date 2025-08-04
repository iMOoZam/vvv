const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./config.env" });

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB for database initialization"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas
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

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  stock: { type: Number, default: 0 },
});

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

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Cart = mongoose.model("Cart", cartSchema);

// Sample Products Data
const sampleProducts = [
  {
    name: "Intel Core i7-12700K",
    category: "cpu",
    price: 8500000,
    description:
      "پردازنده ۱۲ هسته‌ای Intel با عملکرد فوق‌العاده برای گیمینگ و کارهای حرفه‌ای",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 15,
  },
  {
    name: "AMD Ryzen 9 5900X",
    category: "cpu",
    price: 7800000,
    description: "پردازنده AMD با ۱۲ هسته و ۲۴ رشته برای عملکرد حرفه‌ای",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 12,
  },
  {
    name: "NVIDIA RTX 4080",
    category: "gpu",
    price: 45000000,
    description: "کارت گرافیک قدرتمند NVIDIA با قابلیت Ray Tracing",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 8,
  },
  {
    name: "AMD RX 6800 XT",
    category: "gpu",
    price: 28000000,
    description: "کارت گرافیک AMD با عملکرد بالا و قیمت مناسب",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 10,
  },
  {
    name: "Corsair Vengeance 32GB",
    category: "ram",
    price: 3200000,
    description: "رم DDR4 با سرعت 3200MHz و ظرفیت ۳۲ گیگابایت",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 25,
  },
  {
    name: "G.Skill Trident Z 16GB",
    category: "ram",
    price: 1800000,
    description: "رم DDR4 با طراحی زیبا و عملکرد بالا",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 30,
  },
  {
    name: "Samsung 970 EVO Plus 1TB",
    category: "storage",
    price: 4200000,
    description: "SSD NVMe با سرعت خواندن/نوشتن بالا",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 20,
  },
  {
    name: "WD Black 2TB HDD",
    category: "storage",
    price: 1800000,
    description: "هارد دیسک با ظرفیت بالا و عملکرد قابل اعتماد",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 18,
  },
  {
    name: "ASUS ROG Strix B660-F",
    category: "motherboard",
    price: 5800000,
    description: "مادربورد گیمینگ با قابلیت‌های پیشرفته",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 12,
  },
  {
    name: "MSI MPG B550",
    category: "motherboard",
    price: 4200000,
    description: "مادربورد AMD با طراحی مدرن و عملکرد بالا",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: 15,
  },
];

// Sample Admin User
const adminUser = {
  firstName: "مدیر",
  lastName: "سیستم",
  email: "admin@techshop.com",
  phone: "09123456789",
  username: "admin",
  password: "admin123",
  role: "admin",
};

// Database Initialization Function
async function initializeDatabase() {
  try {
    console.log("🚀 Starting database initialization...");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    const admin = new User({
      ...adminUser,
      password: hashedPassword,
    });
    await admin.save();
    console.log("✅ Admin user created successfully");

    // Create products
    console.log("📦 Creating products...");
    const createdProducts = [];
    for (const product of sampleProducts) {
      const newProduct = new Product(product);
      const savedProduct = await newProduct.save();
      createdProducts.push(savedProduct);
    }
    console.log(`✅ ${createdProducts.length} products created successfully`);

    // Create sample user
    console.log("👤 Creating sample user...");
    const sampleUser = new User({
      firstName: "کاربر",
      lastName: "نمونه",
      email: "user@techshop.com",
      phone: "09987654321",
      username: "user",
      password: await bcrypt.hash("user123", 10),
      role: "user",
    });
    const savedUser = await sampleUser.save();
    console.log("✅ Sample user created successfully");

    // Create sample cart for user
    console.log("🛒 Creating sample cart...");
    const sampleCart = new Cart({
      user: savedUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          quantity: 2,
          price: createdProducts[0].price,
        },
        {
          product: createdProducts[2]._id,
          quantity: 1,
          price: createdProducts[2].price,
        },
      ],
      total: createdProducts[0].price * 2 + createdProducts[2].price,
    });
    await sampleCart.save();
    console.log("✅ Sample cart created successfully");

    console.log("\n🎉 Database initialization completed successfully!");
    console.log("\n📋 Database Summary:");
    console.log(`   👤 Users: ${await User.countDocuments()}`);
    console.log(`   📦 Products: ${await Product.countDocuments()}`);
    console.log(`   🛒 Carts: ${await Cart.countDocuments()}`);

    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   User: user / user123");

    console.log("\n🌐 Access your application at: http://localhost:3000");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
