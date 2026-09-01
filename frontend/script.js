/* =========================================================
   CAMPUSSOS AI
   FRONTEND + FLASK BACKEND CONNECTION
========================================================= */

const API_BASE_URL = "http://127.0.0.1:5000";

let locationIsShared = false;
let sosCountdownTimer = null;
let sosCountdown = 3;


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

function showPage(pageName) {

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById(pageName);

  if (target) {
    target.classList.add("active");
  }

  navLinks.forEach(link => {

    link.classList.remove("active");

    if (link.dataset.page === pageName) {
      link.classList.add("active");
    }

  });

// Load dynamic data when opening history pages
  if (pageName === "sosHistory") {
    loadSOSHistory();
  }

  if (pageName === "incidentHistory") {
    loadIncidents();
  }
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  closeMobileMenu();
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function toggleMobileMenu() {

  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.toggle("open");
  }

}


function closeMobileMenu() {

  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.remove("open");
  }

}


function mobileNavigate(page) {

  showPage(page);

  closeMobileMenu();

}


/* =========================================================
   NAV LINK EVENTS
========================================================= */

navLinks.forEach(link => {

  link.addEventListener("click", () => {

    const page = link.dataset.page;

    showPage(page);

  });

});


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;

function showToast(message) {

  const toast = document.getElementById("toast");
  const messageElement =
    document.getElementById("toastMessage");

  if (!toast || !messageElement) {
    console.log(message);
    return;
  }

  messageElement.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


/* =========================================================
   BACKEND HEALTH CHECK
========================================================= */

async function checkBackend() {

  try {

    const response =
      await fetch(`${API_BASE_URL}/api/health`);

    const data =
      await response.json();

    console.log("Backend:", data);

    if (data.status === "success") {

      console.log(
        "CampusSOS backend connected successfully."
      );

    }

  } catch (error) {

    console.error(
      "Backend connection failed:",
      error
    );

    showToast(
      "Backend is not connected. Start Flask server."
    );

  }

}


/* =========================================================
   LOCATION SHARING
========================================================= */

async function shareLocation() {

  if (!locationIsShared) {

    if (!navigator.geolocation) {

      showToast(
        "Geolocation is not supported by this browser"
      );

      return;

    }


    navigator.geolocation.getCurrentPosition(

      async function(position) {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        try {

          const response =
            await fetch(
              `${API_BASE_URL}/api/location`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                  latitude: latitude,
                  longitude: longitude
                })
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            throw new Error(
              data.error ||
              "Location request failed"
            );

          }


          locationIsShared = true;


          const action =
            document.getElementById(
              "locationAction"
            );

          if (action) {

            action.textContent =
              "Location Shared";

          }


          showToast(
            "Your location is now being shared"
          );


          console.log(
            "Location sent:",
            data
          );


        } catch (error) {

          console.error(
            "Location API error:",
            error
          );

          showToast(
            "Unable to share location"
          );

        }

      },


      function(error) {

        console.error(
          "Geolocation error:",
          error
        );

        showToast(
          "Please allow location access"
        );

      }

    );

  } else {

    locationIsShared = false;


    const action =
      document.getElementById(
        "locationAction"
      );

    if (action) {

      action.textContent =
        "Share My Location";

    }


    showToast(
      "Location sharing stopped"
    );

  }

}


/* =========================================================
   SOS MODAL
========================================================= */

function openSOS() {

  const modal =
    document.getElementById("sosModal");

  if (!modal) return;

  modal.classList.add("open");

  resetSOS();

}


function closeSOS() {

  const modal =
    document.getElementById("sosModal");

  if (!modal) return;

  modal.classList.remove("open");

  resetSOS();

}


function resetSOS() {

  clearInterval(sosCountdownTimer);

  sosCountdown = 3;


  const initial =
    document.getElementById("sosInitial");

  const active =
    document.getElementById("sosActive");

  const countdown =
    document.getElementById("countdown");

  const activateButton =
    document.getElementById("activateSOS");


  if (initial) {

    initial.style.display =
      "block";

  }


  if (active) {

    active.classList.remove(
      "visible"
    );

  }


  if (countdown) {

    countdown.style.display =
      "none";

    countdown.textContent =
      "3";

  }


  if (activateButton) {

    activateButton.disabled =
      false;

  }

}


/* =========================================================
   ACTIVATE SOS
========================================================= */

function activateSOS() {

  const button =
    document.getElementById(
      "activateSOS"
    );

  const countdown =
    document.getElementById(
      "countdown"
    );


  if (!button || !countdown) {
    return;
  }


  button.disabled = true;

  countdown.style.display =
    "grid";

  sosCountdown = 3;

  countdown.textContent =
    sosCountdown;


  sosCountdownTimer =
    setInterval(() => {

      sosCountdown--;

      countdown.textContent =
        sosCountdown;


      if (sosCountdown <= 0) {

        clearInterval(
          sosCountdownTimer
        );

        activateEmergencyState();

      }

    }, 800);

}


/* =========================================================
   SEND SOS TO BACKEND
========================================================= */
/* =========================================================
   SEND SOS TO BACKEND
========================================================= */

