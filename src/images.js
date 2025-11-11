let lightboxEl, lightboxImg;

export const fileToDataURL = (file) =>
    new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });

export function addThumb(container, url, onRemove, onOpen) {
    const div = document.createElement("div");
    div.className = "thumb";
    div.innerHTML = `
    <img src="${url}" alt="attachment">
    <button class="thumb-del">×</button>
  `;
    const del = div.querySelector(".thumb-del");
    del.onclick = (e) => {
        e.stopPropagation();
        div.remove();
        onRemove && onRemove(url);
    };
    if (onOpen) div.onclick = () => onOpen(url);
    container.appendChild(div);
}

function ensureLightbox() {
    if (lightboxEl) return;
    lightboxEl = document.createElement("div");
    lightboxEl.className = "lightbox hidden";
    lightboxEl.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <img class="lightbox__img" alt="image">
    <button class="lightbox__close">×</button>
  `;
    document.body.appendChild(lightboxEl);
    lightboxImg = lightboxEl.querySelector(".lightbox__img");

    const close = () => lightboxEl.classList.add("hidden");
    lightboxEl.addEventListener("click", (e) => {
        if (e.target.matches(".lightbox__backdrop, .lightbox__close")) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

export function openLightbox(url) {
    ensureLightbox();
    lightboxImg.src = url;
    lightboxEl.classList.remove("hidden");
}