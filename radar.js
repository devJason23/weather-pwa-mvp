// NEXRAD Radar + NWS Alerts for Springfield, MO
// KSGF radar coverage via Iowa Environmental Mesonet (free, no API key)

const NEXRAD_TILE_URL = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png';
const NWS_ALERTS_URL = 'https://api.weather.gov/alerts/active?point=37.2090,-93.2923';

let radarLayer = null;

/**
 * Initialize NEXRAD radar overlay on a Leaflet map
 * @param {L.Map} map - Leaflet map instance
 */
function initRadar(map) {
  radarLayer = L.tileLayer(NEXRAD_TILE_URL, {
    attribution: 'NEXRAD via <a href="https://mesonet.agron.iastate.edu/">Iowa Mesonet</a>',
    opacity: 0.6,
    zIndex: 10
  });
  radarLayer.addTo(map);

  // Refresh radar every 5 minutes
  setInterval(() => {
    if (radarLayer) {
      radarLayer.setUrl(NEXRAD_TILE_URL + '?t=' + Date.now());
    }
  }, 300000);

  console.log('NEXRAD radar layer initialized for KSGF coverage');
}

/**
 * Fetch active NWS alerts for Springfield, MO
 * @returns {Promise<Array>} Array of active alert objects
 */
async function fetchKSGFAlerts() {
  try {
    const res = await fetch(NWS_ALERTS_URL, {
      headers: { 'User-Agent': 'WeatherPWA/1.0 (murraydeanjordan@gmail.com)' }
    });
    if (!res.ok) throw new Error(`NWS API error: ${res.status}`);
    const data = await res.json();
    const alerts = data.features || [];

    const alertsDiv = document.getElementById('alerts');
    if (alertsDiv) {
      if (alerts.length === 0) {
        alertsDiv.innerHTML = '<div style="color:#4caf50">✅ No active alerts for Springfield, MO</div>';
      } else {
        alertsDiv.innerHTML = alerts.map(a => {
          const props = a.properties;
          const severity = props.severity;
          const color = severity === 'Extreme' ? '#ff1744' : severity === 'Severe' ? '#ff5722' : '#ff9800';
          return `<div class="alert-card" style="border-left:4px solid ${color};padding:10px;margin:8px 0;background:#1b2a3b;border-radius:4px;">
            <strong style="color:${color}">${props.event}</strong>
            <div style="font-size:0.85em;color:#aaa">${props.headline || ''}</div>
            <div style="font-size:0.75em;color:#666">Expires: ${new Date(props.expires).toLocaleString()}</div>
          </div>`;
        }).join('');
      }
    }

    return alerts;
  } catch (err) {
    console.error('Failed to fetch NWS alerts:', err);
    const alertsDiv = document.getElementById('alerts');
    if (alertsDiv) alertsDiv.innerHTML = `<div style="color:#aaa">⚠️ Alerts unavailable: ${err.message}</div>`;
    return [];
  }
}