async function sendSOS() {

  let latitude = null;
  let longitude = null;
  let locationText = "Central Student Hub";


  /* GET USER LOCATION */

  try {

    if (navigator.geolocation) {

      const position = await new Promise(
        (resolve, reject) => {

          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );

        }
      );


      latitude =
        position.coords.latitude;

      longitude =
        position.coords.longitude;


      locationText =
        `${latitude}, ${longitude}`;

    }

  } catch (error) {

    console.log(
      "Location unavailable:",
      error
    );

  }


  /* SEND SOS TO FLASK */

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/sos`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            location:
              locationText,

            latitude:
              latitude,

            longitude:
              longitude,

            status:
              "active"

          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "SOS request failed"
      );

    }


    console.log(
      "SOS backend response:",
      data
    );


    return data;


  } catch (error) {

    console.error(
      "SOS API error:",
      error
    );


    showToast(
      "Could not connect to SOS backend"
    );


    return null;

  }

}
/* =========================================================
   ACTIVE EMERGENCY STATE
========================================================= */

async function activateEmergencyState() {

  const initial =
    document.getElementById(
      "sosInitial"
    );

  const active =
    document.getElementById(
      "sosActive"
    );


  if (initial) {

    initial.style.display =
      "none";

  }


  if (active) {

    active.classList.add(
      "visible"
    );

  }


  const result =
    await sendSOS();


  if (result) {

    showToast(
      "Emergency alert sent successfully"
    );

  }

}


/* =========================================================
   AI ASSISTANT
========================================================= */

function handleAIKey(event) {

  if (event.key === "Enter") {

    event.preventDefault();

    sendAI();

  }

}


function askAI(question) {

  const input =
    document.getElementById(
      "aiInput"
    );

  if (!input) return;

  input.value =
    question;

  sendAI();

}


/* =========================================================
   SEND AI MESSAGE TO FLASK
========================================================= */

async function sendAI() {

  const input =
    document.getElementById(
      "aiInput"
    );

  const chat =
    document.getElementById(
      "chatBody"
    );


  if (!input || !chat) {
    return;
  }


  const message =
    input.value.trim();


  if (!message) {

    showToast(
      "Tell the AI what is happening first"
    );

    return;

  }


  /* USER MESSAGE */

  const userRow =
    document.createElement(
      "div"
    );

  userRow.className =
    "chat-row";

  userRow.style.justifyContent =
    "flex-end";


  const userBubble =
    document.createElement(
      "div"
    );

  userBubble.className =
    "chat-bubble";

  userBubble.style.background =
    "#2563eb";

  userBubble.style.color =
    "white";

  userBubble.style.borderRadius =
    "14px 14px 4px 14px";

  userBubble.textContent =
    message;


  userRow.appendChild(
    userBubble
  );

  chat.appendChild(
    userRow
  );


  input.value = "";

  chat.scrollTop =
    chat.scrollHeight;


  /* AI THINKING */

  const thinking =
    document.createElement(
      "div"
    );

  thinking.className =
    "chat-row ai";

  thinking.innerHTML = `
    <div class="chat-avatar">
      <i class="fa-solid fa-robot"></i>
    </div>

    <div class="chat-bubble">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      Analyzing your situation...
    </div>
  `;


  chat.appendChild(
    thinking
  );

  chat.scrollTop =
    chat.scrollHeight;


  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: message
          })
        }
      );


    const data =
      await response.json();


    thinking.remove();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "AI request failed"
      );

    }


    const reply =
      data.reply ||
      "Sorry, I could not generate a response.";


    addAIMessage(
      chat,
      reply
    );


  } catch (error) {

    console.error(
      "AI API error:",
      error
    );


    thinking.remove();


    addAIMessage(
      chat,
      "I could not connect to the CampusSOS AI backend. Please make sure Flask is running on port 5000."
    );

  }

}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(
  chat,
  response
) {

  const aiRow =
    document.createElement(
      "div"
    );

  aiRow.className =
    "chat-row ai";


  const avatar =
    document.createElement(
      "div"
    );

  avatar.className =
    "chat-avatar";

  avatar.innerHTML =
    `<i class="fa-solid fa-robot"></i>`;


  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "chat-bubble";


  const label =
    document.createElement(
      "strong"
    );

  label.style.display =
    "block";

  label.style.color =
    "#2563eb";

  label.style.fontSize =
    "8px";

  label.style.letterSpacing =
    ".12em";

  label.style.marginBottom =
    "5px";

  label.textContent =
    "AI SAFETY GUIDANCE";


  const responseText =
    document.createElement(
      "div"
    );

  responseText.textContent =
    response;


  bubble.appendChild(
    label
  );

  bubble.appendChild(
    responseText
  );


  aiRow.appendChild(
    avatar
  );

  aiRow.appendChild(
    bubble
  );


  chat.appendChild(
    aiRow
  );


  chat.scrollTop =
    chat.scrollHeight;

}


/* =========================================================
   VOICE SOS
========================================================= */

function voiceSOS() {

  showToast(
    "Listening for voice SOS..."
  );


  if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
  ) {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "en-US";


    recognition.start();


    recognition.onresult =
      function(event) {

        const result =
          event.results[0][0]
            .transcript;


        const input =
          document.getElementById(
            "aiInput"
          );


        if (input) {

          input.value =
            result;

        }


        showToast(
          "Voice captured"
        );


        if (
          result
            .toLowerCase()
            .includes("sos") ||
          result
            .toLowerCase()
            .includes("emergency")
        ) {

          openSOS();

        }

      };


    recognition.onerror =
      function() {

        showToast(
          "Voice recognition unavailable"
        );

      };

  } else {

    showToast(
      "Voice recognition is not supported in this browser"
    );

  }

}


/* =========================================================
   INCIDENT REPORT
========================================================= */

const incidentForm =
  document.getElementById(
    "incidentForm"
  );


if (incidentForm) {

  incidentForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const description =
        document.getElementById(
          "incidentDescription"
        )?.value.trim();


      if (!description) {

        showToast(
          "Please describe the incident"
        );

        return;

      }


      /* GET FORM VALUES */

      const categoryElement =
        document.querySelector(
          'select[name="category"]'
        );


      const locationElement =
        document.querySelector(
          'input[name="location"]'
        );


      const anonymousElement =
        document.querySelector(
          'input[name="anonymous"]'
        );


      const activePriority =
        document.querySelector(
          ".priority.active"
        );


      const category =
        categoryElement
          ? categoryElement.value
          : "Security";


      const location =
        locationElement
          ? locationElement.value
          : "Campus";


      const anonymous =
        anonymousElement
          ? anonymousElement.checked
          : false;


      let priority =
        "normal";


      if (activePriority) {

        priority =
          activePriority.dataset.priority ||
          activePriority.getAttribute(
            "data-priority"
          ) ||
          "urgent";

      }


      /* SEND TO FLASK */

      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/incidents`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                category:
                  category,

                location:
                  location,

                description:
                  description,

                priority:
                  priority,

                anonymous:
                  anonymous

              })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Incident submission failed"
          );

        }


        console.log(
          "Incident submitted:",
          data
        );


        const form =
          document.getElementById(
            "incidentForm"
          );


        const success =
          document.getElementById(
            "reportSuccess"
          );


        if (form) {

          form.style.display =
            "none";

        }


        if (success) {

          success.classList.add(
            "visible"
          );

        }


        showToast(
          `Incident submitted: ${data.report_id}`
        );


      } catch (error) {

        console.error(
          "Incident API error:",
          error
        );


        showToast(
          "Could not submit incident. Check Flask backend."
        );

      }

    }
  );

}


