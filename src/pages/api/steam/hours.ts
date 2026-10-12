import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const steamId = url.searchParams.get('steamId');

  if (!steamId) {
    return new Response(JSON.stringify({ error: 'Steam ID requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Usamos la API pública/oficial de Steam para obtener juegos y tiempo de juego
    const steamApiKey = import.meta.env.STEAM_API_KEY || ''; // Si tienes API Key, o usamos el endpoint público
    
    // Endpoint de Steam GetOwnedGames
    const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json&include_appinfo=true`;
    
    const res = await fetch(steamUrl);
    
    if (!res.ok) {
      throw new Error('No se pudo conectar con Steam');
    }

    const data = await res.json();
    const games = data.response?.games || [];

    // Mapeamos appid -> horas jugadas (Steam devuelve minutos en playtime_forever)
    const hoursMap: Record<number, number> = {};
    games.forEach((g: any) => {
      hoursMap[g.appid] = parseFloat((g.playtime_forever / 60).toFixed(1));
    });

    return new Response(JSON.stringify({ success: true, hoursMap }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};