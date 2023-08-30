import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { storageService } from './services/storage.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onGoToUserPos = onGoToUserPos
window.onGoToLocation = onGoToLocation
window.onRemoveLocation = onRemoveLocation

window.url='https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyC7kbcv3mlfnqs-Miz4tMbqXbrMhvdwWzA'

window.gMyLoc={}

function onInit() {
    mapService.initMap()
        .then(() => {
            console.log('Map is ready')
        })
        .catch(() => console.log('Error: cannot init map'))
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker() {
    console.log('Adding a marker')
    mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 })
}

function onGetLocs() {
    locService.getLocs()
        .then(locs => {
            console.log('Locations:', locs)
            document.querySelector('.locs').innerText = JSON.stringify(locs, null, 2)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords)
            document.querySelector('.user-pos').innerText =
                `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}

function onGoToLocation(id){
    const locations=storageService.load(STORAGE_KEY)
    mapService.initMap(locations[id-1].lat,locations[id-1].lng)
}

function onRemoveLocation(id){
    const locations=storageService.load(STORAGE_KEY)
    locations.splice(id-1,1)
    mapService.renderPlaces(locations)
    storageService.save(STORAGE_KEY,locations)
}

function onGoToUserPos() {
    mapService.initMap(gMyLoc.lat,gMyLoc.lng)
}

function onPanTo() {
    console.log('Panning the Map')
    mapService.panTo(35.6895, 139.6917)
}

function gotoisrael(){
    //'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyC7kbcv3mlfnqs-Miz4tMbqXbrMhvdwWzA'
}