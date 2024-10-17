const allSideMenu = document.querySelectorAll("#sidebar .side-menu.top li a");

allSideMenu.forEach((item) => {
  const li = item.parentElement;

  item.addEventListener("click", function () {
    allSideMenu.forEach((i) => {
      i.parentElement.classList.remove("active");
    });
    li.classList.add("active");
  });
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector("#content nav .bx.bx-menu");
const sidebar = document.getElementById("sidebar");

menuBar.addEventListener("click", function () {
  sidebar.classList.toggle("hide");
});

// LIGHT AND DARK SWITCH
const switchMode = document.getElementById("switch-mode");

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  switchMode.checked = true;
}

switchMode.addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("darkMode", "disabled");
  }
});

// EVENT VIEW FORM
function handleEventViewForm() {
  const eventViewForm = document.getElementById("viewEventForm");
  const contactInput = document.getElementById("eventContact");
  const slider = document.getElementById("event-slider");

  if (eventViewForm && contactInput) {
    const rawContact = contactInput.value;

    if (rawContact.length === 10) {
      const formattedContact = `(${rawContact.slice(0, 3)}) ${rawContact.slice(
        3,
        6
      )}-${rawContact.slice(6)}`;
      contactInput.value = formattedContact;
    }
  }

  if (slider) {
    const privacyStatus = document.getElementById("privacy-status");

    slider.addEventListener("change", function () {
      const newPrivacy = slider.checked ? "Public" : "Private";
      privacyStatus.textContent = newPrivacy;

      const eventId = document.getElementById("event-id").value;

      fetch(`/dashboard/event/updatePrivacy?id=${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privacy: newPrivacy }),
      }).then((response) => {
        if (!response.ok) {
          alert("Failed to update privacy.");
        }
      });
    });
  }
}

// EDIT EVENT VALIDATION
function handleEventEditForm() {
  const eventEditForm = document.getElementById("editEventForm");
  const contactInput = document.getElementById("contact");

  function formatContactNumber(input) {
    const plainContact = input.replace(/\D/g, "").slice(0, 10);
    const match = plainContact.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return input;
  }

  if (eventEditForm) {
    contactInput.value = formatContactNumber(contactInput.value);

    contactInput.addEventListener("input", function () {
      const cursorPosition = this.selectionStart;
      const formattedNumber = formatContactNumber(this.value);
      this.value = formattedNumber;

      this.setSelectionRange(cursorPosition, cursorPosition);
    });

    eventEditForm.addEventListener("submit", async function (event) {
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

      const form_action_url = document.getElementById("editEventForm").action;
      const event_id = new URL(form_action_url).searchParams.get("id");

      try {
        const eventResponse = await fetch(
          `/dashboard/event-edit?id=${event_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          }
        );

        const eventResult = await eventResponse.json();

        if (eventResponse.ok) {
          formMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${eventResult.message}`;
          formMessage.style.color = "green";

          if (eventResult.redirect) {
            setTimeout(() => {
              window.location.href = eventResult.redirectUrl;
            }, 1000);
          }
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

// BLOG FORM
function handleBlogForm() {
  const blogForm = document.getElementById("blogForm");

  if (blogForm) {
    const selectImage = document.querySelector(".select-image");
    const inputFile = document.querySelector("#file");
    const imgArea = document.querySelector(".img-area");

    CKEDITOR.replace("body");

    selectImage.addEventListener("click", function () {
      inputFile.click();
    });

    inputFile.addEventListener("change", function () {
      const image = this.files[0];
      if (image.size < 2000000) {
        const reader = new FileReader();
        reader.onload = () => {
          const allImg = imgArea.querySelectorAll("img");
          allImg.forEach((item) => item.remove());
          const imgUrl = reader.result;

          const img = document.createElement("img");
          img.src = imgUrl;
          imgArea.appendChild(img);
          imgArea.classList.add("active");
          imgArea.dataset.img = image.name;
        };
        reader.readAsDataURL(image);
      } else {
        alert("Image size more than 2MB");
      }
    });
  }
}

// SEND EVENT EMAIL
function handleEventEmail() {
  const eventEmail = document.getElementById("eventEmail");

  if (eventEmail) {
    const dropzone = document.getElementById("dropzone");
    const fileList = document.getElementById("fileList");
    let attachedFiles = [];

    CKEDITOR.replace("body");

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    dropzone.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);

      fileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        handleFiles(files);
      });

      fileInput.click();
      document.body.removeChild(fileInput);
    });

    function handleFiles(files) {
      for (let file of files) {
        if (attachedFiles.some((f) => f.name === file.name)) continue;

        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = file.name;

        const removeButton = document.createElement("button");
        removeButton.className = "btn btn-danger btn-sm ml-2";
        removeButton.style.marginLeft = "4px";
        removeButton.textContent = "x";

        removeButton.addEventListener("click", () => {
          fileList.removeChild(fileItem);
          attachedFiles = attachedFiles.filter((f) => f !== file);
        });

        fileItem.appendChild(fileNameSpan);
        fileItem.appendChild(removeButton);
        fileList.appendChild(fileItem);

        attachedFiles.push(file);
      }
    }

    eventEmail.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitButton = eventEmail.querySelector(".email-send");
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";

      CKEDITOR.instances.body.updateElement();

      const formData = new FormData(eventEmail);
      attachedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      fetch(eventEmail.action, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/dashboard/events?page=1";
          } else {
            alert("Failed to send email");
            submitButton.disabled = false;
            submitButton.textContent = "Send Email";
          }
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          alert("Error sending email");
          submitButton.disabled = false;
          submitButton.textContent = "Send Email";
        });
    });
  }
}

// SEND SUBSCRIBER EMAIL
function handleSubscriberEmail() {
  const subscriberEmail = document.getElementById("subscriberEmail");

  if (subscriberEmail) {
    const dropzone = document.getElementById("dropzone");
    const fileList = document.getElementById("fileList");
    let attachedFiles = [];

    CKEDITOR.replace("body");

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    dropzone.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);

      fileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        handleFiles(files);
      });

      fileInput.click();
      document.body.removeChild(fileInput);
    });

    function handleFiles(files) {
      for (let file of files) {
        if (attachedFiles.some((f) => f.name === file.name)) continue;

        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = file.name;

        const removeButton = document.createElement("button");
        removeButton.className = "btn btn-danger btn-sm ml-2";
        removeButton.style.marginLeft = "4px";
        removeButton.textContent = "x";

        removeButton.addEventListener("click", () => {
          fileList.removeChild(fileItem);
          attachedFiles = attachedFiles.filter((f) => f !== file);
        });

        fileItem.appendChild(fileNameSpan);
        fileItem.appendChild(removeButton);
        fileList.appendChild(fileItem);

        attachedFiles.push(file);
      }
    }

    subscriberEmail.addEventListener("submit", async (e) => {
      e.preventDefault();

      CKEDITOR.instances.body.updateElement();

      const submitButton = subscriberEmail.querySelector(".email-send");
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";

      const formData = new FormData(subscriberEmail);

      attachedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      try {
        const response = await fetch(subscriberEmail.action, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          window.location.href = "/dashboard/subscriptions?page=1";
        } else {
          alert("Failed to send email");
        }
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Error sending email");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Email";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleEventViewForm();
  handleEventEditForm();
  handleBlogForm();
  handleEventEmail();
  handleSubscriberEmail();
});
