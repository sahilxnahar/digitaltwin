// Singleton loader for the Google Maps JS API (+ Places library).
// IMPORTANT: we never instantiate a map — services are bound to detached
// DOM nodes so nothing ever touches our Deck.gl / three.js canvases.

let loaderPromise = null

export function loadGoogleMaps() {
  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve(window.google)
  }
  if (loaderPromise) return loaderPromise

  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
  if (!key || key.startsWith('PASTE_')) {
    return Promise.reject(new Error('missing VITE_GOOGLE_MAPS_KEY'))
  }

  loaderPromise = new Promise((resolve, reject) => {
    const cb = '__ameyaGmapsReady'
    window[cb] = () => {
      delete window[cb]
      resolve(window.google)
    }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly&loading=async&callback=${cb}`
    s.async = true
    s.onerror = () => {
      loaderPromise = null
      reject(new Error('Google Maps JS failed to load'))
    }
    document.head.appendChild(s)
  })
  return loaderPromise
}
