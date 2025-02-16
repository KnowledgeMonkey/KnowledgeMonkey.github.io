// -------------------------
// Shared Variables & Arrays
// -------------------------
const sfwCategories = [
    "waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry",
    "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet",
    "blush", "smile", "wave", "highfive", "handhold", "nom", "bite",
    "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"
  ];
  // NSFW categories (without "trap")
  const nsfwCategories = ["waifu", "neko", "blowjob"];
  
  let currentMode = "sfw"; // For homepage side images
  
  // -------------------------
  // Modal Functions (shared)
  // -------------------------
  function openModal(imageUrl) {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-image");
    const downloadBtn = document.getElementById("download-button");
    if (modal && modalImg && downloadBtn) {
      modal.style.display = "flex";
      modalImg.src = imageUrl;
      downloadBtn.href = imageUrl;
    }
  }
  
  function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) {
      modal.style.display = "none";
    }
  }
  
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // -------------------------
  // Gallery Page Functions
  // -------------------------
  async function fetchAndAppendImages(count) {
    const urlParams = new URLSearchParams(window.location.search);
    const galleryType = urlParams.get('type') || "sfw";
    const galleryContainer = document.getElementById("gallery");
    const titleEl = document.getElementById("gallery-title");
    if (titleEl) {
      titleEl.textContent = galleryType.toUpperCase() + " Gallery";
    }
    const categories = galleryType === "nsfw" ? nsfwCategories : sfwCategories;
    
    let promises = [];
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const apiUrl = `https://api.waifu.pics/${galleryType}/${category}`;
      promises.push(
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => data.url)
          .catch(err => {
            console.error("Error fetching gallery image:", err);
            return null;
          })
      );
    }
    const images = await Promise.all(promises);
    images.forEach(url => {
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Gallery image";
        img.className = "gallery-image";
        img.addEventListener("click", () => openModal(url));
        galleryContainer.appendChild(img);
      }
    });
  }
  
  function goBack() {
    window.location.href = "index.html";
  }
  
  // Initialize gallery on page load
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("gallery")) {
      // Load initial batch of images (e.g., 20 images)
      fetchAndAppendImages(20);
      // Add event listener for the Load More button
      const loadMoreBtn = document.getElementById("load-more-button");
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
          fetchAndAppendImages(20);
        });
      }
    }
  
    // Homepage side images
    if (document.getElementById("left-images")) {
      loadSideImages();
      const toggleButton = document.getElementById("toggle-button");
      if (toggleButton) {
        toggleButton.addEventListener("click", toggleMode);
      }
    }
  });
  
  // -------------------------
  // Homepage Functions
  // -------------------------
  async function loadSideImages() {
    const leftContainer = document.getElementById("left-images");
    const rightContainer = document.getElementById("right-images");
    if (leftContainer) leftContainer.innerHTML = "";
    if (rightContainer) rightContainer.innerHTML = "";
    const imageCountPerColumn = 4;
    const containers = [];
    if (leftContainer) containers.push(leftContainer);
    if (rightContainer) containers.push(rightContainer);
    for (const container of containers) {
      for (let i = 0; i < imageCountPerColumn; i++) {
        let category;
        if (currentMode === "sfw") {
          category = sfwCategories[Math.floor(Math.random() * sfwCategories.length)];
        } else {
          category = nsfwCategories[Math.floor(Math.random() * nsfwCategories.length)];
        }
        const apiUrl = `https://api.waifu.pics/${currentMode}/${category}`;
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          const imgUrl = data.url;
          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = "Kawaii image";
          img.className = "side-image";
          img.addEventListener("click", () => openModal(imgUrl));
          container.appendChild(img);
        } catch (err) {
          console.error("Error fetching side image:", err);
        }
      }
    }
  }
  
  function toggleMode() {
    currentMode = currentMode === "sfw" ? "nsfw" : "sfw";
    const toggleButton = document.getElementById("toggle-button");
    if (toggleButton) {
      toggleButton.textContent = currentMode === "sfw" ? "Toggle NSFW Images" : "Toggle SFW Images";
    }
    loadSideImages();
  }
  