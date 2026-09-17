export async function onRequestGet({ env }) {

    const result = await env.WOOOK.list({
        prefix: "photos/"
    });

    return Response.json({
        count: result.objects.length
    });

}