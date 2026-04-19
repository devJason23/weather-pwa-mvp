const RADAR_TILE_URL = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png';
const KSGF_ALERTS_URL = 'https://api.weather.gov/alerts/active?point=37.2090,-93.2923';

export function initRadar(map) {
  return L.tileLayer(RADAR_TILE_URL, {
    attribution: 'NEXRAD composite radar © Iowa Environmental Mesonet',
    opacity: 0.65,
    maxZoom: 12,
    zIndex: 10,
  }).addTo(map);
}

export async function fetchKSGFAlerts() {
  const response = await fetch(KSGF_ALERTS_URL, {
    headers: {
      Accept: 'application/geo+json',
    },
  });

  if (!response.ok) {
    throw new Error(`NWS alerts request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data.features) ? data.features : [];
}
