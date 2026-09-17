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

let currentAlbum = "";


/* =============================
   Helpers
============================= */

function getColumnCount() {

  const width =
    window.innerWidth;


  if (width <= 700) {
    return 2;
  }


  if (width <= 1100) {
    return 3;
  }


  return 4;

}


/* =============================
   Photos
============================= */

async function loadPhotos(
  album = ""
) {

  loading.classList.remove(
    "hidden"
  );


  currentAlbum =
    album;


  try {

    const query =
      album
        ? `?album=${encodeURIComponent(album)}`
        : "";


    const response =
      await fetch(
        `/api/photos${query}`,
        {
          cache: "default"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    photos =
      Array.isArray(
        data.photos
      )
        ? data.photos
        : [];


    renderGallery();


  } catch (error) {

    console.error(error);

    gallery.innerHTML = "";


  } finally {

    loading.classList.add(
      "hidden"
    );

  }

}


/* =============================
   Gallery / Masonry
============================= */

function renderGallery() {

  gallery.innerHTML = "";


  const columnCount =
    getColumnCount();


  const columns = [];

  const heights = [];


  for (
    let i = 0;
    i < columnCount;
    i++
  ) {

    const column =
      document.createElement(
        "div"
      );


    column.className =
      "gallery-column";


    gallery.appendChild(
      column
    );


    columns.push(
      column
    );


    heights.push(0);

  }


  photos.forEach(
    (photo, index) => {

      let shortest =
        0;


      for (
        let i = 1;
        i < heights.length;
        i++
      ) {

        if (
          heights[i] <
          heights[shortest]
        ) {

          shortest =
            i;

        }

      }


      const link =
        createPhotoElement(
          photo,
          index
        );


      columns[shortest].appendChild(
        link
      );


      /*
       * R2 当前没有保存照片尺寸 metadata。
       * Masonry 初始阶段使用 3:2 比例估算。
       */

      const ratio =
        3 / 2;


      const columnWidth =
        gallery.clientWidth /
        columnCount;


      heights[shortest] +=
        columnWidth / ratio;

    }
  );

}


/* =============================
   Photo Element
============================= */

function createPhotoElement(
  photo,
  index
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "photo";


  link.href =
    photo.url;


  const image =
    document.createElement(
      "img"
    );


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
    {
      once: true
    }
  );


  image.addEventListener(
    "error",
    () => {

      link.classList.add(
        "error"
      );

    },
    {
      once: true
    }
  );


  link.appendChild(
    image
  );


  image.src =
    photo.url;


  link.addEventListener(
    "click",
    event => {

      event.preventDefault();

      openLightbox(
        index
      );

    }
  );


  return link;

}


/* =============================
   Albums
============================= */

async function loadAlbums() {

  try {

    const response =
      await fetch(
        "/api/albums",
        {
          cache: "default"
        }
      );


    if (!response.ok) {
      return;
    }


    const data =
      await response.json();


    albums.innerHTML = "";


    /*
     * 不再创建 ALL 按钮。
     *
     * 首页默认 loadPhotos("")
     * 本身就是显示全部照片。
     */

    for (
      const album
      of data.albums || []
    ) {

      createAlbum(
        album,
        album
      );

    }


  } catch (error) {

    console.error(error);

  }

}


function createAlbum(
  name,
  value
) {

  const button =
    document.createElement(
      "button"
    );


  button.className =
    "album";


  button.textContent =
    name;


  button.addEventListener(
    "click",
    () => {

      document
        .querySelectorAll(
          ".album"
        )
        .forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


      button.classList.add(
        "active"
      );


      loadPhotos(
        value
      );

    }
  );


  albums.appendChild(
    button
  );

}


/* =============================
   Lightbox
============================= */

function openLightbox(
  index
) {

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


  preloadPhoto(
    currentIndex + 1
  );

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


  preloadPhoto(
    currentIndex + 1
  );


  preloadPhoto(
    currentIndex - 1
  );

}


function preloadPhoto(
  index
) {

  if (!photos.length) {
    return;
  }


  const normalized =
    (
      index +
      photos.length
    ) %
    photos.length;


  const photo =
    photos[normalized];


  if (!photo) {
    return;
  }


  const image =
    new Image();


  image.decoding =
    "async";


  image.src =
    photo.url;

}


function nextPhoto() {

  if (!photos.length) {
    return;
  }


  currentIndex =
    (
      currentIndex +
      1
    ) %
    photos.length;


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
    ) %
    photos.length;


  updateLightbox();

}


/* =============================
   Events
============================= */

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


/* =============================
   Resize
============================= */

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
        150
      );

  }
);


/* =============================
   Start
============================= */

loadAlbums();
loadPhotos();
