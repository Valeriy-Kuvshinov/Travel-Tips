import {storageService} from './storage.service.js'

export const mapService = {
    initMap,
    addMarker,
    panTo
}

window.onGoToLocation = onGoToLocation

// Var that is used throughout this Module (not global)
var gMap
const STORAGE_KEY='locations'
var gLocations=storageService.load(STORAGE_KEY) || []

function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap')
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

function addLocation(name,lat,lng){
    var location={id:gLocations.length+1,name,lat,lng,createdAt:Date.now(),updatedAt:Date.now()}
    gLocations.push(location)
    storageService.save(STORAGE_KEY,gLocations)
}

function renderPlaces(locations){
    const elLocationsList=document.querySelector('.locs')
    var strHTML=locations.map(location => {
        return `<p class="locationId">id:${location.id}</p>
                <p class="locationName">name:${location.name}</p>
                <p class="locationPos">lat:${location.lat},lng:${location.lng}</p>
                <p class="locationUpdateTime">${location.updatedAt}</p>
                <button onclick="onGoToLocation(${location.id})">Go</button>
                <button onclick="onRemoveLocation(${location.id})">Remove</button>`
    })
    elLocationsList.innerHTML=strHTML
}

function onGoToLocation(id){
    console.log(gLocations[id-1])
}
function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = '' //TODO: Enter your API Key
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAe86zmZ8GyA3TjyJEVlCdbPyQuyEDEDgU`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}