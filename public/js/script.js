// NAVBAR STICKY
function toggleStickyClass() {
  const header = document.querySelector("nav");
  const topOfPage = window.scrollY == 0;
  const navbarToggler = document.querySelector(".navbar-toggler");
  const isCollapsed = navbarToggler.classList.contains("collapsed");
  const isMobile = window.innerWidth < 992;

  if (isMobile) {
    if (!topOfPage || !isCollapsed) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  } else {
    if (!topOfPage) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  }
}

window.addEventListener("scroll", toggleStickyClass);
window.addEventListener("resize", toggleStickyClass);
document
  .querySelector(".navbar-toggler")
  .addEventListener("click", toggleStickyClass);

// EMAIL OBFUSCATION
function handleEmailObfuscation() {
  var user = "meditationworkbook";
  var domain = "gmail";
  var tld = "com";
  var element = document.getElementById("contact-link");

  if (element) {
    element.textContent = "Meditation Workbook CA";
    element.href = "#";

    element.addEventListener("click", function (event) {
      event.preventDefault();
      this.href = "mailto:" + user + "@" + domain + "." + tld;
      this.textContent = user + "@" + domain + "." + tld;
      window.location.href = this.href;
    });
  }
}

// USER LOGIN VALIDATION
function handleLoginForm() {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (error) {
      error.preventDefault();

      const loginMessage = document.getElementById("login-message");
      const loginUsername = document.getElementById("login-username");
      const loginPassword = document.getElementById("login-password");

      loginMessage.innerHTML = "";
      loginMessage.classList.remove("alert", "alert-danger");
      loginUsername.innerHTML = "";
      loginPassword.innerHTML = "";

      const loginData = {
        username: this.username.value,
        password: this.password.value,
      };

      const loginResponse = await fetch("/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.ok) {
        loginMessage.classList.add("alert", "alert-success");
        loginMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> Logged in successfully.`;

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        loginResult.errors.forEach((error) => {
          const errorMessage = error.msg;

          switch (errorMessage) {
            case "Username is required":
              loginUsername.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
              break;
            case "Password is required":
              loginPassword.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
              break;
            case "Username or password incorrect!":
              loginMessage.classList.add("alert", "alert-danger");
              loginMessage.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
              break;
            default:
              loginMessage.classList.add("alert", "alert-danger");
              loginMessage.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
              break;
          }
        });
      }
    });
  }
}

// USER REGISTRATION VALIDATION
function handleRegisterForm() {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const registerUsername = document.getElementById("register-username");
      const registerPassword = document.getElementById("register-password");
      const createMessage = document.getElementById("create-message");

      createMessage.innerHTML = "";
      createMessage.classList.remove("alert", "alert-danger");
      registerUsername.innerHTML = "";
      registerPassword.innerHTML = "";

      const registerData = {
        username: this.username.value,
        password: this.password.value,
      };

      const registerResponse = await fetch("/user/new_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const registerResult = await registerResponse.json();

      if (registerResult.success) {
        createMessage.classList.add("alert", "alert-success");
        createMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${registerResult.message}`;

        setTimeout(() => {
          window.location.href = "/dashboard/authors";
        }, 1000);
      } else {
        registerResult.errors.forEach((error) => {
          const errorMessage = error.msg;

          switch (error.path) {
            case "username":
              registerUsername.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
              break;
            case "password":
              registerPassword.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
              break;
            default:
              createMessage.classList.add("alert", "alert-danger");
              createMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> An error occurred. Please try again later.`;
              break;
          }
        });
      }
    });
  }
}

// SUBSCRIPTION VALIDATION
function handleSubscriptionForm() {
  const subscribeForm = document.getElementById("subscribeForm");

  if (subscribeForm) {
    subscribeForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = this.email.value;
      const validationMsg = document.getElementById("email-validation");

      validationMsg.innerHTML = "";
      validationMsg.style.color = "";

      try {
        const subResponse = await fetch("/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const subResult = await subResponse.json();

        if (subResponse.ok) {
          validationMsg.style.color = "green";
          validationMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${subResult.message}`;

          setTimeout(() => {
            validationMsg.innerHTML = "";
          }, 5000);
        } else {
          if (subResult.errors && subResult.errors.length > 0) {
            const errorMessages = subResult.errors
              .map((error) => error.msg)
              .join(", ");
            validationMsg.style.color = "red";
            validationMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessages}`;
          } else {
            validationMsg.style.color = "red";
            validationMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> An error occurred. Please try again later.`;
          }

          setTimeout(() => {
            validationMsg.innerHTML = "";
          }, 5000);
        }
      } catch (error) {
        validationMsg.style.color = "red";
        validationMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> An error occurred. Please try again later.`;

        setTimeout(() => {
          validationMsg.innerHTML = "";
        }, 5000);
      }
    });
  }
}

// EVENT SUBMISSION VALIDATION
function handleEventForm() {
  const eventForm = document.getElementById("eventForm");
  const contactInput = document.getElementById("contact");

  function formatPhoneNumber(value) {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      let formatted = "";
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return value;
  }

  function handlePhoneInput(event) {
    const input = event.target.value;
    const digitsOnly = input.replace(/\D/g, "");

    if (digitsOnly.length > 10) {
      event.target.value = formatPhoneNumber(digitsOnly.slice(0, 10));
    } else {
      event.target.value = formatPhoneNumber(digitsOnly);
    }
  }

  if (contactInput) {
    contactInput.addEventListener("input", handlePhoneInput);
  }

  if (eventForm) {
    eventForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const plainContact = contactInput.value.replace(/\D/g, "");
      const validationFont = document.querySelectorAll(".validation-font");
      const formMessage = document.getElementById("form-message");

      const eventData = {
        name: this.name.value.trim(),
        email: this.email.value.trim(),
        contact: plainContact,
        orgEvent: this.orgEvent.value.trim(),
        location: this.location.value.trim(),
        preferredDate: this.preferredDate.value,
        alternateDate: this.alternateDate.value,
        time: this.time.value,
        attendees: this.attendees.value,
        additionalDetails: this.additionalDetails.value.trim(),
      };

      validationFont.forEach((message) => (message.innerHTML = ""));

      try {
        const eventResponse = await fetch("/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        const eventResult = await eventResponse.json();

        if (eventResponse.ok) {
          formMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${eventResult.message}`;
          formMessage.style.color = "green";

          this.reset();

          setTimeout(() => {
            formMessage.innerHTML = "";
          }, 5000);
        } else {
          eventResult.errors.forEach((error) => {
            const errorMessage = error.msg;

            const validationMap = {
              name: "event-name-validation",
              email: "event-email-validation",
              contact: "event-contact-validation",
              orgEvent: "event-orgEvent-validation",
              location: "event-location-validation",
              preferredDate: "event-preferredDate-validation",
              alternateDate: "event-alternateDate-validation",
              time: "event-time-validation",
              attendees: "event-attendees-validation",
              additionalDetails: "event-additionalDetails-validation",
            };

            const validationElement = document.getElementById(
              validationMap[error.path]
            );

            if (validationElement) {
              validationElement.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMessage}`;
            }
          });
        }
      } catch (error) {
        formMessage.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> An error occurred. Please try again later.`;
        formMessage.style.color = "red";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleEmailObfuscation();
  handleLoginForm();
  handleRegisterForm();
  handleSubscriptionForm();
  handleEventForm();
});
