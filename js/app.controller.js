import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { storageService } from './services/storage.service.js'

export const renderService = {
    renderPlaces
}

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

function onInit() {
    const urlParams = new URLSearchParams(window.location.search)
    const lat = parseFloat(urlParams.get('lat'))
    const lng = parseFloat(urlParams.get('lng'))
    console.log("Parsed lat and lng from URL: ", lat, lng)

    if (lat && lng) {
        mapService.initMap(lat, lng)
            .then(() => {
                console.log('Map is ready at custom location')
            })
            .catch(() => {
                console.log('Error: cannot init map at custom location')
            })
    } else {
        mapService.initMap()
            .then(() => {
                console.log('Map is ready at default location')
            })
            .catch(() => {
                console.log('Error: cannot init map at default location')
            })
    }

    window.addEventListener('resize', function () {
        renderPlaces(gLocations)
    })
}

function renderPlaces(locations) {
    const elLocationsList = document.querySelector('.locs')

    if (window.innerWidth <= 360) {
        renderAsCards(locations, elLocationsList)
    } else {
        renderAsTable(locations, elLocationsList)
    }
}

function renderAsTable(locations, containerElement) {
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
                    <div class="action-buttons">
                        <button class="go-button" onclick="onGoToLocation(${location.id})"><i class="fa-solid fa-magnifying-glass-location"></i></button>
                        <button class="x-button" onclick="onRemoveLocation(${location.id})"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </td>
            </tr>
        `
    })
    strHTML += `
            </tbody>
        </table>
    `
    containerElement.innerHTML = strHTML
}

function renderAsCards(locations, containerElement) {
    let strHTML = '<div class="card-container">'
    locations.forEach(location => {
        strHTML += `
            <div class="card">
                <h3>${location.name}</h3>
                <p>ID: ${location.id}</p>
                <p>Latitude: ${location.lat}</p>
                <p>Longitude: ${location.lng}</p>
                <p>Last Updated: ${location.updatedAt}</p>
                <div class="action-buttons">
                    <button class="go-button" onclick="onGoToLocation(${location.id})"><i class="fa-solid fa-magnifying-glass-location"></i></button>
                    <button class="x-button" onclick="onRemoveLocation(${location.id})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `
    })
    strHTML += '</div>'
    containerElement.innerHTML = strHTML
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker() {
    mapService.addMarker()
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
            gMyLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            document.querySelector('.user-pos').innerText =
                `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
            mapService.addMarker('you are here!', pos.coords.latitude, pos.coords.longitude)
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
    renderPlaces(gLocations)
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
    if (gMyLoc && gMyLoc.lat && gMyLoc.lng) {
        const url = getShareableLink(gMyLoc.lat, gMyLoc.lng)
        navigator.clipboard.writeText(url).then(() => {
            console.log('Link copied to clipboard')
        }).catch(err => {
            console.log('Failed to copy location: ', err)
        })
    }
}

function getShareableLink(lat, lng) {
    const baseUrl = 'https://valeriy-kuvshinov.github.io/Travel-Tips/'
    return `${baseUrl}?lat=${lat}&lng=${lng}`
}

function onGetLocation(locationName = 'Israel') {
    const locURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyC7kbcv3mlfnqs-Miz4tMbqXbrMhvdwWzA`
    axios.get(locURL).then(res => {
        mapService.addLocation(locationName, res.data.results[1].geometry.location.lat, res.data.results[1].geometry.location.lng)
        mapService.panTo(res.data.results[1].geometry.location.lat, res.data.results[1].geometry.location.lng)
        storageService.save(STORAGE_KEY, gLocations)
    })
}

function updateURLParams() {
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.set('lng', gLocations.lng)
    currentParams.set('lat', gLocations.lat)
}