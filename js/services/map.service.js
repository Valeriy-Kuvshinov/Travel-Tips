import { storageService } from './storage.service.js'

export const mapService = {
    initMap,
    addMarker,
    panTo,
    addLocation,
    renderPlaces
}

// Var that is used throughout this Module (not global)
var gMap
window.STORAGE_KEY = 'locations'
window.gLocations = storageService.load(STORAGE_KEY) || []

function initMap(lat = 32.0749831, lng = 34.9120554) {
    navigator.geolocation.getCurrentPosition(showLocation, handleLocationError)
    renderPlaces(gLocations)
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
                const lat = ev.latLng.lat()
                const lng = ev.latLng.lng()
                addLocation(name, lat, lng, gMap.getZoom())
                renderPlaces(gLocations)
            })
        })
}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    })
    return marker
}

function addLocation(name, lat, lng) {
    var location = createLocation(name, lat, lng)
    gLocations.push(location)
    renderPlaces(gLocations)
    storageService.save(STORAGE_KEY, gLocations)
}

function createLocation(name, lat, lng){
    return { id: gLocations.length + 1, name, lat, lng, createdAt: Date.now(), updatedAt: Date.now() }
}

function renderPlaces(locations) {
    const elLocationsList = document.querySelector('.locs')
    let strHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `
    locations.forEach(location => {
        strHTML += `
            <tr>
                <td>${location.id}</td>
                <td>${location.name}</td>
                <td>${location.lat}</td>
                <td>${location.lng}</td>
                <td>${location.updatedAt}</td>
                <td>
                    <button class="go-button" onclick="onGoToLocation(${location.id})">Go</button>
                    <button class="x-button" onclick="onRemoveLocation(${location.id})">X</button>
                </td>
            </tr>
        `
    })
    strHTML += `
            </tbody>
        </table>
    `
    elLocationsList.innerHTML = strHTML
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
}

function showLocation({coords}) {
    const { latitude: lat, longitude: lng} = coords
    if(gMyLoc===undefined){
        gMyLoc={lat:lat,lng:lng}
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