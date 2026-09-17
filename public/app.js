const gallery=document.getElementById("gallery");
const albums=document.getElementById("albums");
const loading=document.getElementById("loading");
const lightbox=document.getElementById("lightbox");
const lightboxImage=document.getElementById("lightbox-image");

let photos=[];
let currentIndex=0;

function columns(){
  if(innerWidth<=700)return 2;
  if(innerWidth<=1100)return 3;
  return 4;
}

async function loadPhotos(album=""){

  loading.classList.remove("hidden");

  const query=album?`?album=${encodeURIComponent(album)}`:"";

  const data=await fetch(`/api/photos${query}`)
      .then(r=>r.json());

  photos=data.photos||[];

  render();

  loading.classList.add("hidden");

}

function render(){

  gallery.innerHTML="";

  const cols=[];
  const heights=[];

  for(let i=0;i<columns();i++){

    const c=document.createElement("div");

    c.className="gallery-column";

    gallery.appendChild(c);

    cols.push(c);

    heights.push(0);

  }

  photos.forEach((photo,index)=>{

    let target=0;

    for(let i=1;i<heights.length;i++)
      if(heights[i]<heights[target])
        target=i;

    const link=document.createElement("a");

    link.className="photo";

    link.href=photo.full;

    const img=document.createElement("img");

    img.loading="lazy";

    img.decoding="async";

    img.src=photo.thumbnail;

    img.alt=photo.name;

    img.onload=()=>link.classList.add("loaded");

    link.appendChild(img);

    link.onclick=e=>{
      e.preventDefault();
      open(index);
    };

    cols[target].appendChild(link);

    heights[target]+=1;

  });

}

async function loadAlbums(){

  const data=await fetch("/api/albums")
      .then(r=>r.json());

  albums.innerHTML="";

  data.albums.forEach(album=>{

    const btn=document.createElement("button");

    btn.className="album";

    btn.textContent=album;

    btn.onclick=()=>{

      document.querySelectorAll(".album")
        .forEach(b=>b.classList.remove("active"));

      btn.classList.add("active");

      loadPhotos(album);

    };

    albums.appendChild(btn);

  });

}

function open(index){

  currentIndex=index;

  update();

  lightbox.classList.add("open");

  document.body.style.overflow="hidden";

}

function close(){

  lightbox.classList.remove("open");

  document.body.style.overflow="";

}

function update(){

  const photo=photos[currentIndex];

  lightboxImage.src=photo.full;

}

function next(){

  currentIndex=(currentIndex+1)%photos.length;

  update();

}

function prev(){

  currentIndex=(currentIndex-1+photos.length)%photos.length;

  update();

}

document.getElementById("close").onclick=close;
document.getElementById("next").onclick=next;
document.getElementById("previous").onclick=prev;

lightbox.onclick=e=>{
  if(e.target===lightbox)close();
};

document.addEventListener("keydown",e=>{

  if(!lightbox.classList.contains("open"))
    return;

  if(e.key==="Escape")close();
  if(e.key==="ArrowRight")next();
  if(e.key==="ArrowLeft")prev();

});

addEventListener("resize",render);

loadAlbums();
loadPhotos();
