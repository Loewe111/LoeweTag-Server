const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('devices', { //Expose devices object to renderer
  getDevices: () => ipcRenderer.invoke('devices:getDevices')
})

contextBridge.exposeInMainWorld('serial', { //Expose serial object to renderer
  getDevices: () => ipcRenderer.invoke('serial:getDevices'),
  connectTo: (port) => ipcRenderer.invoke('serial:connectTo', port),
  disconnect: () => ipcRenderer.invoke('serial:disconnect'),
  getState: () => ipcRenderer.invoke('serial:getState')
})

contextBridge.exposeInMainWorld('game', { //Expose game object to renderer
  getGamemodes: () => ipcRenderer.invoke('game:getGamemodes'),
  getState: () => ipcRenderer.invoke('game:getState'),
  startGame: () => ipcRenderer.invoke('game:startGame'),
  stopGame: () => ipcRenderer.invoke('game:stopGame'),
  selectGame: (gameid) => ipcRenderer.invoke('game:selectGame', gameid),
  getPlayers: () => ipcRenderer.invoke('game:getPlayers'),
  setTeams: (teams) => ipcRenderer.invoke('game:setTeams',teams),
  getTeams: () => ipcRenderer.invoke('game:getTeams'),
  getScores: () => ipcRenderer.invoke('game:getScores'),
  setSettings: (settings) => ipcRenderer.invoke('game:setSettings', settings),
  getSettings: () => ipcRenderer.invoke('game:getSettings')
})

window.addEventListener('DOMContentLoaded', () => {
  // Preload Code
})