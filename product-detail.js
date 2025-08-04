function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function loadProductDetail() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    showError("محصول یافت نشد");
    return;
  }

  const product = products.find((p) => p.id == productId);
  if (!product) {
    showError("محصول یافت نشد");
    return;
  }

  displayProductDetail(product);
}

function displayProductDetail(product) {
  const detailContent = document.getElementById("productDetailContent");

  detailContent.innerHTML = `
        <div class="product-detail-grid">
            <div class="product-detail-image">
                <img src="${product.image}" alt="${
    product.name
  }" loading="lazy" onclick="openImageZoom('${product.image}', '${
    product.name
  }')" style="cursor: zoom-in;">
                <div class="zoom-overlay" onclick="openImageZoom('${
                  product.image
                }', '${product.name}')">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
            <div class="product-detail-info">
                <div class="breadcrumb">
                    <a href="index.html">خانه</a> / 
                    <a href="index.html#products">محصولات</a> / 
                    <span>${product.name}</span>
                </div>
                <h1 class="product-detail-title">${product.name}</h1>
                <div class="product-detail-price">${formatPrice(
                  product.price
                )} تومان</div>
                <div class="product-detail-description">
                    <h3>توضیحات محصول:</h3>
                    <p>${product.description}</p>
                </div>
                <div class="product-detail-specs">
                    <h3>مشخصات فنی:</h3>
                    <ul>
                        <li><strong>دسته‌بندی:</strong> ${getCategoryName(
                          product.category
                        )}</li>
                        <li><strong>کد محصول:</strong> ${product.id}</li>
                        <li><strong>وضعیت:</strong> <span class="in-stock">موجود در انبار</span></li>
                        <li><strong>گارانتی:</strong> ۱۸ ماه</li>
                        <li><strong>ارسال:</strong> رایگان</li>
                    </ul>
                </div>
                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <label>تعداد:</label>
                        <div class="quantity-controls">
                            <button onclick="changeQuantity(-1)" class="quantity-btn">-</button>
                            <input type="number" id="productQuantity" value="1" min="1" max="10">
                            <button onclick="changeQuantity(1)" class="quantity-btn">+</button>
                        </div>
                    </div>
                    <button class="add-to-cart-detail-btn" onclick="addToCartFromDetail(${
                      product.id
                    })">
                        <i class="fas fa-shopping-cart"></i>
                        افزودن به سبد خرید
                    </button>
                    <button class="buy-now-btn" onclick="buyNow(${product.id})">
                        <i class="fas fa-credit-card"></i>
                        خرید فوری
                    </button>
                </div>
                <div class="product-detail-features">
                    <h3>ویژگی‌های کلیدی:</h3>
                    <div class="features-grid">
                        <div class="feature-item">
                            <i class="fas fa-shipping-fast"></i>
                            <span>ارسال سریع</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>گارانتی معتبر</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-undo"></i>
                            <span>بازگشت ۷ روزه</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-headset"></i>
                            <span>پشتیبانی ۲۴/۷</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="related-products">
            <h2>محصولات مشابه</h2>
            <div class="related-products-grid" id="relatedProducts">
                <!-- Related products will be loaded here -->
            </div>
        </div>
    `;

  loadRelatedProducts(product.category, product.id);

  document.title = `${product.name} | تک‌شاپ`;
}

function getCategoryName(category) {
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

function loadRelatedProducts(category, currentProductId) {
  const relatedProducts = products
    .filter((p) => p.category === category && p.id != currentProductId)
    .slice(0, 4);

  const relatedContainer = document.getElementById("relatedProducts");

  if (relatedProducts.length === 0) {
    relatedContainer.innerHTML = "<p>محصول مشابهی یافت نشد</p>";
    return;
  }

  relatedContainer.innerHTML = relatedProducts
    .map(
      (product) => `
        <div class="related-product-card" onclick="goToProduct(${product.id})">
            <div class="related-product-image">
                <img src="${product.image}" alt="${
        product.name
      }" loading="lazy">
            </div>
            <div class="related-product-info">
                <h4>${product.name}</h4>
                <div class="related-product-price">${formatPrice(
                  product.price
                )} تومان</div>
            </div>
        </div>
    `
    )
    .join("");
}

function changeQuantity(change) {
  const quantityInput = document.getElementById("productQuantity");
  let newQuantity = parseInt(quantityInput.value) + change;

  if (newQuantity < 1) newQuantity = 1;
  if (newQuantity > 10) newQuantity = 10;

  quantityInput.value = newQuantity;
}

function addToCartFromDetail(productId) {
  const quantity = parseInt(document.getElementById("productQuantity").value);
  const product = products.find((p) => p.id == productId);

  if (!product) return;

  const existingItem = cart.find((item) => item.id == productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity: quantity,
    });
  }

  updateCart();
  showNotification(`محصول به سبد خرید اضافه شد (${quantity} عدد)`);
}

function buyNow(productId) {
  const quantity = parseInt(document.getElementById("productQuantity").value);
  const product = products.find((p) => p.id == productId);

  if (!product) return;

  cart = [
    {
      ...product,
      quantity: quantity,
    },
  ];

  updateCart();
  checkout();
}

function goToProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

function showError(message) {
  const detailContent = document.getElementById("productDetailContent");
  detailContent.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>خطا</h2>
            <p>${message}</p>
            <a href="index.html" class="back-btn">بازگشت به صفحه اصلی</a>
        </div>
    `;
}

function openImageZoom(imageSrc, imageAlt) {
  let modal = document.getElementById("imageZoomModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "imageZoomModal";
    modal.className = "image-zoom-modal";
    modal.innerHTML = `
            <div class="zoom-modal-content">
                <div class="zoom-modal-header">
                    <h3>${imageAlt}</h3>
                    <button class="close-zoom" onclick="closeImageZoom()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="zoom-modal-body">
                    <img src="${imageSrc}" alt="${imageAlt}" id="zoomedImage">
                </div>
                <div class="zoom-controls">
                    <button onclick="zoomIn()" class="zoom-btn">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button onclick="zoomOut()" class="zoom-btn">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button onclick="resetZoom()" class="zoom-btn">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  } else {
    modal.querySelector("h3").textContent = imageAlt;
    modal.querySelector("#zoomedImage").src = imageSrc;
    modal.querySelector("#zoomedImage").alt = imageAlt;
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  resetZoom();
}

function closeImageZoom() {
  const modal = document.getElementById("imageZoomModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

let currentZoom = 1;
const zoomStep = 0.2;
const maxZoom = 3;
const minZoom = 0.5;

function zoomIn() {
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    updateZoom();
  }
}

function zoomOut() {
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    updateZoom();
  }
}

function resetZoom() {
  currentZoom = 1;
  updateZoom();
}

function updateZoom() {
  const zoomedImage = document.getElementById("zoomedImage");
  if (zoomedImage) {
    zoomedImage.style.transform = `scale(${currentZoom})`;
  }
}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("imageZoomModal");
  if (modal && event.target === modal) {
    closeImageZoom();
  }
});

document.addEventListener("keydown", function (event) {
  const modal = document.getElementById("imageZoomModal");
  if (modal && modal.style.display === "flex") {
    switch (event.key) {
      case "Escape":
        closeImageZoom();
        break;
      case "+":
      case "=":
        event.preventDefault();
        zoomIn();
        break;
      case "-":
        event.preventDefault();
        zoomOut();
        break;
      case "0":
        event.preventDefault();
        resetZoom();
        break;
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  loadProductDetail();
  loadCart();
});
