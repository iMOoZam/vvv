// API Base URL
const API_BASE_URL = "http://localhost:3000/api";

// Show message function
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

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateUsername(username) {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      showMessage("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    if (!validateEmail(email)) {
      showMessage("لطفاً یک ایمیل معتبر وارد کنید");
      return;
    }

    if (!validatePhone(phone)) {
      showMessage("لطفاً یک شماره تلفن معتبر وارد کنید (مثال: 09123456789)");
      return;
    }

    if (!validateUsername(username)) {
      showMessage(
        "نام کاربری باید حداقل 3 کاراکتر باشد و فقط شامل حروف، اعداد و _ باشد"
      );
      return;
    }

    if (!validatePassword(password)) {
      showMessage("رمز عبور باید حداقل 6 کاراکتر باشد");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    try {
      const submitBtn = document.querySelector(".login-btn");
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> در حال ثبت نام...';
      submitBtn.disabled = true;

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          "ثبت نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...",
          "success"
        );

        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      } else {
        showMessage(data.message || "خطا در ثبت نام");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showMessage("خطا در اتصال به سرور");
    } finally {
      const submitBtn = document.querySelector(".login-btn");
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> ثبت نام';
      submitBtn.disabled = false;
    }
  });

document.getElementById("username").addEventListener("blur", function () {
  const username = this.value.trim();
  if (username && !validateUsername(username)) {
    this.style.borderColor = "#ff6b6b";
  } else {
    this.style.borderColor = "#e1e5e9";
  }
});

document.getElementById("email").addEventListener("blur", function () {
  const email = this.value.trim();
  if (email && !validateEmail(email)) {
    this.style.borderColor = "#ff6b6b";
  } else {
    this.style.borderColor = "#e1e5e9";
  }
});

document.getElementById("phone").addEventListener("blur", function () {
  const phone = this.value.trim();
  if (phone && !validatePhone(phone)) {
    this.style.borderColor = "#ff6b6b";
  } else {
    this.style.borderColor = "#e1e5e9";
  }
});

document.getElementById("password").addEventListener("blur", function () {
  const password = this.value;
  if (password && !validatePassword(password)) {
    this.style.borderColor = "#ff6b6b";
  } else {
    this.style.borderColor = "#e1e5e9";
  }
});

document
  .getElementById("confirmPassword")
  .addEventListener("blur", function () {
    const confirmPassword = this.value;
    const password = document.getElementById("password").value;
    if (confirmPassword && password !== confirmPassword) {
      this.style.borderColor = "#ff6b6b";
    } else {
      this.style.borderColor = "#e1e5e9";
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
