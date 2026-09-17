const TYPES={
  jpg:"image/jpeg",
  jpeg:"image/jpeg",
  png:"image/png",
  webp:"image/webp",
  avif:"image/avif"
};

export async function onRequestGet({env,params}){

  const path=params.path.join("/");

  const key=`photos/${path}`;

  const object=await env.WOOOK.get(key);

  if(!object){

    return new Response(
      "Not Found",
      {status:404}
    );

  }

  const ext=path
      .split(".")
      .pop()
      .toLowerCase();

  return new Response(
    object.body,
    {
      headers:{
        "content-type":TYPES[ext],
        "cache-control":"public,max-age=31536000,immutable",
        "etag":object.httpEtag
      }
    }
  );

}
