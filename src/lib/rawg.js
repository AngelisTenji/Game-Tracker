const BASE_URL = 'https://api.rawg.io/api';

/**
 * Busca videojuegos en la API de RAWG admitiendo término de búsqueda y filtros.
 * @param {Object|string} params - Parámetros de búsqueda o query directo
 */
export async function searchGames(params) {
  const apiKey = import.meta.env.RAWG_API_KEY;
  if (!apiKey) {
    console.error('RAWG_API_KEY no está definida en el archivo .env');
    return [];
  }

  // Normalizar parámetros (soporta paso de string directo o de objeto)
  const query = typeof params === 'string' ? params : (params?.query || '');
  const genres = typeof params === 'object' ? params?.genres : '';
  const platforms = typeof params === 'object' ? params?.platforms : '';
  const ordering = typeof params === 'object' ? params?.ordering : '-relevance';

  if (!query && !genres && !platforms) return [];

  try {
    let url = `${BASE_URL}/games?key=${apiKey}&page_size=12`;

    if (query) url += `&search=${encodeURIComponent(query)}`;
    if (genres) url += `&genres=${encodeURIComponent(genres)}`;
    if (platforms) url += `&parent_platforms=${encodeURIComponent(platforms)}`;
    if (ordering) url += `&ordering=${encodeURIComponent(ordering)}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Error HTTP en RAWG:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error al consultar RAWG API:', error);
    return [];
  }
}