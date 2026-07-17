// ═══ Multi-city registry — Ameya Heights portfolio ═══
// Everything geographic lives here. config.js exposes the ACTIVE city's
// values as constants; switching city persists the choice and reloads so
// every module re-derives cleanly (the branded loading screen covers it).

export const CITIES = {
  chennai: {
    id: 'chennai',
    city: 'Chennai',
    placeName: 'Ameya Heights',
    lat: 13.0827,
    lng: 80.2707,
    aerialAddress: 'Chennai, Tamil Nadu, India',
    dataGovCity: 'Chennai',
    model: 'models/ameya_heights_chennai_v1.glb',
    sun: { rise: 5.9, set: 18.4 },
    hint: 'zoom into central Chennai (z≥15) to enter the site',
    loadingSub: 'DIGITAL TWIN · CHENNAI · LUXURY RESIDENCES',
    macroView: { longitude: 80.235, latitude: 13.02, zoom: 10.4, pitch: 45, bearing: -12 },
    roadNamesX: { '-150': 'College Road', '-40': 'Sterling Road', '110': 'Pantheon Road' },
    roadNamesZ: { '-150': 'Poonamallee High Road', '-30': 'Anna Salai', '110': 'Cathedral Road' },
    landmarks: {
      campus: 'Loyola College',
      complex: 'Express Avenue · Pantheon Rd',
      park: 'Nungambakkam',
    },
    signboards: [
      { title: 'AMEYA HEIGHTS', sub: 'Chennai — 600034', position: [-64, 0, -52], rotationY: Math.PI / 4, width: 13 },
      { title: 'Gemini Circle', sub: 'Anna Salai', position: [-16, 0, -52], rotationY: -Math.PI / 4, width: 11 },
      { title: 'Loyola College', sub: 'Poonamallee High Road', position: [-95, 0, -160], width: 13 },
      { title: 'Poonamallee High Road', position: [40, 0, -160], width: 10 },
      { title: 'College Road', position: [-160, 0, 20], rotationY: Math.PI / 2, width: 12 },
      { title: 'Sterling Road', position: [-50, 0, -105], rotationY: Math.PI / 2, width: 9 },
      { title: 'Cathedral Road', position: [60, 0, 120], rotationY: Math.PI, width: 10 },
      { title: 'Pantheon Road', position: [120, 0, 60], rotationY: -Math.PI / 2, width: 10 },
    ],
    arterials: [
      { name: 'Anna Salai (Mount Road)', color: [255, 176, 64],
        path: [[80.287, 13.086], [80.27, 13.062], [80.257, 13.043], [80.243, 13.023], [80.22, 13.007], [80.201, 12.995]] },
      { name: 'GST Road → Airport', color: [255, 176, 64],
        path: [[80.201, 12.995], [80.18, 12.985], [80.165, 12.955], [80.15, 12.92]] },
      { name: 'OMR · Rajiv Gandhi Salai', color: [90, 200, 255],
        path: [[80.245, 13.006], [80.243, 12.965], [80.228, 12.9], [80.22, 12.84]] },
      { name: 'East Coast Road', color: [90, 200, 255],
        path: [[80.259, 12.985], [80.255, 12.94], [80.245, 12.87]] },
      { name: 'Poonamallee High Road', color: [255, 176, 64],
        path: [[80.27, 13.082], [80.23, 13.077], [80.19, 13.06], [80.15, 13.048]] },
      { name: 'Inner Ring Road', color: [90, 200, 255],
        path: [[80.2, 13.115], [80.195, 13.06], [80.2, 13.01], [80.21, 12.985]] },
      { name: 'EVR Salai → Ennore', color: [255, 176, 64],
        path: [[80.28, 13.095], [80.295, 13.125], [80.32, 13.165]] },
      { name: 'Kamarajar Salai (Marina)', color: [90, 214, 125],
        path: [[80.284, 13.055], [80.28, 13.02], [80.276, 12.995]] },
      { name: 'Cathedral Road · Dr RK Salai', color: [90, 214, 125],
        path: [[80.25, 13.045], [80.265, 13.035], [80.278, 13.03]] },
      { name: 'Nungambakkam High Road', color: [90, 214, 125],
        path: [[80.24, 13.06], [80.25, 13.07], [80.26, 13.08]] },
    ],
    hotspots: [
      { id: 'guindy', name: 'Guindy · ITC Grand Chola', lng: 80.2206, lat: 13.0103, radius: 900, zoom: 14.6,
        pois: [
          { name: 'ITC Grand Chola', lng: 80.2206, lat: 13.0103 },
          { name: 'Olympia Tech Park', lng: 80.2098, lat: 13.0125 },
          { name: 'Guindy National Park', lng: 80.2295, lat: 13.0045 },
        ] },
      { id: 'nungambakkam', name: 'Nungambakkam · Taj Coromandel', lng: 80.2438, lat: 13.0555, radius: 850, zoom: 14.7,
        pois: [
          { name: 'Taj Coromandel', lng: 80.2436, lat: 13.0553 },
          { name: 'Khader Nawaz Khan Road', lng: 80.2452, lat: 13.0601 },
          { name: 'Sterling Road Junction', lng: 80.2402, lat: 13.0623 },
        ] },
      { id: 'connemara', name: 'Anna Salai · Taj Connemara', lng: 80.2612, lat: 13.0632, radius: 850, zoom: 14.7,
        pois: [
          { name: 'Taj Connemara', lng: 80.2609, lat: 13.0629 },
          { name: 'Express Avenue Mall', lng: 80.2646, lat: 13.0588 },
          { name: 'LIC Building · Anna Salai', lng: 80.2705, lat: 13.0637 },
        ] },
      { id: 'tnagar', name: 'T. Nagar Retail District', lng: 80.2341, lat: 13.0418, radius: 900, zoom: 14.6,
        pois: [
          { name: 'Panagal Park', lng: 80.2337, lat: 13.0402 },
          { name: 'Pondy Bazaar', lng: 80.2405, lat: 13.0425 },
        ] },
      { id: 'omr', name: 'OMR · Tidel Park', lng: 80.2496, lat: 12.9902, radius: 1000, zoom: 14.4,
        pois: [
          { name: 'Tidel Park', lng: 80.2496, lat: 12.9902 },
          { name: 'Madhya Kailash Junction', lng: 80.2432, lat: 13.0063 },
        ] },
    ],
  },

  bengaluru: {
    id: 'bengaluru',
    city: 'Bengaluru',
    placeName: 'Ameya Heights',
    // SITE: 1st Block, 494, 15th Main Rd, 3rd Stage, Basaveshwar Nagar, 560079
    // ← for pinpoint accuracy: Google Maps → right-click your plot →
    //   click the coordinates to copy → paste them here (lat, lng)
    lat: 12.9871,
    lng: 77.525,
    aerialAddress: '494, 15th Main Rd, 3rd Stage, Basaveshwar Nagar, Bengaluru, Karnataka 560079',
    dataGovCity: 'Bengaluru',
    model: 'models/ameya_heights_bengaluru_v1.glb',
    sun: { rise: 6.1, set: 18.6 },
    hint: 'zoom into Basaveshwar Nagar 3rd Stage (z≥15) to enter the site',
    loadingSub: 'DIGITAL TWIN · BENGALURU · LUXURY RESIDENCES',
    macroView: { longitude: 77.62, latitude: 13.04, zoom: 10, pitch: 45, bearing: -12 },
    roadNamesX: { '-150': 'Kamakshipalya Main Road', '-40': '8th Main Road', '110': 'West of Chord Road' },
    roadNamesZ: { '-150': 'Modi Hospital Road', '-30': 'Siddaiah Puranik Road', '110': 'Magadi Main Road' },
    landmarks: {
      campus: 'KLE S. Nijalingappa College',
      complex: 'Havanur Complex · West of Chord Rd',
      park: 'Basaveshwar Nagar',
    },
    signboards: [
      { title: 'AMEYA HEIGHTS', sub: 'Bengaluru — 560079', position: [-64, 0, -52], rotationY: Math.PI / 4, width: 13 },
      { title: 'Havanur Circle', sub: 'Siddaiah Puranik Road', position: [-16, 0, -52], rotationY: -Math.PI / 4, width: 11 },
      { title: 'KLE S. Nijalingappa College', sub: 'Modi Hospital Road', position: [-95, 0, -160], width: 13 },
      { title: 'Modi Hospital Road', position: [40, 0, -160], width: 10 },
      { title: 'Kamakshipalya Main Road', position: [-160, 0, 20], rotationY: Math.PI / 2, width: 12 },
      { title: '8th Main Road', position: [-50, 0, -105], rotationY: Math.PI / 2, width: 9 },
      { title: 'Magadi Main Road', position: [60, 0, 120], rotationY: Math.PI, width: 10 },
      { title: 'West of Chord Road', position: [120, 0, 60], rotationY: -Math.PI / 2, width: 10 },
    ],
    arterials: [
      { name: 'NH44 · Ballari Road (Hebbal)', color: [255, 176, 64],
        path: [[77.594, 12.984], [77.585, 13.011], [77.591, 13.036], [77.597, 13.078], [77.596, 13.102]] },
      { name: 'Old Madras Road → Whitefield', color: [255, 176, 64],
        path: [[77.62, 12.99], [77.66, 13.0], [77.7, 13.005], [77.716, 12.992], [77.75, 12.98]] },
      { name: 'Outer Ring Road (east)', color: [90, 200, 255],
        path: [[77.591, 13.036], [77.62, 13.045], [77.64, 13.035], [77.67, 13.02], [77.7, 13.005], [77.7, 12.956], [77.68, 12.93], [77.66, 12.91], [77.622, 12.917]] },
      { name: 'Outer Ring Road (west)', color: [90, 200, 255],
        path: [[77.591, 13.036], [77.55, 13.023], [77.52, 13.013], [77.51, 12.96], [77.52, 12.925], [77.55, 12.918], [77.585, 12.912], [77.622, 12.917]] },
      { name: 'Tumkur Road (NH48)', color: [255, 176, 64],
        path: [[77.571, 12.999], [77.54, 13.02], [77.52, 13.03], [77.47, 13.06]] },
      { name: 'Mysuru Road', color: [255, 176, 64],
        path: [[77.575, 12.955], [77.54, 12.94], [77.52, 12.92], [77.48, 12.9]] },
      { name: 'Hosur Road → Electronic City', color: [255, 176, 64],
        path: [[77.6, 12.95], [77.622, 12.917], [77.64, 12.885], [77.66, 12.85]] },
      { name: 'Magadi Road (Basaveshwar Nagar)', color: [90, 214, 125],
        path: [[77.575, 12.975], [77.555, 12.976], [77.539, 12.975], [77.5, 12.97]] },
      { name: 'West of Chord Road', color: [90, 214, 125],
        path: [[77.555, 13.01], [77.545, 12.995], [77.54, 12.98], [77.545, 12.96]] },
      { name: 'Old Airport Road', color: [255, 176, 64],
        path: [[77.62, 12.96], [77.65, 12.958], [77.7, 12.956]] },
    ],
    hotspots: [
      { id: 'ubcity', name: 'UB City · Vittal Mallya Rd', lng: 77.5964, lat: 12.9718, radius: 800, zoom: 14.8,
        pois: [
          { name: 'UB City Mall', lng: 77.5964, lat: 12.9718 },
          { name: 'Cubbon Park', lng: 77.5928, lat: 12.9763 },
        ] },
      { id: 'mgroad', name: 'MG Road · Trinity', lng: 77.6196, lat: 12.9737, radius: 900, zoom: 14.6,
        pois: [
          { name: 'MG Road Boulevard', lng: 77.6099, lat: 12.9747 },
          { name: 'Trinity Circle', lng: 77.6206, lat: 12.9732 },
        ] },
      { id: 'rajajinagar', name: 'Rajajinagar · Orion / WTC', lng: 77.5551, lat: 13.0113, radius: 850, zoom: 14.7,
        pois: [
          { name: 'World Trade Center', lng: 77.5551, lat: 13.0116 },
          { name: 'Orion Mall', lng: 77.554, lat: 13.0105 },
          { name: 'Sheraton Grand', lng: 77.5547, lat: 13.01 },
        ] },
      { id: 'whitefield', name: 'Whitefield · ITPL', lng: 77.7364, lat: 12.9857, radius: 1100, zoom: 14.2,
        pois: [
          { name: 'ITPL Tech Park', lng: 77.7374, lat: 12.9866 },
          { name: 'Phoenix Marketcity', lng: 77.6963, lat: 12.9959 },
        ] },
    ],
  },
}

const STORAGE_KEY = 'ameya.activeCity'

export function getActiveCityId() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && CITIES[v]) return v
  } catch { /* storage unavailable → default */ }
  return 'bengaluru' // the live project site is the default city
}

// Persist + full reload: every module re-derives its city constants and the
// branded loading screen covers the transition.
export function switchCity(id) {
  if (!CITIES[id] || id === getActiveCityId()) return
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch { /* still works for this session */ }
  window.location.reload()
}
