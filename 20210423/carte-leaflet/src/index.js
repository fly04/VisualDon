import L from 'leaflet'
import restaurants from './sion.json'

const map = L.map('map').setView([46.2311553, 7.3612789], 17)
const points_restau = restaurants.features.filter(d => d.geometry.type==="Point");  

// L.tileLayer(
//   'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}',
//   {
//     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     subdomains: 'abcd',
//     minZoom: 0,
//     maxZoom: 20,
//     ext: 'png',
//   })
//     .addTo(map)

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const icon = L.icon({
  iconUrl: 'https://icon-library.com/images/restaurant-icon/restaurant-icon-12.jpg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

L.geoJSON(restaurants, {
  pointToLayer: (feature, latlng) => L.marker(latlng, { icon }),
  onEachFeature: (feature, layer) => {
      layer.bindPopup(
          feature.properties.name || feature.properties["addr:street"] || feature.properties.uid
      );
  },
}).addTo(map);


/* Méthode alternative */
// points_restau.map(d => {
//   const [lon, lat] = d.geometry.coordinates;
//   L.marker([lat, lon], { icon }).bindPopup(d.properties.name || d.properties['addr:street'] || d.properties.uid).addTo(map);
// })

