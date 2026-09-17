export async function onRequestGet({env}){

  const albums=new Set();

  let cursor;

  do{

    const result=await env.WOOOK.list({

      prefix:"photos/",

      delimiter:"/",

      limit:1000,

      ...(cursor?{cursor}:{})

    });

    for(const prefix of result.delimitedPrefixes||[]){

      const name=prefix
        .slice(7)
        .replace(/\/$/,"");

      if(name)albums.add(name);

    }

    cursor=result.truncated?result.cursor:undefined;

  }while(cursor);

  return Response.json({
    albums:[...albums].sort()
  });

}
