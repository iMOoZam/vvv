class CartService {
  constructor() {
    this.token = localStorage.getItem("token");
    this.baseURL = "/api/cart";
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  async getCart() {
    try {
      const response = await fetch(this.baseURL, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت سبد خرید");
      }

      return await response.json();
    } catch (error) {
      console.error("Get cart error:", error);
      throw error;
    }
  }

  async addToCart(productId, quantity = 1) {
    try {
      const response = await fetch(`${this.baseURL}/add`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در افزودن به سبد خرید");
      }

      return await response.json();
    } catch (error) {
      console.error("Add to cart error:", error);
      throw error;
    }
  }

  async updateQuantity(productId, quantity) {
    try {
      const response = await fetch(`${this.baseURL}/update`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در بروزرسانی سبد خرید");
      }

      return await response.json();
    } catch (error) {
      console.error("Update quantity error:", error);
      throw error;
    }
  }

  async removeFromCart(productId) {
    try {
      const response = await fetch(`${this.baseURL}/remove/${productId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در حذف از سبد خرید");
      }

      return await response.json();
    } catch (error) {
      console.error("Remove from cart error:", error);
      throw error;
    }
  }

  async clearCart() {
    try {
      const response = await fetch(`${this.baseURL}/clear`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در پاک کردن سبد خرید");
      }

      return await response.json();
    } catch (error) {
      console.error("Clear cart error:", error);
      throw error;
    }
  }

  isLoggedIn() {
    return !!this.token;
  }

  updateToken(token) {
    this.token = token;
  }
}

const cartService = new CartService();
