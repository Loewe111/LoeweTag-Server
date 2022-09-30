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
    getState: () => ipcRenderer.invoke('serial:getState')
  })


window.addEventListener('DOMContentLoaded', () => {
    // Preload Code
  })