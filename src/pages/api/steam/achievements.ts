export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const appIdRaw = url.searchParams.get('appId')?.trim();
  const steamIdRaw = url.searchParams.get('steamId')?.trim();

  // Validaciones estrictas numéricas
  if (!appIdRaw || !/^\d+$/.test(appIdRaw)) {
    return new Response(
      JSON.stringify({ error: 'AppID inválido o requerido' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const appId = parseInt(appIdRaw, 10);
  const steamId = (steamIdRaw && /^\d{17}$/.test(steamIdRaw)) ? steamIdRaw : null;

  const STEAM_API_KEY = import.meta.env.STEAM_API_KEY || process.env.STEAM_API_KEY;

  if (!STEAM_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Falta configurar STEAM_API_KEY en las variables de entorno (.env)' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. Obtener el esquema oficial del juego
    const schemaRes = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appId}&l=spanish`
    );
    const schemaData = await schemaRes.json();
    const schemaAchievements = schemaData?.gameparams?.availableGameStats?.achievements || [];

    // 2. Si se proporciona un SteamID válido de 17 dígitos, consultar el progreso
    if (steamId) {
      const userAchievementsRes = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}&l=spanish`
      );
      const userData = await userAchievementsRes.json();

      if (userData?.playerstats?.achievements) {
        const mergedAchievements = userData.playerstats.achievements.map((ach: any) => {
          const schema = schemaAchievements.find((s: any) => s.name === ach.apiname) || {};

          return {
            id: ach.apiname,
            title: schema.displayName || ach.apiname.replace(/_/g, ' '),
            description: schema.description || 'Logro desbloqueable del juego.',
            icon: ach.achieved === 1 
              ? (schema.icon || '/placeholder.svg') 
              : (schema.icongray || schema.icon || '/placeholder.svg'),
            unlocked: ach.achieved === 1,
            unlock_time: ach.unlocktime ? new Date(ach.unlocktime * 1000).toISOString() : null
          };
        });

        return new Response(
          JSON.stringify({ achievements: mergedAchievements }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. Fallback a lista base de logros
    const formattedList = schemaAchievements.map((a: any) => ({
      id: a.name,
      title: a.displayName || a.name.replace(/_/g, ' '),
      description: a.description || 'Logro desbloqueable del juego.',
      icon: a.icongray || a.icon || '/placeholder.svg',
      unlocked: false
    }));

    return new Response(
      JSON.stringify({ achievements: formattedList }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Error al obtener logros de Steam:', err);
    return new Response(
      JSON.stringify({ error: err.message, achievements: [] }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};