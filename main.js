const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')

devices = {}
ser = NaN

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('ui/index.html')

  ipcMain.handle('devices:getDevices', ()=> {
    devices[Math.floor(Math.random() * 11)] = {
      type: "gun",
      teamId: 4,
      firmware: 0.2,
      firmwareString: "v0.2"
    }//test
    return devices
  })

  ipcMain.handle("serial:getDevices", ()=> {
    return SerialPort.list()
  })

  ipcMain.handle("serial:connectTo", (event, port)=> {
    ser = new SerialPort({path: port, baudRate: 115200})
  })

  ipcMain.handle("serial:getState", () => {
    return{
      isOpen: ser.isOpen,
      path: ser.path,
      baudRate: ser.baudRate
    }
  })
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    console.error("Closing App")
    app.quit()  //Quit app when window is closed
})
