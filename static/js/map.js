/* map.js — Mapa Orizaba ↔ Minatitlán con Leaflet (sin API key) */
(function () {
  const el = document.getElementById('distanceMap');
  if (!el || typeof L === 'undefined') return;

  const orizaba    = [18.8511, -97.0992];
  const minatitlan = [17.9892, -94.5511];
  const centro     = [(orizaba[0]+minatitlan[0])/2, (orizaba[1]+minatitlan[1])/2];

  const map = L.map(el, { center: centro, zoom: 8, scrollWheelZoom: false });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CartoDB', maxZoom: 19,
  }).addTo(map);

  const mkIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.3);display:grid;place-items:center;font-size:13px"><span style="transform:rotate(45deg)">💙</span></div>`,
    iconSize: [30,30], iconAnchor: [15,30],
  });

  L.marker(orizaba,    { icon: mkIcon('#e6b8c2') }).addTo(map).bindPopup('<b>Orizaba</b> — tú estás aquí 💙');
  L.marker(minatitlan, { icon: mkIcon('#4a7a99') }).addTo(map).bindPopup('<b>Minatitlán</b> — ella está aquí 💙');
  L.polyline([orizaba, minatitlan], { color:'#7ba9c9', weight:3, dashArray:'8 10', opacity:.9 }).addTo(map);
  map.fitBounds([orizaba, minatitlan], { padding:[44,44] });

  // Haversine
  function haversine(a, b) {
    const R = 6371, dLat=(b[0]-a[0])*Math.PI/180, dLon=(b[1]-a[1])*Math.PI/180;
    const x = Math.sin(dLat/2)**2 + Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  }
  const km = document.getElementById('mapKm');
  if (km) km.textContent = Math.round(haversine(orizaba, minatitlan));
})();
