export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const steamId = url.searchParams.get('steamId')?.trim();
  const apiKey = import.meta.env.STEAM_API_KEY || process.env.STEAM_API_KEY;

  if (!steamId) {
    return new Response(
      JSON.stringify({ error: 'Steam ID requerido' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'STEAM_API_KEY no está configurada' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${encodeURIComponent(steamId)}&format=json&include_appinfo=true`;
    
    const res = await fetch(steamUrl);
    
    if (!res.ok) {
      throw new Error('No se pudo conectar con Steam o el perfil es privado');
    }

    const data = await res.json();
    const games = data.response?.games || [];

    const hoursMap: Record<number, number> = {};
    games.forEach((g: any) => {
      hoursMap[g.appid] = parseFloat((g.playtime_forever / 60).toFixed(1));
    });

    return new Response(
      JSON.stringify({ success: true, hoursMap }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};