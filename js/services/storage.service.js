'use strict'

export const storageService={
    save: saveToStorage,
    load: loadFromStorage
}

function saveToStorage(key, value) {
    const str = JSON.stringify(value);
    localStorage.setItem(key, str);
}

function loadFromStorage(key) {
    const str = localStorage.getItem(key)
    return JSON.parse(str)
}