/* =========================================================
   RESET REPORT
========================================================= */

function resetReport() {

  const form =
    document.getElementById(
      "incidentForm"
    );

  const success =
    document.getElementById(
      "reportSuccess"
    );


  if (form) {

    form.reset();

    form.style.display =
      "block";

  }


  if (success) {

    success.classList.remove(
      "visible"
    );

  }

}


/* =========================================================
   INCIDENT PRIORITY
========================================================= */

function setPriority(
  button,
  priority
) {

  const buttons =
    document.querySelectorAll(
      ".priority"
    );


  buttons.forEach(btn => {

    btn.classList.remove(
      "active"
    );

  });


  button.classList.add(
    "active"
  );


  button.dataset.priority =
    priority;


  if (priority === "critical") {

    button.style.color =
      "#dc2626";

    button.style.background =
      "#fef2f2";


    showToast(
      "Critical priority selected"
    );


  } else if (priority === "urgent") {

    button.style.color =
      "#d97706";

    button.style.background =
      "#fffbeb";


    showToast(
      "Urgent priority selected"
    );


  } else {

    button.style.color = "";

    button.style.background = "";

  }

}


/* =========================================================
   LOAD SAFETY SCORE
========================================================= */

/* =========================================================
   LOAD SAFETY SCORE
========================================================= */

