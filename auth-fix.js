// Authentication Fix Utility
// This script helps diagnose and fix authentication issues

const API_BASE_URL = "http://localhost:3000/api";

class AuthFixer {
  constructor() {
    this.token = localStorage.getItem("token");
    this.currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    this.debugMode = true;
  }

  // Enhanced logging
  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Check if server is running
  async checkServer() {
    try {
      this.log("Checking server connectivity...");
      const response = await fetch(`${API_BASE_URL}/products`);
      const isRunning = response.ok;
      this.log(
        `Server status: ${isRunning ? "Running" : "Not responding"}`,
        isRunning ? "success" : "error"
      );
      return isRunning;
    } catch (error) {
      this.log(`Server check failed: ${error.message}`, "error");
      return false;
    }
  }

  // Enhanced token validation
  checkToken() {
    if (!this.token) {
      this.log("No token found in localStorage", "error");
      return { valid: false, reason: "No token found" };
    }

    try {
      const tokenParts = this.token.split(".");
      if (tokenParts.length !== 3) {
        this.log("Invalid token format (not a valid JWT)", "error");
        return { valid: false, reason: "Invalid token format" };
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();

      if (expDate <= now) {
        this.log("Token has expired", "error");
        return { valid: false, reason: "Token expired" };
      }

      this.log("Token is valid", "success");
      return { valid: true, payload };
    } catch (error) {
      this.log(`Error parsing token: ${error.message}`, "error");
      return { valid: false, reason: "Error parsing token" };
    }
  }

  // Test API call with current token
  async testAPI() {
    if (!this.token) {
      this.log("No token available for API test", "error");
      return { success: false, error: "No token available" };
    }

    try {
      this.log("Testing API call with current token...");
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        this.log("API test successful", "success");
        return { success: true, user };
      } else {
        const error = await response.json();
        this.log(`API test failed: ${error.message}`, "error");
        return { success: false, error: error.message };
      }
    } catch (error) {
      this.log(`API test error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  // Clear all authentication data
  clearAuth() {
    this.log("Clearing authentication data...");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    this.token = null;
    this.currentUser = null;
    this.log("Authentication data cleared", "success");
  }

  // Attempt to login with default admin credentials
  async loginAsAdmin() {
    try {
      this.log("Attempting to login as admin...");
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: "admin123",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        this.token = data.token;
        this.currentUser = data.user;
        this.log("Login successful", "success");
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        this.log(`Login failed: ${error.message}`, "error");
        return { success: false, error: error.message };
      }
    } catch (error) {
      this.log(`Login error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  // Create admin user if it doesn't exist
  async createAdminUser() {
    try {
      this.log("Attempting to create admin user...");
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "مدیر",
          lastName: "سیستم",
          email: "admin@techshop.com",
          phone: "09123456789",
          username: "admin",
          password: "admin123",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.log("Admin user created successfully", "success");
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        this.log(`Admin creation failed: ${error.message}`, "error");
        return { success: false, error: error.message };
      }
    } catch (error) {
      this.log(`Admin creation error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  // Run comprehensive diagnostics
  async diagnose() {
    this.log("🔍 Starting comprehensive authentication diagnostics...", "info");
    console.log("=".repeat(60));

    // Check server
    this.log("1. Checking server connectivity...");
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      this.log(
        "❌ Server is not running. Please start the server first.",
        "error"
      );
      return false;
    }

    // Check token
    this.log("2. Checking authentication token...");
    const tokenCheck = this.checkToken();
    if (!tokenCheck.valid) {
      this.log(`❌ Token is invalid: ${tokenCheck.reason}`, "error");
    }

    // Test API
    this.log("3. Testing API authentication...");
    const apiTest = await this.testAPI();
    if (!apiTest.success) {
      this.log(`❌ API authentication failed: ${apiTest.error}`, "error");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    this.log("📋 DIAGNOSTIC SUMMARY:", "info");

    if (!tokenCheck.valid) {
      this.log("❌ Token is invalid or missing. Need to login.", "error");
      return false;
    }

    if (!apiTest.success) {
      this.log("❌ API call failed. Token might be invalid.", "error");
      return false;
    }

    this.log("✅ Authentication is working properly!", "success");
    return true;
  }

  // Auto-fix common issues
  async autoFix() {
    this.log("🔧 Starting auto-fix process...", "info");
    console.log("=".repeat(60));

    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      this.log(
        "❌ Server is not running. Please start the server first.",
        "error"
      );
      return false;
    }

    const tokenCheck = this.checkToken();
    if (!tokenCheck.valid) {
      this.log("🔄 Token is invalid, attempting to login as admin...", "info");
      const loginResult = await this.loginAsAdmin();
      if (loginResult.success) {
        this.log("✅ Auto-login successful!", "success");
        return true;
      } else {
        this.log("🔄 Login failed, attempting to create admin user...", "info");
        const createResult = await this.createAdminUser();
        if (createResult.success) {
          this.log("✅ Admin user created, attempting login again...", "info");
          const retryLogin = await this.loginAsAdmin();
          if (retryLogin.success) {
            this.log("✅ Auto-fix successful!", "success");
            return true;
          }
        }
        this.log("❌ Auto-fix failed", "error");
        return false;
      }
    }

    const apiTest = await this.testAPI();
    if (!apiTest.success) {
      this.log(
        "🔄 API call failed, clearing auth and attempting login...",
        "info"
      );
      this.clearAuth();
      const loginResult = await this.loginAsAdmin();
      if (loginResult.success) {
        this.log("✅ Auto-fix successful!", "success");
        return true;
      } else {
        this.log("❌ Auto-fix failed", "error");
        return false;
      }
    }

    this.log("✅ No fixes needed!", "success");
    return true;
  }

  // Show current authentication status
  showStatus() {
    console.log("=".repeat(60));
    this.log("🔐 CURRENT AUTHENTICATION STATUS:", "info");
    console.log(`Token exists: ${this.token ? "Yes" : "No"}`);
    console.log(`User logged in: ${this.currentUser ? "Yes" : "No"}`);
    if (this.currentUser) {
      console.log(
        `User: ${this.currentUser.firstName} ${this.currentUser.lastName}`
      );
      console.log(`Role: ${this.currentUser.role}`);
      console.log(`Username: ${this.currentUser.username}`);
    }
    console.log("=".repeat(60));
  }

  // Force refresh authentication
  async forceRefresh() {
    this.log("🔄 Force refreshing authentication...", "info");
    this.clearAuth();
    return await this.autoFix();
  }
}

// Make it available globally
window.AuthFixer = AuthFixer;

// Auto-run diagnostics if this script is loaded
if (typeof window !== "undefined") {
  const fixer = new AuthFixer();

  // Add to window for console access
  window.authFixer = fixer;

  console.log("🔧 AuthFixer loaded with enhanced features!");
  console.log("Available commands:");
  console.log("  authFixer.diagnose() - Run comprehensive diagnostics");
  console.log("  authFixer.autoFix() - Auto-fix authentication issues");
  console.log("  authFixer.showStatus() - Show current auth status");
  console.log("  authFixer.forceRefresh() - Force refresh authentication");
  console.log("  authFixer.clearAuth() - Clear all auth data");

  // Auto-diagnose after a short delay
  setTimeout(() => {
    console.log("\n🔍 Auto-diagnosing authentication...");
    fixer.diagnose();
  }, 1000);
}
