import { storageService } from './storage.service.js'
import { renderService } from '../app.controller.js'

export const mapService = {
    initMap,
    addMarker,
    panTo,
    addLocation
}

// Var that is used throughout this Module (not global)
var gMap
window.STORAGE_KEY = 'locations'
window.gLocations = storageService.load(STORAGE_KEY) || []

function initMap(lat = 32.0749831, lng = 34.9120554) {
    navigator.geolocation.getCurrentPosition(showLocation, handleLocationError)
    renderService.renderPlaces(gLocations)
    return _connectGoogleApi()
        .then(() => {
            console.log('google available')
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            gMap.addListener('click', ev => {
                const name = prompt('Place name?', 'Place 1')
                if (!name) return

                const lat = ev.latLng.lat()
                const lng = ev.latLng.lng()
                addLocation(name, lat, lng, gMap.getZoom())
                addMarker(name, lat, lng)
                renderService.renderPlaces(gLocations)
            })
        })
}

function addMarker(name = 'hello world', lat, lng) {
    let loc
    if (!lat || !lng) {
        const center = gMap.getCenter()
        loc = { lat: center.lat(), lng: center.lng() }
        console.log('Using center of map for marker')
    }
    else loc = { lat, lng }
    console.log('Adding a marker at', loc)

    // Define the SVG path for the marker
    const svgMarker = {
        path: 'M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480V317.1c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32z',
        fillColor: 'red',
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 0.075,
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(0, 0)
    }
    // Create the marker
    const marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        icon: svgMarker,
        title: name
    })
    return marker
}

function addLocation(name, lat, lng) {
    var location = createLocation(name, lat, lng)
    gLocations.push(location)
    renderService.renderPlaces(gLocations)
    storageService.save(STORAGE_KEY, gLocations)
}

function createLocation(name, lat, lng) {
    return { id: gLocations.length + 1, name, lat, lng, createdAt: Date.now(), updatedAt: Date.now() }
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
}

function showLocation({ coords }) {
    const { latitude: lat, longitude: lng } = coords
    if (gMyLoc === undefined) {
        gMyLoc = { lat: lat, lng: lng }
    }
}

function handleLocationError(err) {
    var errMsg = ''
    switch (err.code) {
        case 1:
            errMsg = 'The user didn\'t allow this page to retrieve a location.'
            break
        case 2:
            errMsg = 'Unable to determine your location: ' + err.message
            break
        case 3:
            errMsg = 'Timed out before retrieving the location.'
            break
    }
    const elMsg = document.querySelector('.err-msg')
    elMsg.innerHTML = errMsg
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    // const API_KEY = '' //TODO: Enter your API Key
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAe86zmZ8GyA3TjyJEVlCdbPyQuyEDEDgU`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}