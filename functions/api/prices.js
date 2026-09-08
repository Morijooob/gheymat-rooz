export async function onRequestGet(context) {
  const url = new URL('/data/prices.json', context.request.url);

  try {
    const response = context.env?.ASSETS?.fetch
      ? await context.env.ASSETS.fetch(url)
      : await fetch(url, { cf: { cacheTtl: 0, cacheEverything: false } });

    if (!response.ok) {
      return new Response(JSON.stringify({
        items: [],
        stores: [],
        updatedAt: null,
        status: 'unavailable'
      }), {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store'
        }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  } catch {
    return new Response(JSON.stringify({
      items: [],
      stores: [],
      updatedAt: null,
      status: 'unavailable'
    }), {
      status: 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }
}
