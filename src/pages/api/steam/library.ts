export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  let steamId = url.searchParams.get('steamId')?.trim();
  const apiKey = import.meta.env.STEAM_API_KEY || process.env.STEAM_API_KEY;

  if (!steamId) {
    return new Response(
      JSON.stringify({ error: 'Se requiere un SteamID o Custom URL' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'STEAM_API_KEY no está configurada en las variables de entorno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. Resolver Custom URL
    if (!/^\d{17}$/.test(steamId)) {
      const vanityRes = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodeURIComponent(steamId)}`
      );
      const vanityData = await vanityRes.json();

      if (vanityData.response && vanityData.response.success === 1) {
        steamId = vanityData.response.steamid;
      } else {
        return new Response(
          JSON.stringify({ error: 'No se pudo encontrar el usuario de Steam especificado' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Consultar biblioteca
    const gamesRes = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
    );
    const gamesData = await gamesRes.json();

    if (!gamesData.response || !gamesData.response.games) {
      return new Response(
        JSON.stringify({ error: 'No se pudieron obtener los juegos. Verifica que los detalles de tus juegos en Steam estén configurados como PÚBLICOS.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Mapear portadas con URL Principal (HD) y URL de Resguardo (Icono)
    const formattedGames = gamesData.response.games.map((game: any) => {
      const headerUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
      const iconUrl = game.img_icon_url 
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
        : '/placeholder.jpg';

      return {
        app_id: game.appid,
        name: game.name,
        hours_played: parseFloat((game.playtime_forever / 60).toFixed(1)),
        cover_url: headerUrl,
        fallback_cover_url: iconUrl
      };
    });

    formattedGames.sort((a: any, b: any) => b.hours_played - a.hours_played);

    return new Response(
      JSON.stringify({
        total: gamesData.response.game_count,
        games: formattedGames
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error al conectar con la API de Steam: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};