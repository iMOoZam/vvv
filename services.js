let cart = [];
let isCartOpen = false;

function toggleCart() {
  const cartSidebar = document.getElementById("cart");
  isCartOpen = !isCartOpen;

  if (isCartOpen) {
    cartSidebar.classList.add("open");
  } else {
    cartSidebar.classList.remove("open");
  }
}

function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  updateCartCount();
  updateCartDisplay();
  saveCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartCount();
  updateCartDisplay();
  saveCart();
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      updateCartCount();
      updateCartDisplay();
      saveCart();
    }
  }
}

function updateCartDisplay() {
  const cartItems = document.querySelector(".cart-items");
  const totalAmount = document.querySelector(".total-amount");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">سبد خرید خالی است</p>';
    totalAmount.textContent = "۰ تومان";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    itemElement.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price.toLocaleString()} تومان</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQuantity('${item.id}', ${
      item.quantity - 1
    })">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity('${item.id}', ${
      item.quantity + 1
    })">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    cartItems.appendChild(itemElement);
  });

  totalAmount.textContent = `${total.toLocaleString()} تومان`;
}

function checkout() {
  if (cart.length === 0) {
    alert("سبد خرید خالی است");
    return;
  }

  alert("در حال انتقال به صفحه پرداخت...");
  cart = [];
  updateCartCount();
  updateCartDisplay();
  saveCart();
  toggleCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
    updateCartDisplay();
  }
}

function handlePricingButtonClick(event) {
  const button = event.target;
  const pricingCard = button.closest(".pricing-card");
  const packageName = pricingCard.querySelector("h3").textContent;

  alert(`شما پکیج "${packageName}" را انتخاب کردید. لطفاً با ما تماس بگیرید.`);
}

document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  updateCartDisplay();

  const pricingButtons = document.querySelectorAll(".pricing-btn");
  pricingButtons.forEach((button) => {
    button.addEventListener("click", handlePricingButtonClick);
  });

  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("click", function () {
      const serviceName = this.querySelector("h3").textContent;
      alert(
        `شما خدمات "${serviceName}" را انتخاب کردید. لطفاً با ما تماس بگیرید.`
      );
    });
  });
});

document.addEventListener("click", function (event) {
  if (
    event.target.classList.contains("cart-sidebar") ||
    event.target.classList.contains("close-cart")
  ) {
    toggleCart();
  }
});
