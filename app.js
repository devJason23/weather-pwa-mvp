import { initRadar, fetchKSGFAlerts } from './radar.js';

// Springfield, MO coordinates
const LAT = 37.2090;
const LON = -93.2923;
// Use Open-Meteo (free, no API key required)
const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FChicago`;

const weatherDiv = document.getElementById('weather');
const alertsDiv = document.getElementById('alerts');

const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  95: '⚡ Thunderstorm', 96: '⚡ Thunderstorm with hail', 99: '⚡ Heavy thunderstorm'
};

async function fetchWeather() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const current = data.current_weather;
    const code = current.weathercode;
    const desc = WMO_CODES[code] || 'Unknown';
    const isStorm = [95, 96, 99].includes(code);

    weatherDiv.innerHTML = `
      <div class="card${isStorm ? ' storm' : ''}">
        ${isStorm ? '<div style="color:#ff4444;font-weight:bold;font-size:1.2em">⚠️ STORM ALERT</div>' : ''}
        <div class="temp">${Math.round(current.temperature)}°F</div>
        <div class="desc">${desc}</div>
        <div style="margin-top:10px;">💨 Wind: ${current.windspeed} mph</div>
        <div style="font-size:0.8em;color:#666;margin-top:10px;">Springfield, MO · ${new Date().toLocaleTimeString()}</div>
      </div>
    `;
  } catch (err) {
    weatherDiv.innerHTML = `<p style="color:red">Error loading weather: ${err.message}</p>`;
  }
}

async function updateAlerts() {
  try {
    const alerts = await fetchKSGFAlerts();
    const count = alerts.length;
    alertsDiv.textContent = count === 0
      ? 'Active NWS alerts: 0'
      : `Active NWS alerts: ${count}`;
  } catch (err) {
    alertsDiv.textContent = `Alerts unavailable: ${err.message}`;
  }
}

const map = L.map('map').setView([LAT, LON], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);
initRadar(map);

fetchWeather();
updateAlerts();
setInterval(fetchWeather, 300000); // Refresh every 5 minutes
setInterval(updateAlerts, 300000); // Refresh every 5 minutes