async function loadSafetyScore() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/safety-score`
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Safety score failed"
      );

    }

    console.log(
      "Safety Score:",
      data
    );


    /* -----------------------------------------------------
       SAFETY SCORE
    ----------------------------------------------------- */

    const score =
      document.querySelector(
        ".score-header strong"
      );

    if (
      score &&
      data.score !== undefined
    ) {

      score.textContent =
        data.score;

    }


    /* -----------------------------------------------------
       SAFETY SCORE PROGRESS BAR
    ----------------------------------------------------- */

    const scoreBar =
      document.querySelector(
        ".score-bar span"
      );

    if (
      scoreBar &&
      data.score !== undefined
    ) {

      scoreBar.style.width =
        `${Math.min(100, Math.max(0, Number(data.score)))}%`;

    }


    /* -----------------------------------------------------
       METRICS
    ----------------------------------------------------- */

    const metrics =
      document.querySelectorAll(
        ".metrics > div"
      );


    if (metrics.length >= 4) {


      /* Safe Zones */

      if (
        data.safe_zones !== undefined
      ) {

        metrics[0]
          .querySelector("strong")
          .textContent =
          data.safe_zones;

      }


      /* Security Posts */

      if (
        data.security_posts !== undefined
      ) {

        metrics[1]
          .querySelector("strong")
          .textContent =
          data.security_posts;

      }


      /* Response */

      if (
        data.response !== undefined
      ) {

        metrics[2]
          .querySelector("strong")
          .textContent =
          data.response;

      }


      /* AI Guidance */

      if (
        data.ai_guidance !== undefined
      ) {

        metrics[3]
          .querySelector("strong")
          .textContent =
          data.ai_guidance;

      }

    }


    console.log(
      "Safety Score UI updated successfully."
    );


  } catch (error) {

    console.error(
      "Safety score error:",
      error
    );

  }

}

/* =========================================================
   LOAD CAMPUS ALERTS
===/* =========================================================
   LOAD CAMPUS ALERTS
========================================================= */
/* =========================================================
   LOAD CAMPUS ALERTS
========================================================= */

async function loadAlerts() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/alerts`
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Campus Alerts API:", data);

    const container =
      document.getElementById("alertsList");

    if (!container) {
      console.error(
        "alertsList element not found"
      );
      return;
    }

    /* -----------------------------------------------------
       GET ALERT ARRAY
    ----------------------------------------------------- */

    let alerts = [];

    if (Array.isArray(data)) {

      alerts = data;

    } else if (
      data &&
      Array.isArray(data.alerts)
    ) {

      alerts = data.alerts;

    } else if (
      data &&
      Array.isArray(data.data)
    ) {

      alerts = data.data;

    } else if (
      data &&
      Array.isArray(data.results)
    ) {

      alerts = data.results;
    }

    console.log(
      "Alerts found:",
      alerts.length
    );


    /* -----------------------------------------------------
       CLEAR OLD LOADING CONTENT
    ----------------------------------------------------- */

    container.innerHTML = "";


    /* -----------------------------------------------------
       NO ALERTS
    ----------------------------------------------------- */

    if (alerts.length === 0) {

      container.innerHTML = `

        <div class="history-empty">

          <i class="fa-solid fa-bell-slash"></i>

          <p>
            No campus alerts available.
          </p>

        </div>

      `;

      return;
    }


    /* -----------------------------------------------------
       DISPLAY ALERTS
    ----------------------------------------------------- */

    alerts.forEach((alert) => {

      console.log(
        "DISPLAYING ALERT:",
        alert
      );


      const card =
        document.createElement("div");

      card.className = "alert-card";

      /* Make card clickable */
      card.style.cursor = "pointer";
      card.onclick = () => openAlertDetail(alert);


      /* ---------------------------------------------------
         ALERT TYPE
      --------------------------------------------------- */

      const type =
        alert.type ||
        alert.category ||
        alert.alert_type ||
        "CAMPUS";


      /* ---------------------------------------------------
         ALERT TITLE
      --------------------------------------------------- */

      const title =
        alert.title ||
        alert.name ||
        alert.heading ||
        alert.message ||
        "Campus Alert";


      /* ---------------------------------------------------
         ALERT DESCRIPTION
      --------------------------------------------------- */

      const description =
        alert.description ||
        alert.details ||
        alert.message ||
        alert.content ||
        "Important campus information.";


      /* ---------------------------------------------------
         DATE / TIME
      --------------------------------------------------- */

      const createdAt =
        alert.created_at ||
        alert.timestamp ||
        alert.date ||
        alert.time ||
        "Recently";


      /* ---------------------------------------------------
         SEVERITY
      --------------------------------------------------- */

      const severity =
        alert.severity ||
        "medium";

      let severityColor = "orange";

      if (severity.toLowerCase() === "high" || severity.toLowerCase() === "critical") {
        severityColor = "red";
      } else if (severity.toLowerCase() === "low" || severity.toLowerCase() === "info") {
        severityColor = "blue";
      }


      /* ---------------------------------------------------
         STATUS
      --------------------------------------------------- */

      const status =
        alert.status ||
        "";


      /* ---------------------------------------------------
         ICON + COLOR
      --------------------------------------------------- */

      let icon = "fa-bullhorn";

      let iconClass = "blue";


      const typeText =
        String(type).toLowerCase();


      if (
        typeText.includes("security") ||
        typeText.includes("danger")
      ) {

        icon = "fa-triangle-exclamation";

        iconClass = "red";

      }

      else if (
        typeText.includes("weather") ||
        typeText.includes("rain")
      ) {

        icon = "fa-cloud-rain";

        iconClass = "orange";

      }

      else if (
        typeText.includes("fire")
      ) {

        icon = "fa-fire";

        iconClass = "red";

      }

      else if (
        typeText.includes("medical")
      ) {

        icon = "fa-heart-pulse";

        iconClass = "purple";

      }

      else if (
        typeText.includes("campus")
      ) {

        icon = "fa-building";

        iconClass = "blue";

      }

      else if (
        typeText.includes("announcement")
      ) {

        icon = "fa-bullhorn";

        iconClass = "purple";

      }


      /* ---------------------------------------------------
         CREATE CARD
      --------------------------------------------------- */

      card.innerHTML = `

        <div class="alert-card-icon ${iconClass}">

          <i class="fa-solid ${icon}"></i>

        </div>


        <div>

          <span>
            ${type} • ${createdAt}
          </span>

          <div class="alert-card-severity-badge ${severityColor}">
            ${severity.charAt(0).toUpperCase() + severity.slice(1)}
          </div>

          <h3>
            ${title}
          </h3>


          <p>
            ${description}
          </p>


          ${
            status
              ? `
                <small>
                  Status: ${status}
                </small>
              `
              : ""
          }

          <small class="alert-card-click-hint">
            Click to view details
          </small>

        </div>

      `;


      /* ---------------------------------------------------
         ADD CARD TO ALERTS PAGE
      --------------------------------------------------- */

      container.appendChild(card);


      console.log(
        "Alert card added:",
        card
      );

    });


    console.log(
      "Campus alerts displayed successfully."
    );


  } catch (error) {

    console.error(
      "Campus alerts error:",
      error
    );


    const container =
      document.getElementById(
        "alertsList"
      );


    if (container) {

      container.innerHTML = `

        <div class="history-empty error">

          <i class="fa-solid fa-circle-exclamation"></i>

          <p>
            Unable to load campus alerts.
          </p>

        </div>

      `;

    }

  }

}
/* =========================================================
   LOAD SAFETY MAP DATA
========================================================= */
     /* =========================================================
   LOAD SAFETY MAP
========================================================= */


