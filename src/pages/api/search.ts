export const prerender = false;

import { searchGames } from '../../lib/rawg';

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const genres = url.searchParams.get('genres') || '';
  const platforms = url.searchParams.get('platforms') || '';
  const ordering = url.searchParams.get('ordering') || '-relevance';

  // Si no hay término de búsqueda ni filtros aplicados, devolver arreglo vacío
  if (!query && !genres && !platforms) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const results = await searchGames({ query, genres, platforms, ordering });

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}