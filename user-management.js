const API_BASE_URL = "http://localhost:3000/api";

console.log("user-management.js loaded successfully");

class UserManagement {
  constructor() {
    this.currentUser = this.loadCurrentUser();
    this.token = localStorage.getItem("token");
    this.init();
  }

  loadCurrentUser() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
  }

  async init() {
    await this.checkAuthentication();
    this.updateNavigation();
  }

  async checkAuthentication() {
    if (!this.token) {
      this.currentUser = null;
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        this.logout();
      }
    } catch (error) {
      console.error("Authentication check error:", error);
      this.logout();
    }
  }

  updateNavigation() {
    const navMenu = document.querySelector(".nav-menu");
    if (!navMenu) return;

    // Remove all dynamic navigation elements
    const dynamicElements = navMenu.querySelectorAll(
      ".nav-login, .nav-logout, .nav-profile, .nav-admin"
    );
    dynamicElements.forEach((element) => element.remove());

    // Handle admin-specific links
    const adminLink = navMenu.querySelector('a[href="admin-simple.html"]');
    if (adminLink) {
      if (!this.currentUser || this.currentUser.role !== "admin") {
        adminLink.style.display = "none";
      } else {
        adminLink.style.display = "inline-block";
      }
    }

    if (this.currentUser) {
      const profileLink = document.createElement("a");
      profileLink.href = "#";
      profileLink.className = "nav-link nav-profile";
      profileLink.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.firstName}`;
            profileLink.addEventListener("click", (e) => {
        console.log("Profile link clicked");
        e.preventDefault();
 
        // Just show an alert with user info for now
        const userInfo = `
          نام: ${this.currentUser.firstName}
          نام خانوادگی: ${this.currentUser.lastName}
          ایمیل: ${this.currentUser.email}
          شماره تلفن: ${this.currentUser.phone}
          نام کاربری: ${this.currentUser.username}
          نوع کاربر: ${
            this.currentUser.role === "admin" ? "مدیر" : "کاربر عادی"
          }
        `;
 
        alert("اطلاعات کاربر:\n" + userInfo);
      });
      navMenu.appendChild(profileLink);

      const logoutLink = document.createElement("a");
      logoutLink.href = "#";
      logoutLink.className = "nav-link nav-logout";
      logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> خروج';
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
      navMenu.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement("a");
      loginLink.href = "login.html";
      loginLink.className = "nav-link nav-login";
      loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> ورود';
      navMenu.appendChild(loginLink);
    }
  }

  logout() {
    if (confirm("آیا مطمئن هستید که می‌خواهید خارج شوید؟")) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      this.currentUser = null;
      this.token = null;
      this.updateNavigation();
      window.location.reload();
    }
  }

  showUserProfile() {
    console.log("showUserProfile called");

    // Create a very simple modal using basic DOM methods
    const modal = document.createElement("div");
    modal.id = "profileModal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.8)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    const content = document.createElement("div");
    content.style.backgroundColor = "white";
    content.style.padding = "30px";
    content.style.borderRadius = "10px";
    content.style.maxWidth = "400px";
    content.style.width = "90%";
    content.style.textAlign = "center";
    content.style.color = "black";

    content.innerHTML = `
      <h2 style="margin-bottom: 20px; color: #333;">پروفایل کاربری</h2>
      <div style="text-align: left; margin-bottom: 20px;">
        <p><strong>نام:</strong> ${this.currentUser.firstName}</p>
        <p><strong>نام خانوادگی:</strong> ${this.currentUser.lastName}</p>
        <p><strong>ایمیل:</strong> ${this.currentUser.email}</p>
        <p><strong>شماره تلفن:</strong> ${this.currentUser.phone}</p>
        <p><strong>نام کاربری:</strong> ${this.currentUser.username}</p>
        <p><strong>نوع کاربر:</strong> ${
          this.currentUser.role === "admin" ? "مدیر" : "کاربر عادی"
        }</p>
      </div>
      <button onclick="document.getElementById('profileModal').remove()" style="
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
      ">بستن</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    console.log("Modal created using DOM methods");
  }

  closeProfile() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.remove();
  }

  editProfile() {
    alert("قابلیت ویرایش پروفایل به زودی اضافه خواهد شد");
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin";
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken() {
    return this.token;
  }
}

const userManagement = new UserManagement();

// Make sure it's accessible globally
window.userManagement = userManagement;
console.log("UserManagement initialized:", userManagement);
