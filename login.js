const API_BASE_URL = "http://localhost:3000/api";

function showMessage(message, type = "error") {
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  errorMessage.style.display = "none";
  successMessage.style.display = "none";

  if (type === "error") {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  } else {
    successMessage.textContent = message;
    successMessage.style.display = "block";
  }
}

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      showMessage("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    try {
      const submitBtn = document.querySelector(".login-btn");
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> در حال ورود...';
      submitBtn.disabled = true;

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        showMessage("ورود موفقیت‌آمیز بود! در حال انتقال...", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } else {
        showMessage(data.message || "خطا در ورود");
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("خطا در اتصال به سرور");
    } finally {
      const submitBtn = document.querySelector(".login-btn");
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ورود';
      submitBtn.disabled = false;
    }
  });

const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("currentUser");

if (token && currentUser) {
  fetch(`${API_BASE_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "index.html";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
      }
    })
    .catch((error) => {
      console.error("Token verification error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const navMenu = document.querySelector(".nav-menu");
  if (navMenu && !document.querySelector(".nav-login")) {
    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.className = "nav-link nav-login";
    loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> ورود';
    navMenu.appendChild(loginLink);
  }
});
