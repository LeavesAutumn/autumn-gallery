export async function onRequestGet({ env }) {

  const albums =
    new Set();

  let cursor;

  do {

    const result =
      await env.WOOOK.list({
        prefix: "photos/",
        delimiter: "/",
        limit: 1000,
        ...(cursor ? { cursor } : {})
      });

    for (
      const prefix
      of result.delimitedPrefixes || []
    ) {

      const name =
        prefix
          .slice("photos/".length)
          .replace(/\/$/, "");

      if (name) {
        albums.add(name);
      }

    }

    cursor =
      result.truncated
        ? result.cursor
        : undefined;

  } while (cursor);

  return new Response(
    JSON.stringify({
      albums:
        [...albums].sort()
    }),
    {
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