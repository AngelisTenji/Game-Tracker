import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get('appId');
  const steamId = url.searchParams.get('steamId');

  if (!appId) {
    return new Response(JSON.stringify({ error: 'Falta el appId del juego' }), { status: 400 });
  }

  const STEAM_API_KEY = import.meta.env.STEAM_API_KEY || process.env.STEAM_API_KEY;

  if (!STEAM_API_KEY) {
    return new Response(JSON.stringify({ error: 'Falta configurar STEAM_API_KEY en las variables de entorno (.env)' }), { status: 500 });
  }

  try {
    // 1. Obtener el esquema oficial del juego (Nombres, Descripciones e Íconos en español)
    const schemaRes = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appId}&l=spanish`
    );
    const schemaData = await schemaRes.json();
    const schemaAchievements = schemaData?.gameparams?.availableGameStats?.achievements || [];

    // 2. Si se proporciona el SteamID del jugador, consultar su progreso desbloqueado
    if (steamId) {
      const userAchievementsRes = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}&l=spanish`
      );
      const userData = await userAchievementsRes.json();

      if (userData?.playerstats?.achievements) {
        const mergedAchievements = userData.playerstats.achievements.map((ach: any) => {
          // Buscar la información completa en el esquema oficial
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

        return new Response(JSON.stringify({ achievements: mergedAchievements }), { status: 200 });
      }
    }

    // 3. Fallback: Si no hay SteamID o el perfil no es público, devolver la lista base de logros
    const formattedList = schemaAchievements.map((a: any) => ({
      id: a.name,
      title: a.displayName || a.name.replace(/_/g, ' '),
      description: a.description || 'Logro desbloqueable del juego.',
      icon: a.icongray || a.icon || '/placeholder.svg',
      unlocked: false
    }));

    return new Response(JSON.stringify({ achievements: formattedList }), { status: 200 });

  } catch (err: any) {
    console.error('Error al obtener logros de Steam:', err);
    return new Response(JSON.stringify({ error: err.message, achievements: [] }), { status: 500 });
  }
};