async function loadSafetyMap() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/safety-map`
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Safety Map API:", data);


    /* -----------------------------------------------------
       GET MAP DATA
    ----------------------------------------------------- */

    let locations = [];

    if (Array.isArray(data)) {

      locations = data;

    } else if (
      data &&
      Array.isArray(data.locations)
    ) {

      locations = data.locations;

    } else if (
      data &&
      Array.isArray(data.data)
    ) {

      locations = data.data;

    } else if (
      data &&
      Array.isArray(data.results)
    ) {

      locations = data.results;

    } else if (
      data &&
      Array.isArray(data.incidents)
    ) {

      locations = data.incidents;

    }


    console.log(
      "Safety map locations found:",
      locations.length
    );


    /* -----------------------------------------------------
       FIND MAP
    ----------------------------------------------------- */

    const map =
      document.querySelector(".map-large-background");

    if (!map) {

      console.error(
        "Safety map container not found"
      );

      return;
    }


    /* -----------------------------------------------------
       DISPLAY DYNAMIC LOCATIONS
    ----------------------------------------------------- */

    locations.forEach((location) => {

      console.log(
        "DISPLAYING MAP LOCATION:",
        location
      );


      const pin =
        document.createElement("div");

      pin.className =
        "map-page-pin dynamic-map-pin";


      /* Location type */

      const type =
        String(
          location.type ||
          location.category ||
          location.status ||
          "incident"
        ).toLowerCase();


      /* ---------------------------------------------------
         ICON
      --------------------------------------------------- */

      let icon = "fa-triangle-exclamation";


      if (type.includes("security")) {

        icon = "fa-shield-halved";

      }

      else if (type.includes("medical")) {

        icon = "fa-plus";

      }

      else if (type.includes("safe")) {

        icon = "fa-shield";

      }

      else if (type.includes("fire")) {

        icon = "fa-fire";

      }


      pin.innerHTML = `
        <i class="fa-solid ${icon}"></i>
      `;


      /* ---------------------------------------------------
         POSITION
         
         If backend gives top/left use them.
         Otherwise create a safe random position.
      --------------------------------------------------- */

      let top =
        location.top ||
        location.y ||
        "50%";

      let left =
        location.left ||
        location.x ||
        "50%";


      /* Convert number values to percentage */

      if (
        typeof top === "number"
      ) {

        top = `${top}%`;

      }

      if (
        typeof left === "number"
      ) {

        left = `${left}%`;

      }


      pin.style.top = top;
      pin.style.left = left;


      /* ---------------------------------------------------
         TOOLTIP
      --------------------------------------------------- */

      const name =
        location.name ||
        location.title ||
        location.location ||
        location.description ||
        "Safety location";


      pin.title = name;


      map.appendChild(pin);

    });


    console.log(
      "Safety map dynamic locations displayed successfully."
    );


  } catch (error) {

    console.error(
      "Safety map API error:",
      error
    );

  }

}
loadSafetyMap();

/* =========================================================
   MAP SEARCH - HANDLE ENTER KEY
========================================================= */

function handleMapSearchKey(event) {

  if (event.key === "Enter") {

    event.preventDefault();

    searchMapLocation();

  }

}


/* =========================================================
   SEARCH MAP LOCATION
========================================================= */

async function searchMapLocation() {

  const input = document.getElementById("mapSearchInput");

  if (!input) return;

  const searchQuery = input.value.trim().toLowerCase();

  if (!searchQuery) {

    showToast("Please enter a location to search");

    return;

  }

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/safety-map`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch map data");
    }

    const data = await response.json();

    let locations = [];

    if (Array.isArray(data)) {
      locations = data;
    } else if (data && Array.isArray(data.locations)) {
      locations = data.locations;
    } else if (data && Array.isArray(data.data)) {
      locations = data.data;
    } else if (data && Array.isArray(data.results)) {
      locations = data.results;
    }

    /* Search for matching location */

    const matched = locations.find(loc => {

      const name = (loc.name || "").toLowerCase();
      const location = (loc.location || "").toLowerCase();
      const type = (loc.type || "").toLowerCase();

      return (
        name.includes(searchQuery) ||
        location.includes(searchQuery) ||
        type.includes(searchQuery)
      );

    });

    if (matched) {

      updateMapSidebarWithResult(matched);

      showToast(`Found: ${matched.name}`);

    } else {

      showToast("No matching location found");

      /* Show empty state */

      const title = document.getElementById("sidebarTitle");
      const location = document.getElementById("sidebarLocation");

      if (title) title.textContent = "No Results";
      if (location) location.textContent = "Try searching for: Security, Medical, Safe Zone, or Emergency Phone";

    }

  } catch (error) {

    console.error("Search error:", error);

    showToast("Search failed. Please try again.");

  }

}


/* =========================================================
   UPDATE SIDEBAR WITH SEARCH RESULT
========================================================= */

function updateMapSidebarWithResult(location) {

  const title = document.getElementById("sidebarTitle");
  const locText = document.getElementById("sidebarLocation");
  const icon = document.getElementById("sidebarIcon");
  const distance = document.getElementById("sidebarDistance");
  const status = document.getElementById("sidebarStatus");

  if (title) title.textContent = location.name || "Location";
  if (locText) locText.textContent = location.location || "Campus location";

  /* Update icon based on type */

  const type = (location.type || "").toLowerCase();

  if (icon) {

    let iconClass = "blue";
    let iconName = "fa-location-dot";

    if (type.includes("security")) {
      iconClass = "blue";
      iconName = "fa-shield-halved";
    } else if (type.includes("medical")) {
      iconClass = "purple";
      iconName = "fa-plus";
    } else if (type.includes("safe")) {
      iconClass = "green";
      iconName = "fa-shield";
    } else if (type.includes("emergency")) {
      iconClass = "red";
      iconName = "fa-phone";
    }

    icon.className = `round-icon ${iconClass}`;
    icon.innerHTML = `<i class="fa-solid ${iconName}"></i>`;

  }

  if (distance) distance.textContent = "Near campus";
  if (status) status.textContent = "Available 24/7";

  /* Store for route calculations */

  window.selectedMapLocation = location;

}


/* =========================================================
   CALCULATE SAFE ROUTE
========================================================= */

function calculateSafeRoute() {

  const selected = window.selectedMapLocation;

  if (!selected) {

    showToast("Please search for a location first");

    return;

  }

  /* Update route display */

  const routeEnd = document.getElementById("routeEnd");
  const routeNoteText = document.getElementById("routeNoteText");

  if (routeEnd) {
    routeEnd.textContent = selected.name || "Selected location";
  }

  if (routeNoteText) {

    const type = (selected.type || "").toLowerCase();

    let reason = "AI recommends this route based on campus safety data.";

    if (type.includes("security")) {
      reason = "Direct route to Campus Security with good lighting and visibility.";
    } else if (type.includes("medical")) {
      reason = "Fastest route to Medical Center with clear pathways.";
    } else if (type.includes("safe")) {
      reason = "Route avoids recent incidents and passes through well-patrolled areas.";
    }

    routeNoteText.textContent = reason;

  }

  showToast(`Safe route calculated to ${selected.name}`);

}


/* =========================================================
   GET MAP DIRECTIONS
========================================================= */

