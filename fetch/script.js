// Global variables to store the current selection and auto-refresh interval
let currentType = null;
let currentCategory = null;
let autoRefreshInterval = null;

// Log to confirm script is loaded
console.log("Script loaded successfully!");

// Toggle the settings panel
document.getElementById("settings-button").addEventListener("click", function () {
  console.log("Settings clicked!");
  document.getElementById("settings-panel").style.display = "block";
});

// Close the settings panel
document.getElementById("close-settings").addEventListener("click", function () {
  console.log("Settings closed!");
  document.getElementById("settings-panel").style.display = "none";
});

// Enable NSFW content (triggers age confirmation)
document.getElementById("enable-nsfw").addEventListener("click", function () {
  console.log("NSFW enabled!");
  document.getElementById("age-confirmation").style.display = "block";
  document.getElementById("settings-panel").style.display = "none";
});

// Age confirmation
document.getElementById("yes-button").addEventListener("click", function () {
  console.log("Age confirmed!");
  document.getElementById("age-confirmation").style.display = "none";
  document.getElementById("nsfw-buttons").style.display = "flex"; // Show NSFW buttons
});

document.getElementById("no-button").addEventListener("click", function () {
  console.log("Age not confirmed, redirecting...");
  window.location.href = "https://www.google.com"; // Redirect to Google if 'No' is clicked
});

// Function that performs the actual image fetch from the API
function doFetchImage(type, category) {
  console.log(`Fetching ${category} image for type: ${type}`);
  let url =
    category === "nsfw"
      ? `https://api.waifu.pics/nsfw/${type}`
      : `https://api.waifu.pics/sfw/${type}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.url) {
        document.getElementById("image").src = data.url;
      } else {
        console.error("No image found in response.");
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
    });
}

// Function to handle image button clicks
function fetchImage(type, category) {
  // Store the current selection globally
  currentType = type;
  currentCategory = category;
  // Immediately fetch the image
  doFetchImage(type, category);

  // If auto-refresh is enabled, clear any existing interval and start a new one
  if (document.getElementById("auto-refresh-toggle").checked) {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(function () {
      doFetchImage(currentType, currentCategory);
    }, 5000);
  } else {
    // If auto-refresh is not enabled, clear any running interval
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
}

// Listen for changes on the auto-refresh toggle checkbox
document
  .getElementById("auto-refresh-toggle")
  .addEventListener("change", function () {
    if (this.checked) {
      // If auto-refresh is toggled on and a selection exists, start auto-refresh
      if (currentType && currentCategory) {
        if (autoRefreshInterval) clearInterval(autoRefreshInterval);
        autoRefreshInterval = setInterval(function () {
          doFetchImage(currentType, currentCategory);
        }, 5000);
      }
    } else {
      // Clear the interval if auto-refresh is turned off
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
    }
  });
