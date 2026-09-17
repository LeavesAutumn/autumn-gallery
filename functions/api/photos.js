const ALLOWED = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif"
]);

function json(data,status=200){
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "content-type":"application/json;charset=utf-8",
        "cache-control":"public,max-age=60"
      }
    }
  );
}

export async function onRequestGet({request,env}){

  const url=new URL(request.url);

  const album=url.searchParams.get("album")||"";

  const prefix=album
      ?`photos/${album}/`
      :"photos/";

  const photos=[];

  let cursor;

  do{

    const result=await env.WOOOK.list({
      prefix,
      limit:1000,
      ...(cursor?{cursor}:{})
    });

    for(const object of result.objects){

      const key=object.key;

      const name=key.split("/").pop();

      const ext=name.split(".").pop().toLowerCase();

      if(!ALLOWED.has(ext))continue;

      photos.push({

        key,

        name,

        size:object.size,

        uploaded:object.uploaded,

        thumbnail:`/img/thumb/${key.slice(7).replace(/\.[^.]+$/,".webp")}`,

        full:`/img/${key.slice(7)}`

      });

    }

    cursor=result.truncated?result.cursor:undefined;

  }while(cursor);

  photos.sort(
    (a,b)=>
      new Date(b.uploaded)-new Date(a.uploaded)
  );

  return json({
    album,
    photos
  });

}
