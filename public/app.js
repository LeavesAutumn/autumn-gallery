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
   Gallery / Masonry
----------------------------- */

function getColumnCount() {

  const width =
    window.innerWidth;

  if (width <= 480) {
    return 1;
  }

  if (width <= 700) {
    return 2;
  }

  if (width <= 1100) {
    return 3;
  }

  return 4;

}


function renderGallery() {

  gallery.innerHTML = "";

  if (!photos.length) {
    return;
  }


  const columnCount =
    getColumnCount();


  const columns = [];


  /*
     Create columns
  */

  for (
    let i = 0;
    i < columnCount;
    i++
  ) {

    const column =
      document.createElement("div");

    column.className =
      "gallery-column";

    gallery.appendChild(
      column
    );


    columns.push({
      element: column,
      height: 0
    });

  }


  /*
     Add photos
  */

  photos.forEach(
    (photo, index) => {

      const link =
        document.createElement("a");

      link.className =
        "photo";

      link.href =
        photo.url;


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


      link.appendChild(
        image
      );


      /*
         Open Lightbox
      */

      link.addEventListener(
        "click",
        event => {

          event.preventDefault();

          openLightbox(index);

        }
      );


      /*
         When image is loaded,
         reveal it and recalculate
         column heights.
      */

      image.addEventListener(
        "load",
        () => {

          link.classList.add(
            "loaded"
          );

          updateColumnHeights(
            columns
          );

        },
        { once: true }
      );


      /*
         Put the image into
         the shortest column.
      */

      const target =
        columns.reduce(
          (shortest, column) =>
            column.height <
            shortest.height
              ? column
              : shortest
        );


      target.element.appendChild(
        link
      );


      /*
         Use real dimensions when
         image is already cached.
      */

      if (
        image.complete &&
        image.naturalWidth
      ) {

        updateColumnHeights(
          columns
        );

      } else {

        /*
           Temporary estimate.

           The real height will be
           calculated after loading.
        */

        target.height += 1;

      }

    }
  );


  requestAnimationFrame(
    () => {

      updateColumnHeights(
        columns
      );

    }
  );

}


/* -----------------------------
   Masonry Height Calculation
----------------------------- */

function updateColumnHeights(
  columns
) {

  columns.forEach(
    column => {

      let height = 0;


      const items =
        column.element.children;


      for (
        const item of items
      ) {

        const image =
          item.querySelector("img");


        if (
          !image ||
          !image.naturalWidth
        ) {
          continue;
        }


        const width =
          item.clientWidth;


        const imageHeight =
          width *
          (
            image.naturalHeight /
            image.naturalWidth
          );


        height +=
          imageHeight;

        height +=
          parseFloat(
            getComputedStyle(
              column.element
            ).gap
          ) || 0;

      }


      column.height =
        height;

    }
  );

}


/* -----------------------------
   Responsive Rebuild
----------------------------- */

let resizeTimer;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        () => {

          renderGallery();

        },
        200
      );

  }
);


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


    /*
       Do not create ALL.

       Only show actual albums.
    */

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


  albums.appendChild(
    button
  );

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