function getMapDirections() {

  const selected = window.selectedMapLocation;

  if (!selected) {

    showToast("Please search for a location to get directions");

    return;

  }

  showToast(`Opening directions to ${selected.name}`);

  /* In a real app, this would open a maps app or show turn-by-turn directions */

  console.log("Directions to:", selected);

}


/* =========================================================
   ALERT DETAIL MODAL FUNCTIONS
========================================================= */

function openAlertDetail(alert) {

  const modal = document.getElementById("alertDetailModal");
  const title = document.getElementById("alertDetailTitle");
  const icon = document.getElementById("alertDetailIcon");
  const type = document.getElementById("alertDetailType");
  const time = document.getElementById("alertDetailTime");
  const severity = document.getElementById("alertDetailSeverity");
  const description = document.getElementById("alertDetailDescription");
  const location = document.getElementById("alertDetailLocation");
  const locationText = document.getElementById("alertLocationText");

  if (!modal) return;

  /* Set title */
  if (title) {
    title.textContent = alert.title || alert.name || "Alert";
  }

  /* Set icon based on type */
  const typeStr = (alert.type || "CAMPUS").toLowerCase();
  let iconName = "fa-bullhorn";
  let iconColor = "blue";

  if (typeStr.includes("security") || typeStr.includes("danger")) {
    iconName = "fa-triangle-exclamation";
    iconColor = "red";
  } else if (typeStr.includes("weather") || typeStr.includes("rain")) {
    iconName = "fa-cloud-rain";
    iconColor = "orange";
  } else if (typeStr.includes("fire")) {
    iconName = "fa-fire";
    iconColor = "red";
  } else if (typeStr.includes("medical")) {
    iconName = "fa-heart-pulse";
    iconColor = "purple";
  } else if (typeStr.includes("campus")) {
    iconName = "fa-building";
    iconColor = "blue";
  } else if (typeStr.includes("announcement")) {
    iconName = "fa-bullhorn";
    iconColor = "purple";
  }

  if (icon) {
    icon.innerHTML = `<i class="fa-solid ${iconName}"></i>`;
    icon.className = `alert-detail-icon ${iconColor}`;
  }

  /* Set type */
  if (type) {
    type.textContent = `${alert.type || "CAMPUS"}`;
  }

  /* Set time */
  if (time) {
    const timeStr = alert.time || alert.created_at || alert.timestamp || "Recently";
    time.textContent = timeStr;
  }

  /* Set severity */
  if (severity) {
    const sev = alert.severity || "medium";
    const sevText = sev.charAt(0).toUpperCase() + sev.slice(1);
    severity.textContent = `Severity: ${sevText}`;
    severity.className = `alert-detail-severity ${sev.toLowerCase()}`;
  }

  /* Set description */
  if (description) {
    const desc = alert.description || alert.details || alert.message || "No additional details available.";
    description.textContent = desc;
  }

  /* Set location if available */
  if (alert.location) {
    location.style.display = "block";
    if (locationText) {
      locationText.textContent = alert.location;
    }
  } else {
    location.style.display = "none";
  }

  /* Show modal */
  modal.classList.add("open");

}


function closeAlertDetail() {

  const modal = document.getElementById("alertDetailModal");

  if (!modal) return;

  modal.classList.remove("open");

}


/* Handle clicking outside modal to close */

const alertModal = document.getElementById("alertDetailModal");

if (alertModal) {

  alertModal.addEventListener("click", function(event) {

    if (event.target === this) {

      closeAlertDetail();

    }

  });

}

/* =========================================================
   LOAD INCIDENT HISTORY
========================================================= */

