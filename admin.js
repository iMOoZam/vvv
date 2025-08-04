const API_BASE_URL = "http://localhost:3000/api";

class AdminPanel {
  constructor() {
    this.token = localStorage.getItem("token");
    this.currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    this.editingProduct = null;
    this.init();
  }

  async init() {
    if (!this.currentUser || this.currentUser.role !== "admin") {
      this.showAccessDenied();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.showAccessDenied();
        return;
      }

      this.loadAdminPanel();
    } catch (error) {
      console.error("Admin authentication error:", error);
      this.showAccessDenied();
    }
  }

  showAccessDenied() {
    const container = document.getElementById("adminContainer");

    if (!this.currentUser) {
      // User is not logged in
      container.innerHTML = `
        <div class="access-denied">
          <i class="fas fa-sign-in-alt"></i>
          <h2>لطفاً وارد شوید</h2>
          <p>برای دسترسی به پنل مدیریت، ابتدا باید وارد شوید.</p>
          <div style="margin-top: 20px;">
            <a href="login.html" class="btn btn-primary" style="margin: 0 10px;">
              <i class="fas fa-sign-in-alt"></i> ورود
            </a>
            <a href="index.html" class="btn btn-secondary" style="margin: 0 10px;">
              <i class="fas fa-home"></i> بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      `;
    } else if (this.currentUser.role !== "admin") {
      // User is logged in but not admin
      container.innerHTML = `
        <div class="access-denied">
          <i class="fas fa-lock"></i>
          <h2>دسترسی غیرمجاز</h2>
          <p>شما مجوز دسترسی به پنل مدیریت را ندارید.</p>
          <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
            کاربر فعلی: ${this.currentUser.firstName} ${
        this.currentUser.lastName
      } (${this.currentUser.role === "admin" ? "مدیر" : "کاربر عادی"})
          </p>
          <div style="margin-top: 20px;">
            <a href="index.html" class="btn btn-primary">
              <i class="fas fa-home"></i> بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      `;
    } else {
      // Generic access denied
      container.innerHTML = `
        <div class="access-denied">
          <i class="fas fa-lock"></i>
          <h2>دسترسی غیرمجاز</h2>
          <p>شما مجوز دسترسی به پنل مدیریت را ندارید.</p>
          <a href="index.html" class="btn btn-primary">بازگشت به صفحه اصلی</a>
        </div>
      `;
    }
  }

  async loadAdminPanel() {
    try {
      const [usersResponse, productsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }),
        fetch(`${API_BASE_URL}/products`),
      ]);

      const users = await usersResponse.json();
      const products = await productsResponse.json();

      this.renderAdminPanel(users, products);
    } catch (error) {
      console.error("Error loading admin data:", error);
      this.showError("خطا در بارگذاری اطلاعات");
    }
  }

  renderAdminPanel(users, products) {
    const container = document.getElementById("adminContainer");

    const adminHTML = `
      <div class="admin-header">
        <h1>
          <i class="fas fa-cogs"></i>
          پنل مدیریت
        </h1>
        <p>خوش آمدید ${this.currentUser.firstName} ${
      this.currentUser.lastName
    }</p>
      </div>

      <div class="admin-content">
        <div class="admin-card">
          <h2>
            <i class="fas fa-chart-bar"></i>
            آمار کلی
          </h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>${users.length}</h3>
              <p>کاربران</p>
            </div>
            <div class="stat-card">
              <h3>${products.length}</h3>
              <p>محصولات</p>
            </div>
            <div class="stat-card">
              <h3>${users.filter((u) => u.role === "admin").length}</h3>
              <p>مدیران</p>
            </div>
            <div class="stat-card">
              <h3>${users.filter((u) => u.role === "user").length}</h3>
              <p>کاربران عادی</p>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <h2>
            <i class="fas fa-users"></i>
            مدیریت کاربران
          </h2>
          <div class="user-list">
            ${users
              .map(
                (user) => `
              <div class="user-item">
                <div class="user-info">
                  <div class="user-name">${user.firstName} ${
                  user.lastName
                }</div>
                  <div class="user-email">${user.email}</div>
                </div>
                <div class="user-role ${
                  user.role === "admin" ? "admin-role" : ""
                }">
                  ${user.role === "admin" ? "مدیر" : "کاربر"}
                </div>
                <div class="action-buttons">
                  <button class="btn btn-edit" onclick="adminPanel.editUser('${
                    user._id
                  }')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-delete" onclick="adminPanel.deleteUser('${
                    user._id
                  }')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="admin-card">
          <h2>
            <i class="fas fa-box"></i>
            مدیریت محصولات
          </h2>
          <div class="product-list">
            ${products
              .map(
                (product) => `
              <div class="product-item">
                <div class="product-info">
                  <div class="product-name">${product.name}</div>
                  <div class="product-category">${this.getCategoryName(
                    product.category
                  )}</div>
                </div>
                <div class="product-price">${product.price.toLocaleString()} تومان</div>
                <div class="product-stock">موجودی: ${product.stock}</div>
                <div class="action-buttons">
                  <button class="btn btn-edit" onclick="adminPanel.editProduct('${
                    product._id
                  }')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-delete" onclick="adminPanel.deleteProduct('${
                    product._id
                  }')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          <button class="btn btn-primary" onclick="adminPanel.showAddProductForm()" style="margin-top: 20px; width: 100%;">
            <i class="fas fa-plus"></i> افزودن محصول جدید
          </button>
        </div>
      </div>
    `;

    container.innerHTML = adminHTML;
  }

  getCategoryName(category) {
    const categories = {
      cpu: "پردازنده",
      gpu: "کارت گرافیک",
      ram: "رم",
      storage: "هارد دیسک",
      motherboard: "مادربورد",
      power: "پاور",
    };
    return categories[category] || category;
  }

  async editUser(userId) {
    alert("قابلیت ویرایش کاربر به زودی اضافه خواهد شد");
  }

  async deleteUser(userId) {
    if (confirm("آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟")) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.ok) {
          alert("کاربر با موفقیت حذف شد");
          this.loadAdminPanel();
        } else {
          alert("خطا در حذف کاربر");
        }
      } catch (error) {
        console.error("Delete user error:", error);
        alert("خطا در حذف کاربر");
      }
    }
  }

  async editProduct(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const product = await response.json();
      this.editingProduct = product;
      this.showProductForm(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("خطا در دریافت اطلاعات محصول");
    }
  }

  async deleteProduct(productId) {
    if (confirm("آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟")) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.ok) {
          alert("محصول با موفقیت حذف شد");
          this.loadAdminPanel();
        } else {
          alert("خطا در حذف محصول");
        }
      } catch (error) {
        console.error("Delete product error:", error);
        alert("خطا در حذف محصول");
      }
    }
  }

  showAddProductForm() {
    this.editingProduct = null;
    this.showProductForm();
  }

  showProductForm(product = null) {
    const container = document.getElementById("adminContainer");
    const isEditing = product !== null;

    const formHTML = `
      <div class="admin-header">
        <h1>
          <i class="fas fa-${isEditing ? "edit" : "plus"}"></i>
          ${isEditing ? "ویرایش محصول" : "افزودن محصول جدید"}
        </h1>
        <p>${
          isEditing ? "ویرایش اطلاعات محصول" : "اطلاعات محصول جدید را وارد کنید"
        }</p>
      </div>

      <div class="admin-content">
        <div class="admin-card" style="grid-column: 1 / -1;">
          <form id="productForm" class="product-form">
            <div class="form-group">
              <label for="name">نام محصول *</label>
              <input type="text" id="name" name="name" value="${
                product?.name || ""
              }" required>
            </div>

            <div class="form-group">
              <label for="category">دسته‌بندی *</label>
              <select id="category" name="category" required>
                <option value="">انتخاب کنید</option>
                <option value="cpu" ${
                  product?.category === "cpu" ? "selected" : ""
                }>پردازنده</option>
                <option value="gpu" ${
                  product?.category === "gpu" ? "selected" : ""
                }>کارت گرافیک</option>
                <option value="ram" ${
                  product?.category === "ram" ? "selected" : ""
                }>رم</option>
                <option value="storage" ${
                  product?.category === "storage" ? "selected" : ""
                }>هارد دیسک</option>
                <option value="motherboard" ${
                  product?.category === "motherboard" ? "selected" : ""
                }>مادربورد</option>
                <option value="power" ${
                  product?.category === "power" ? "selected" : ""
                }>پاور</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="price">قیمت (تومان) *</label>
                <input type="number" id="price" name="price" value="${
                  product?.price || ""
                }" min="0" required>
              </div>

              <div class="form-group">
                <label for="stock">موجودی *</label>
                <input type="number" id="stock" name="stock" value="${
                  product?.stock || "0"
                }" min="0" required>
              </div>
            </div>

            <div class="form-group">
              <label for="description">توضیحات</label>
              <textarea id="description" name="description" rows="4">${
                product?.description || ""
              }</textarea>
            </div>

            <div class="form-group">
              <label for="image">لینک تصویر</label>
              <input type="url" id="image" name="image" value="${
                product?.image || ""
              }" placeholder="https://example.com/image.jpg">
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-${isEditing ? "save" : "plus"}"></i>
                ${isEditing ? "ذخیره تغییرات" : "افزودن محصول"}
              </button>
              <button type="button" class="btn btn-secondary" onclick="adminPanel.loadAdminPanel()">
                <i class="fas fa-times"></i>
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    container.innerHTML = formHTML;

    // Add form submission handler
    document.getElementById("productForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleProductSubmit();
    });
  }

  async handleProductSubmit() {
    const form = document.getElementById("productForm");
    const formData = new FormData(form);

    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: parseInt(formData.get("price")),
      stock: parseInt(formData.get("stock")),
      description: formData.get("description"),
      image: formData.get("image") || null,
    };

    try {
      const url = this.editingProduct
        ? `${API_BASE_URL}/products/${this.editingProduct._id}`
        : `${API_BASE_URL}/products`;

      const method = this.editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert(
          this.editingProduct
            ? "محصول با موفقیت بروزرسانی شد"
            : "محصول با موفقیت اضافه شد"
        );
        this.loadAdminPanel();
      } else {
        const error = await response.json();
        alert(`خطا: ${error.message}`);
      }
    } catch (error) {
      console.error("Product submission error:", error);
      alert("خطا در ذخیره محصول");
    }
  }

  showError(message) {
    const container = document.getElementById("adminContainer");
    container.innerHTML = `
      <div class="access-denied">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>خطا</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">تلاش مجدد</button>
      </div>
    `;
  }
}

const adminPanel = new AdminPanel();

window.adminPanel = adminPanel;
