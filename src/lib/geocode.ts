/**
 * Geocode a cross-street string using Nominatim (OpenStreetMap, free, no key).
 * Biased to London, ON.
 */
export async function geocodeCrossStreet(crossStreet: string): Promise<{ lat: number; lng: number } | null> {
  const query = `${crossStreet}, London, Ontario, Canada`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ca`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Plenty-Community-App/1.0 (exchange.clawyard.dev)',
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) return null;
    const results = await res.json();
    if (!results || results.length === 0) return null;

    const { lat, lon } = results[0];
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lon);

    // Sanity check: London ON is roughly 42.8–43.1 lat, -81.1 to -81.5 lng
    if (parsedLat < 42.7 || parsedLat > 43.2 || parsedLng < -81.7 || parsedLng > -80.9) {
      return null; // Outside London area — reject
    }

    return { lat: parsedLat, lng: parsedLng };
  } catch {
    return null;
  }
}

/**
 * Fuzz coordinates by 50–100m using post ID as a deterministic seed.
 * Same post always gets the same offset (consistent map pin).
 * 
 * At London ON's latitude (~43°N):
 *   1° latitude  ≈ 111,000m  → 0.0001° ≈ 11.1m
 *   1° longitude ≈  81,000m  → 0.0001° ≈  8.1m
 * 
 * 50m  ≈ 0.00045° lat, 0.00062° lng
 * 100m ≈ 0.00090° lat, 0.00123° lng
 */
export function fuzzCoordinates(lat: number, lng: number, postId: string): { lat: number; lng: number } {
  // Deterministic pseudo-random from post ID chars
  let seed = 0;
  for (let i = 0; i < postId.length; i++) {
    seed = (seed * 31 + postId.charCodeAt(i)) & 0xffffffff;
  }

  // Two independent values in [0,1)
  const r1 = Math.abs(Math.sin(seed * 9301 + 49297)) % 1;
  const r2 = Math.abs(Math.sin(seed * 7331 + 23729)) % 1;

  // Scale to 50–100m range, random direction
  const latOffsetDeg = (r1 * 0.00045 + 0.00045) * (seed % 2 === 0 ? 1 : -1);
  const lngOffsetDeg = (r2 * 0.00062 + 0.00062) * ((seed >> 1) % 2 === 0 ? 1 : -1);

  return {
    lat: lat + latOffsetDeg,
    lng: lng + lngOffsetDeg,
  };
}
