import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { storageService } from './services/storage.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onSearch = onSearch
window.onGetLocation = onGetLocation
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onGoToUserPos = onGoToUserPos
window.onGoToLocation = onGoToLocation
window.onRemoveLocation = onRemoveLocation
window.onCopyLocation = onCopyLocation

window.url = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyC7kbcv3mlfnqs-Miz4tMbqXbrMhvdwWzA'

window.gMyLoc = {}
window.gMyLoc = {}

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

function onGoToLocation(id) {
    mapService.initMap(gLocations[id - 1].lat, gLocations[id - 1].lng)
}

function onRemoveLocation(id) {
    const index = gLocations.findIndex(locId => locId === id)
    gLocations.splice(index, 1)
    mapService.renderPlaces(gLocations)
    storageService.save(STORAGE_KEY, gLocations)
}

function onGoToUserPos() {
    mapService.initMap(gMyLoc.lat, gMyLoc.lng)
}

function onPanTo() {
    console.log('Panning the Map')
    mapService.panTo(35.6895, 139.6917)
}

function onSearch() {
    const search = document.getElementById('addressInput').value
    onGetLocation(search)
}

function onCopyLocation() {
    const element = document.getElementById('addressInput');
    element.select();
    element.setSelectionRange(0, 99999);
    document.execCommand('copy');
}

function onGetLocation(locationName = 'Israel') {
    const locURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyC7kbcv3mlfnqs-Miz4tMbqXbrMhvdwWzA`
    axios.get(locURL).then(res => {
        mapService.addLocation(locationName, res.data.results[1].geometry.location.lat, res.data.results[1].geometry.location.lng)
        mapService.panTo(res.data.results[1].geometry.location.lat, res.data.results[1].geometry.location.lng)
        storageService.save(STORAGE_KEY, gLocations)
    })
}

function updateURLParams(filterBy) {
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.set('searchTerm', filterBy.searchTerm)
    currentParams.set('minRate', filterBy.minRate)
    currentParams.set('minPrice', filterBy.minPrice)
    const lang = currentParams.get('lang')
    if (lang) currentParams.set('lang', lang)
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${currentParams.toString()}`
    window.history.pushState({ path: newUrl }, '', newUrl)
}