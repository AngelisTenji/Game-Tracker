export const prerender = false;

import { searchGames } from '../../lib/rawg';

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  
  if (!query) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const results = await searchGames(query);
  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}