const RAWG_API_KEY = import.meta.env.RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

export async function searchGames(query) {
  if (!query) return [];
  
  const apiKey = import.meta.env.RAWG_API_KEY;
  if (!apiKey) {
    console.error('RAWG_API_KEY no está definida en el archivo .env');
    return [];
  }
  
  try {
    const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=12`);
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