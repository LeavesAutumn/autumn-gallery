const TYPES = {

  jpg:
    "image/jpeg",

  jpeg:
    "image/jpeg",

  png:
    "image/png",

  webp:
    "image/webp",

  avif:
    "image/avif"

};


export async function onRequestGet({
  env,
  params
}) {

  const parts =
    params.path;


  if (
    !Array.isArray(parts) ||
    parts.length === 0
  ) {

    return new Response(
      "Not Found",
      {
        status: 404
      }
    );

  }


  if (
    parts.some(
      part =>
        part === ".." ||
        part === "." ||
        part.includes("\\") ||
        part.includes("%")
    )
  ) {

    return new Response(
      "Forbidden",
      {
        status: 403
      }
    );

  }


  const path =
    parts.join("/");


  const filename =
    parts[parts.length - 1] || "";


  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase() || "";


  const contentType =
    TYPES[extension];


  if (!contentType) {

    return new Response(
      "Unsupported image",
      {
        status: 415
      }
    );

  }


  const key =
    `photos/${path}`;


  const object =
    await env.WOOOK.get(key);


  if (!object) {

    return new Response(
      "Not Found",
      {
        status: 404
      }
    );

  }


  return new Response(
    object.body,
    {
      headers: {

        "content-type":
          contentType,

        "cache-control":
          "public, max-age=86400, immutable",

        "etag":
          object.httpEtag,

        "x-content-type-options":
          "nosniff",

        "content-disposition":
          "inline"

      }
    }
  );

}
