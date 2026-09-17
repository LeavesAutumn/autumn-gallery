const ALLOWED =
  new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "avif"
  ]);


function json(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "content-type":
          "application/json; charset=utf-8",

        "cache-control":
          "public, max-age=60",

        "x-content-type-options":
          "nosniff"
      }
    }
  );

}


export async function onRequestGet({
  request,
  env
}) {

  const url =
    new URL(request.url);

  const album =
    url.searchParams.get(
      "album"
    ) || "";

  if (
    album.includes("..") ||
    album.includes("\\") ||
    album.startsWith("/")
  ) {

    return json(
      {
        error:
          "Invalid album"
      },
      400
    );

  }

  const prefix =
    album
      ? `photos/${album}/`
      : "photos/";


  const photos = [];

  let cursor;


  do {

    const result =
      await env.WOOOK.list({
        prefix,
        limit: 1000,

        ...(cursor
          ? { cursor }
          : {})
      });


    for (
      const object
      of result.objects
    ) {

      const key =
        object.key;

      if (
        !key.startsWith(
          "photos/"
        )
      ) {
        continue;
      }


      const name =
        key.split("/").pop() ||
        "";

      const extension =
        name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "";


      if (
        !ALLOWED.has(
          extension
        )
      ) {
        continue;
      }


      photos.push({

        key,

        name,

        size:
          object.size,

        uploaded:
          object.uploaded,

        url:
          `/img/${key.slice(
            "photos/".length
          )}`

      });

    }


    cursor =
      result.truncated
        ? result.cursor
        : undefined;


  } while (cursor);


  photos.sort(
    (a, b) =>
      new Date(
        b.uploaded
      ) -
      new Date(
        a.uploaded
      )
  );


  return json({
    album,
    photos
  });

}