const gallery =
  document.getElementById("gallery");

const albums =
  document.getElementById("albums");

const loading =
  document.getElementById("loading");

const lightbox =
  document.getElementById("lightbox");

const lightboxImage =
  document.getElementById("lightbox-image");

const closeButton =
  document.getElementById("close");

const previousButton =
  document.getElementById("previous");

const nextButton =
  document.getElementById("next");


let photos = [];

let currentIndex = 0;


/* -----------------------------
   Photos
----------------------------- */

async function loadPhotos(album = "") {

  loading.classList.remove("hidden");

  try {

    const query = album
      ? `?album=${encodeURIComponent(album)}`
      : "";

    const response =
      await fetch(`/api/photos${query}`);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    photos =
      Array.isArray(data.photos)
        ? data.photos
        : [];

    renderGallery();

  } catch (error) {

    console.error(error);

    gallery.innerHTML = "";

  } finally {

    loading.classList.add("hidden");

  }

}


/* -----------------------------
   Gallery
----------------------------- */

function renderGallery() {

  gallery.innerHTML = "";

  photos.forEach(
    (photo, index) => {

      const link =
        document.createElement("a");

      link.className = "photo";

      link.href = photo.url;

      const image =
        document.createElement("img");

      image.src =
        photo.url;

      image.alt =
        photo.name || "";

      image.loading =
        "lazy";

      image.decoding =
        "async";

      image.addEventListener(
        "load",
        () => {

          link.classList.add(
            "loaded"
          );

        },
        { once: true }
      );

      link.appendChild(image);

      link.addEventListener(
        "click",
        event => {

          event.preventDefault();

          openLightbox(index);

        }
      );

      gallery.appendChild(link);

    }
  );

}


/* -----------------------------
   Albums
----------------------------- */

async function loadAlbums() {

  try {

    const response =
      await fetch("/api/albums");

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    albums.innerHTML = "";

    createAlbum(
      "ALL",
      "",
      true
    );

    for (
      const album of data.albums || []
    ) {

      createAlbum(
        album,
        album,
        false
      );

    }

  } catch (error) {

    console.error(error);

  }

}


function createAlbum(
  name,
  value,
  active
) {

  const button =
    document.createElement("button");

  button.className =
    "album";

  button.textContent =
    name;

  if (active) {
    button.classList.add(
      "active"
    );
  }

  button.addEventListener(
    "click",
    () => {

      document
        .querySelectorAll(".album")
        .forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );

      button.classList.add(
        "active"
      );

      loadPhotos(value);

    }
  );

  albums.appendChild(button);

}


/* -----------------------------
   Lightbox
----------------------------- */

function openLightbox(index) {

  if (!photos.length) {
    return;
  }

  currentIndex =
    index;

  updateLightbox();

  lightbox.classList.add(
    "open"
  );

  lightbox.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";

}


function closeLightbox() {

  lightbox.classList.remove(
    "open"
  );

  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";

}


function updateLightbox() {

  const photo =
    photos[currentIndex];

  if (!photo) {
    return;
  }

  lightboxImage.src =
    photo.url;

  lightboxImage.alt =
    photo.name || "";

}


function nextPhoto() {

  if (!photos.length) {
    return;
  }

  currentIndex =
    (currentIndex + 1)
    % photos.length;

  updateLightbox();

}


function previousPhoto() {

  if (!photos.length) {
    return;
  }

  currentIndex =
    (
      currentIndex -
      1 +
      photos.length
    )
    % photos.length;

  updateLightbox();

}


/* -----------------------------
   Events
----------------------------- */

closeButton.addEventListener(
  "click",
  closeLightbox
);

nextButton.addEventListener(
  "click",
  nextPhoto
);

previousButton.addEventListener(
  "click",
  previousPhoto
);

lightbox.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      lightbox
    ) {

      closeLightbox();

    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (
      !lightbox.classList.contains(
        "open"
      )
    ) {
      return;
    }

    if (
      event.key ===
      "Escape"
    ) {

      closeLightbox();

    }

    if (
      event.key ===
      "ArrowRight"
    ) {

      nextPhoto();

    }

    if (
      event.key ===
      "ArrowLeft"
    ) {

      previousPhoto();

    }

  }
);


/* -----------------------------
   Start
----------------------------- */

loadAlbums();

loadPhotos();