async function loadIncidents() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/incidents`
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Incident History API:", data);

    const container =
      document.getElementById("incidentHistoryList");

    if (!container) {
      console.error(
        "incidentHistoryList element not found"
      );
      return;
    }

    let incidents = [];

    if (Array.isArray(data)) {

      incidents = data;

    } else if (
      data &&
      Array.isArray(data.incidents)
    ) {

      incidents = data.incidents;

    } else if (
      data &&
      Array.isArray(data.data)
    ) {

      incidents = data.data;

    } else if (
      data &&
      Array.isArray(data.results)
    ) {

      incidents = data.results;
    }

    console.log(
      "Incidents found:",
      incidents.length
    );

    container.innerHTML = "";

    if (incidents.length === 0) {

      container.innerHTML = `
        <div class="history-empty">

          <i class="fa-solid fa-folder-open"></i>

          <p>
            No previous incidents found.
          </p>

        </div>
      `;

      return;
    }

    incidents.forEach((incident) => {

      console.log(
        "DISPLAYING INCIDENT:",
        incident
      );

      const card =
        document.createElement("div");

      card.className =
        "incident-history-item";

      const category =
        incident.category ||
        incident.incident_category ||
        "Incident";

      const description =
        incident.description ||
        incident.details ||
        "No description available.";

      const location =
        incident.location ||
        incident.incident_location ||
        "Location not provided";

      const status =
        incident.status ||
        "Submitted";

      const createdAt =
        incident.created_at ||
        incident.timestamp ||
        incident.date ||
        "Recently";

      const reportId =
        incident.report_id ||
        incident.id ||
        "";

      card.innerHTML = `

        <div class="incident-history-icon">

          <i class="fa-solid fa-triangle-exclamation"></i>

        </div>

        <div class="incident-history-content">

          <div class="incident-history-top">

            <strong>
              ${category}
            </strong>

            <span class="incident-status">
              ${status}
            </span>

          </div>

          <p>
            ${description}
          </p>

          <div class="incident-history-meta">

            <span>
              <i class="fa-solid fa-location-dot"></i>
              ${location}
            </span>

            <span>
              <i class="fa-regular fa-clock"></i>
              ${createdAt}
            </span>

          </div>

          ${
            reportId
              ? `
                <small class="incident-report-id">
                  Report ID: ${reportId}
                </small>
              `
              : ""
          }

        </div>

      `;

      container.appendChild(card);

    });

    console.log(
      "Incident history displayed successfully."
    );

  } catch (error) {

    console.error(
      "Incident history error:",
      error
    );

    const container =
      document.getElementById(
        "incidentHistoryList"
      );

    if (container) {

      container.innerHTML = `
        <div class="history-empty error">

          <i class="fa-solid fa-circle-exclamation"></i>

          <p>
            Unable to load incident history.
          </p>

        </div>
      `;
    }

  }

}





/* =========================================================
   LOAD SOS HISTORY
========================================================= */
 async function loadSOSHistory() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/sos`
    );

    const data = await response.json();

    console.log("SOS History:", data);

    const container =
      document.getElementById("sosHistoryList");

    if (!container) {
      console.error("sosHistoryList element not found");
      return;
    }

    const sosEvents =
      Array.isArray(data)
        ? data
        : (data.sos_events || data.data || []);

    container.innerHTML = "";

    if (sosEvents.length === 0) {

      container.innerHTML = `
        <div class="history-empty">
          <i class="fa-solid fa-folder-open"></i>
          <p>No SOS activity yet.</p>
        </div>
      `;

      return;
    }

    sosEvents.forEach((sos) => {

      const card = document.createElement("div");

      card.className = "incident-history-item";

      card.innerHTML = `
        <div class="incident-history-icon">
          <i class="fa-solid fa-tower-broadcast"></i>
        </div>

        <div class="incident-history-content">

          <div class="incident-history-top">

            <strong>Emergency SOS</strong>

            <span class="incident-status">
              ${sos.status || "Submitted"}
            </span>

          </div>

          <p>
            Emergency SOS request was submitted.
          </p>

          <div class="incident-history-meta">

            <span>
              <i class="fa-solid fa-location-dot"></i>
              ${sos.location || "Location not provided"}
            </span>

            <span>
              <i class="fa-regular fa-clock"></i>
              ${sos.created_at || "Recently"}
            </span>

          </div>

          ${
            sos.id
              ? `
                <small class="incident-report-id">
                  SOS ID: ${sos.id}
                </small>
              `
              : ""
          }

        </div>
      `;

      container.appendChild(card);

    });

  } catch (error) {

    console.error("SOS history error:", error);

    const container =
      document.getElementById("sosHistoryList");

    if (container) {

      container.innerHTML = `
        <div class="history-empty error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <p>Unable to load SOS history.</p>
        </div>
      `;

    }

  }

}
/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Escape") {

      closeSOS();

      closeResourceModal();

      closeAlertDetail();

      closeMobileMenu();

    }

  }
);


/* =========================================================
   CLOSE SOS MODAL OUTSIDE
========================================================= */

const sosModal =
  document.getElementById(
    "sosModal"
  );


if (sosModal) {

  sosModal.addEventListener(
    "click",
    function(event) {

      if (
        event.target === this
      ) {

        closeSOS();

      }

    }
  );

}


/* =========================================================
   RESOURCE DETAIL MODAL
========================================================= */

const resourceData = {

  medical: {
    title: "Campus Medical Center",
    icon: "fa-heart-pulse",
    color: "purple",
    details: [
      { label: "Location", value: "Central Campus Medical Building" },
      { label: "Hours", value: "24/7 Emergency & Clinic Services" },
      { label: "Phone", value: "(555) 123-4567" },
      { label: "Services", value: "Urgent care, medical consultations, emergency support" }
    ],
    action: "Call Medical Services",
    callback: () => {
      showToast("Calling Medical Center (555) 123-4567");
      closeResourceModal();
    }
  },

  security: {
    title: "Campus Security",
    icon: "fa-shield-halved",
    color: "blue",
    details: [
      { label: "Location", value: "North Administration Building" },
      { label: "Hours", value: "24/7 Response" },
      { label: "Phone", value: "(555) 987-6543" },
      { label: "Services", value: "Emergency response, campus patrol, safety escort" }
    ],
    action: "Call Security",
    callback: () => {
      showToast("Calling Campus Security (555) 987-6543");
      closeResourceModal();
    }
  },

  support: {
    title: "Student Support Services",
    icon: "fa-users",
    color: "green",
    details: [
      { label: "Location", value: "Student Services Building, Room 205" },
      { label: "Hours", value: "Monday - Friday, 9:00 AM - 5:00 PM" },
      { label: "Phone", value: "(555) 234-5678" },
      { label: "Services", value: "Academic support, student resources, peer mentoring" }
    ],
    action: "Contact Support",
    callback: () => {
      showToast("Opening student support contact form");
      closeResourceModal();
    }
  },

  mental: {
    title: "Counseling & Wellness",
    icon: "fa-life-ring",
    color: "purple",
    details: [
      { label: "Location", value: "Wellness Center, Building D" },
      { label: "Hours", value: "Mon-Fri 9:00 AM - 5:00 PM, Emergency 24/7" },
      { label: "Phone", value: "(555) 456-7890" },
      { label: "Services", value: "Individual counseling, crisis support, stress management" }
    ],
    action: "Schedule Appointment",
    callback: () => {
      showToast("Opening counseling services scheduler");
      closeResourceModal();
    }
  },

  bullying: {
    title: "Anti-Bullying & Harassment",
    icon: "fa-hand",
    color: "orange",
    details: [
      { label: "Report Type", value: "Confidential & Anonymous" },
      { label: "Available", value: "24/7 Online or in-person" },
      { label: "Phone", value: "(555) 345-6789 (Confidential Hotline)" },
      { label: "Support", value: "Incident reporting, investigation support, resolution" }
    ],
    action: "Report Incident",
    callback: () => {
      showToast("Opening confidential incident report form");
      showPage("report");
      closeResourceModal();
    }
  },

  contacts: {
    title: "Emergency Contacts",
    icon: "fa-phone",
    color: "red",
    details: [
      { label: "Campus Security", value: "(555) 987-6543" },
      { label: "Medical Center", value: "(555) 123-4567" },
      { label: "Mental Health Crisis", value: "(555) 456-7890" },
      { label: "Local Emergency", value: "911" }
    ],
    action: "View All Contacts",
    callback: () => {
      showToast("Opening emergency contacts");
      showPage("profile");
      closeResourceModal();
    }
  }

};


