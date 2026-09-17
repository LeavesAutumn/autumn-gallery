export async function onRequestGet({env,params}){

  const path=params.path.join("/");

  const object=
    await env.WOOOK.get(`thumbs/${path}`);

  if(!object){

    return new Response(
      "Not Found",
      {status:404}
    );

  }

  return new Response(
    object.body,
    {
      headers:{
        "content-type":"image/webp",
        "cache-control":"public,max-age=31536000,immutable",
        "etag":object.httpEtag
      }
    }
  );

}