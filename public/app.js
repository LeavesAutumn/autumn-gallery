const gallery=document.getElementById("gallery");
const albums=document.getElementById("albums");
const loading=document.getElementById("loading");
const lightbox=document.getElementById("lightbox");
const lightboxImage=document.getElementById("lightbox-image");

const closeButton=document.getElementById("close");
const previousButton=document.getElementById("previous");
const nextButton=document.getElementById("next");

let photos=[];
let currentIndex=0;

/* -----------------------------
   Photos
----------------------------- */

async function loadPhotos(album=""){

  loading.classList.remove("hidden");

  try{

    const query=album
      ?`?album=${encodeURIComponent(album)}`
      :"";

    const response=await fetch(`/api/photos${query}`);

    const data=await response.json();

    photos=data.photos||[];

    renderGallery();

  }catch(error){

    console.error(error);

  }finally{

    loading.classList.add("hidden");

  }

}

/* -----------------------------
   Gallery
----------------------------- */

function renderGallery(){

  gallery.innerHTML="";

  photos.forEach((photo,index)=>{

    const link=document.createElement("a");

    link.className="photo";

    link.href=photo.full;

    const image=document.createElement("img");

    image.src=photo.thumbnail;
    image.alt=photo.name||"";
    image.loading="lazy";
    image.decoding="async";

    image.addEventListener("load",()=>{

      /* 用真实尺寸替换默认 3:2 */
      image.width=image.naturalWidth;
      image.height=image.naturalHeight;

      image.style.aspectRatio=
        `${image.naturalWidth}/${image.naturalHeight}`;

      link.classList.add("loaded");

    },{once:true});

    link.appendChild(image);

    link.addEventListener("click",event=>{

      event.preventDefault();

      openLightbox(index);

    });

    gallery.appendChild(link);

  });

}

/* -----------------------------
   Albums
----------------------------- */

async function loadAlbums(){

  try{

    const response=await fetch("/api/albums");

    const data=await response.json();

    albums.innerHTML="";

    (data.albums||[]).forEach(album=>{

      const button=document.createElement("button");

      button.className="album";

      button.textContent=album;

      button.onclick=()=>{

        document.querySelectorAll(".album")
          .forEach(b=>b.classList.remove("active"));

        button.classList.add("active");

        loadPhotos(album);

      };

      albums.appendChild(button);

    });

  }catch(error){

    console.error(error);

  }

}

/* -----------------------------
   Lightbox
----------------------------- */

function openLightbox(index){

  currentIndex=index;

  updateLightbox();

  lightbox.classList.add("open");

  document.body.style.overflow="hidden";

}

function closeLightbox(){

  lightbox.classList.remove("open");

  document.body.style.overflow="";

}

function updateLightbox(){

  const photo=photos[currentIndex];

  lightboxImage.src=photo.full;

  /* 预加载相邻两张原图 */

  preload(currentIndex+1);

  preload(currentIndex-1);

}

function preload(index){

  if(!photos.length)return;

  const i=(index+photos.length)%photos.length;

  new Image().src=photos[i].full;

}

function nextPhoto(){

  currentIndex=(currentIndex+1)%photos.length;

  updateLightbox();

}

function previousPhoto(){

  currentIndex=(currentIndex-1+photos.length)%photos.length;

  updateLightbox();

}

/* -----------------------------
   Events
----------------------------- */

closeButton.onclick=closeLightbox;
nextButton.onclick=nextPhoto;
previousButton.onclick=previousPhoto;

lightbox.onclick=e=>{
  if(e.target===lightbox)
    closeLightbox();
};

document.addEventListener("keydown",e=>{

  if(!lightbox.classList.contains("open"))
    return;

  if(e.key==="Escape")closeLightbox();
  if(e.key==="ArrowRight")nextPhoto();
  if(e.key==="ArrowLeft")previousPhoto();

});

/* -----------------------------
   Start
----------------------------- */

loadAlbums();
loadPhotos();