function openResourceDetail(resourceType) {

  const resource = resourceData[resourceType];

  if (!resource) {
    return;
  }

  const modal = document.getElementById("resourceModal");
  const title = document.getElementById("resourceTitle");
  const icon = document.getElementById("resourceIcon");
  const details = document.getElementById("resourceDetails");
  const actionBtn = document.getElementById("resourcePrimaryBtn");

  /* Set title */
  title.textContent = resource.title;

  /* Set icon */
  icon.innerHTML = `<i class="fa-solid ${resource.icon}"></i>`;
  icon.className = `resource-modal-icon ${resource.color}`;

  /* Set details */
  let detailsHTML = "";

  resource.details.forEach((detail) => {
    detailsHTML += `
      <div class="resource-detail-item">
        <strong>${detail.label}</strong>
        <p>${detail.value}</p>
      </div>
    `;
  });

  details.innerHTML = detailsHTML;

  /* Set action button */
  actionBtn.textContent = resource.action;
  actionBtn.onclick = resource.callback;

  /* Store callback for external access */
  window.currentResourceCallback = resource.callback;

  /* Show modal */
  modal.classList.add("open");

}


function closeResourceModal() {

  const modal = document.getElementById("resourceModal");

  if (!modal) return;

  modal.classList.remove("open");

}


function performResourceAction() {

  if (window.currentResourceCallback) {
    window.currentResourceCallback();
  }

}


/* =========================================================
   TRUSTED CONTACTS MANAGEMENT
========================================================= */

function openAddContactModal() {

  const modal = document.getElementById("addContactModal");

  if (!modal) return;

  modal.classList.add("open");

  // Reset form
  document.getElementById("contactName").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("contactType").value = "";
  document.getElementById("contactName").focus();

}


function closeAddContactModal() {

  const modal = document.getElementById("addContactModal");

  if (!modal) return;

  modal.classList.remove("open");

}


function handleAddContact(event) {

  event.preventDefault();

  const name = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const type = document.getElementById("contactType").value.trim();

  // Validate inputs
  if (!name) {
    showToast("Name cannot be empty", "error");
    return;
  }

  if (!phone) {
    showToast("Phone number cannot be empty", "error");
    return;
  }

  // Basic phone validation (at least 7 characters of digits)
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 7) {
    showToast("Please enter a valid phone number", "error");
    return;
  }

  if (!type) {
    showToast("Please select a relationship", "error");
    return;
  }

  // Determine avatar color based on type
  const colorMap = {
    "Family": "purple",
    "Friend": "green",
    "Roommate": "blue",
    "Mentor": "purple",
    "Advisor": "blue",
    "Other": "green"
  };

  const avatarColor = colorMap[type] || "green";

  // Create contact element
  const contactList = document.querySelector(".contact-list");

  if (!contactList) {
    showToast("Error: Contact list not found", "error");
    return;
  }

  const contactDiv = document.createElement("div");
  contactDiv.className = "contact";

  const avatarDiv = document.createElement("div");
  avatarDiv.className = `contact-avatar ${avatarColor}`;
  avatarDiv.innerHTML = '<i class="fa-solid fa-user"></i>';

  const infoDiv = document.createElement("div");
  const nameStrong = document.createElement("strong");
  nameStrong.textContent = name;
  const typeSmall = document.createElement("small");
  typeSmall.textContent = "Trusted contact";

  infoDiv.appendChild(nameStrong);
  infoDiv.appendChild(typeSmall);

  const buttonDiv = document.createElement("button");
  buttonDiv.type = "button";
  buttonDiv.innerHTML = '<i class="fa-solid fa-phone"></i>';
  buttonDiv.onclick = function() {
    showToast(`Calling ${name}`);
  };

  contactDiv.appendChild(avatarDiv);
  contactDiv.appendChild(infoDiv);
  contactDiv.appendChild(buttonDiv);

  // Add to list (insert before the "Add contact" button)
  const addButton = document.querySelector(".add-contact");
  if (addButton && addButton.parentNode) {
    addButton.parentNode.insertBefore(contactDiv, addButton);
  } else {
    contactList.appendChild(contactDiv);
  }

  // Close modal and show success
  closeAddContactModal();
  showToast(`${name} added successfully`);

}


/* =========================================================
   SAFETY PULSE
========================================================= */

function updateSafetyPulse() {

  const score =
    document.querySelector(
      ".score-header strong"
    );


  if (!score) return;


  /*
    Use backend safety score
    instead of fake random values.
  */

  loadSafetyScore();

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    showPage("home");


    /* Backend connection test */

    checkBackend();


    /* Load backend data */

    loadSafetyScore(); 
    loadSafetyScore();
console.log(">>> CALLING SAFETY MAP <<<");
loadSafetyMap();
 loadSafetyMap();

    loadAlerts();

    
    loadIncidents();

    loadSOSHistory();


    /* Refresh safety score */

    setInterval(
      updateSafetyPulse,
      8000
    );

  }
);

// Safety Map test
const safetyMapPage = document.getElementById("map");

if (safetyMapPage) {
    console.log("Safety Map: Object", {
        page: "map",
        status: "loaded",
        elements: safetyMapPage.querySelectorAll("*").length
    });
} else {
    console.error("Safety Map: map section not found");
}console.log("TEST - SCRIPT JS LOADED");