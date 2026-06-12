/** Open-Meteo Geocoding API で住所・地名を緯度経度に変換する */
export async function geocode(name: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', name);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'ja');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    const first = data.results?.[0];
    if (!first) return null;

    return { lat: first.latitude, lng: first.longitude };
  } catch {
    return null;
  }
}
