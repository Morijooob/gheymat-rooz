export async function onRequestGet(){
  return new Response(JSON.stringify({items:[],updatedAt:null}),{headers:{'content-type':'application/json; charset=utf-8'}});
}
