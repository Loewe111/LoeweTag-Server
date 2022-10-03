const { contextBridge, ipcRenderer } = require('electron')

function data(number1){
    console.log("Thing Done" + number1 + anothernummer)
    return "Thing Done" + number1
}

contextBridge.exposeInMainWorld('devices', {
    getDevices: () => ipcRenderer.invoke('devices:getDevices')
  })

contextBridge.exposeInMainWorld('serial', {
    getDevices: () => ipcRenderer.invoke('serial:getDevices'),
    connectTo: (port) => ipcRenderer.invoke('serial:connectTo', port),
    disconnect: () => ipcRenderer.invoke('serial:disconnect'),
    getState: () => ipcRenderer.invoke('serial:getState')
  })

  contextBridge.exposeInMainWorld('game', {
    getGamemodes: () => ipcRenderer.invoke('game:getGamemodes'),
    getState: () => ipcRenderer.invoke('game:getState'),
    startGame: () => ipcRenderer.invoke('game:startGame'),
    stopGame: () => ipcRenderer.invoke('game:stopGame'),
    selectGame: (gameid) => ipcRenderer.invoke('game:selectGame', gameid)
  })

window.addEventListener('DOMContentLoaded', () => {
    // Preload Code
  })