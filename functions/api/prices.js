export async function onRequestGet(context) {
  const url = new URL('/data/prices.json', context.request.url);
  const response = await context.env.ASSETS.fetch(url);

  if (!response.ok) {
    return new Response(JSON.stringify({
      items: [],
      stores: [],
      updatedAt: null,
      status: 'unavailable'
    }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
